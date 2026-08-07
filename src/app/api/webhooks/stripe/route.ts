import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { runAnalysis } from "@/lib/analyze";
import { audit } from "@/lib/audit";
import { reportError } from "@/lib/report-error";

// Stripe webhook: keeps `payments.status` and `reports.status` in sync with
// what actually happened in Stripe, and kicks off the AI analysis once a
// payment succeeds. Signature verification requires the raw request body, so
// this reads it via req.text() rather than req.json().
//
// Events handled (subscribe to exactly these in the Stripe dashboard):
//   checkout.session.completed          -> payment succeeded, run analysis
//   checkout.session.async_payment_failed -> delayed payment method failed
//   payment_intent.payment_failed       -> payment attempt failed
//   charge.refunded                     -> full or partial refund issued
//
// RESPONSE CONTRACT: Stripe retries any non-2xx for days. A 2xx means "I have
// durably handled or deliberately ignored this event" — so unmatched or
// irrelevant events return 200 with a log line, and only genuine transient
// failures (our DB is down) return 5xx to earn a retry. The previous version
// returned 404 for unmatched events, which made Stripe retry them until they
// expired and showed the endpoint as failing.

type PaymentStatus = "succeeded" | "failed" | "refunded";

export async function POST(req: Request) {
  // Constructed inside the handler (not at module scope) so this route
  // doesn't require STRIPE_SECRET_KEY to be set at build time.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // Resolves the `payments` row an event refers to. Checkout events carry a
  // session id; charge/PaymentIntent events carry only a PaymentIntent id,
  // which is why stripe_payment_intent_id is recorded on success (see
  // supabase/migrations/0004_payment_intent_correlation.sql).
  async function findPayment(opts: {
    sessionId?: string | null;
    paymentIntentId?: string | null;
  }) {
    if (opts.sessionId) {
      const { data } = await admin
        .from("payments")
        .select("*")
        .eq("stripe_session_id", opts.sessionId)
        .maybeSingle();
      if (data) return data;
    }
    if (opts.paymentIntentId) {
      const { data } = await admin
        .from("payments")
        .select("*")
        .eq("stripe_payment_intent_id", opts.paymentIntentId)
        .maybeSingle();
      if (data) return data;
    }
    return null;
  }

  function paymentIntentIdOf(
    value: string | Stripe.PaymentIntent | null | undefined,
  ): string | null {
    if (!value) return null;
    return typeof value === "string" ? value : value.id;
  }

  // Shared tail for the non-success outcomes (failed, refunded): records the
  // payment status and leaves it there.
  //
  // Deliberately does NOT revoke access to an already-analyzed report on
  // refund. Whether a refunded user keeps their analysis is a policy call,
  // not a technical one, and silently deleting something someone paid for is
  // the worse default of the two. The `refunded` status is recorded, so
  // revocation can be layered on here later if that's the policy.
  async function settle(
    payment: { id: string; report_id: string; status: string } | null,
    status: PaymentStatus,
    label: string,
  ) {
    if (!payment) {
      void reportError({
        event: "stripe_unmatched_event",
        severity: "error",
        error: `No payments row for ${label}`,
        context: { label, status },
      });
      return NextResponse.json({ received: true, matched: false });
    }

    if (payment.status === status) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const { error } = await admin
      .from("payments")
      .update({ status })
      .eq("id", payment.id);

    if (error) {
      void reportError({
        event: "payment_status_update_failed",
        severity: "error",
        error,
        context: { paymentId: payment.id, targetStatus: status },
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    void audit({
      action: status === "refunded" ? "payment_refunded" : "payment_failed",
      reportId: payment.report_id,
      req,
      metadata: { label },
    });

    console.warn(`[stripe] payment ${payment.id} marked ${status} (${label})`);
    return NextResponse.json({ received: true, status });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // A session can complete without being paid (e.g. a delayed payment
      // method still processing). Only treat genuinely-paid sessions as
      // success — async_payment_failed/succeeded covers the rest.
      if (session.payment_status !== "paid") {
        console.warn(
          `[stripe] session ${session.id} completed with payment_status=${session.payment_status} — not marking paid`,
        );
        return NextResponse.json({ received: true });
      }

      const payment = await findPayment({ sessionId: session.id });
      if (!payment) {
        // Nothing to reconcile against — a session created outside this app,
        // or a row deleted since. Retrying won't conjure the row, so ack it.
        void reportError({
          event: "stripe_paid_session_unmatched",
          // A completed Checkout Session with no local row means someone paid
          // and there is nothing here to fulfil.
          severity: "fatal",
          error: `No payments row for completed session ${session.id}`,
          context: { sessionId: session.id },
        });
        return NextResponse.json({ received: true, matched: false });
      }

      // Idempotency: Stripe delivers duplicates, and re-running a paid
      // analysis would burn another Claude call and overwrite good output.
      if (payment.status === "succeeded") {
        return NextResponse.json({ received: true, duplicate: true });
      }

      const { error: paymentError } = await admin
        .from("payments")
        .update({
          status: "succeeded",
          stripe_payment_intent_id: paymentIntentIdOf(session.payment_intent),
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : null,
        })
        .eq("id", payment.id);

      if (paymentError) {
        // Transient DB failure — let Stripe retry rather than silently
        // leaving a paid customer marked pending.
        void reportError({
          event: "payment_success_write_failed",
          severity: "fatal",
          error: paymentError,
          context: { paymentId: payment.id, reportId: payment.report_id },
        });
        return NextResponse.json({ error: paymentError.message }, { status: 500 });
      }

      const { error: reportUpdateError } = await admin
        .from("reports")
        .update({ status: "paid" })
        .eq("id", payment.report_id);

      if (reportUpdateError) {
        void reportError({
          event: "report_paid_write_failed",
          severity: "fatal",
          error: reportUpdateError,
          context: { reportId: payment.report_id },
        });
        return NextResponse.json({ error: reportUpdateError.message }, { status: 500 });
      }

      void audit({
        action: "report_purchased",
        userId: payment.user_id,
        reportId: payment.report_id,
        req,
        metadata: { amount_cents: payment.amount_cents, stripe_session_id: session.id },
      });

      // Step 5 of the core flow (BUILD.md): analysis runs in-process right
      // after payment succeeds. A failure here must NOT fail the webhook —
      // Stripe would retry the whole payment event and re-run a successful
      // payment's side effects just because a downstream AI call failed.
      // runAnalysis marks the report `error` on failure (so /processing can
      // surface it) and it can be re-run via the internal /api/analyze route.
      try {
        // runAnalysis reports its own failures as fatal and marks the report
        // errored, so the returned result needs no handling here.
        await runAnalysis(payment.report_id);
      } catch (err) {
        void reportError({
          event: "analysis_threw",
          severity: "fatal",
          error: err,
          context: { reportId: payment.report_id },
        });
      }

      return NextResponse.json({ received: true });
    }

    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      return settle(
        await findPayment({
          sessionId: session.id,
          paymentIntentId: paymentIntentIdOf(session.payment_intent),
        }),
        "failed",
        `session ${session.id}`,
      );
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      return settle(
        await findPayment({ paymentIntentId: intent.id }),
        "failed",
        `payment_intent ${intent.id}`,
      );
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      return settle(
        await findPayment({ paymentIntentId: paymentIntentIdOf(charge.payment_intent) }),
        "refunded",
        `charge ${charge.id}`,
      );
    }

    default:
      // Subscribed to an event we don't act on. Ack so Stripe stops sending.
      return NextResponse.json({ received: true, ignored: event.type });
  }

}
