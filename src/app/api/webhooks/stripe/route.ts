import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { runAnalysis } from "@/lib/analyze";

// Stripe webhook: confirms payment for the Checkout Session created in
// src/app/api/checkout/route.ts. Signature verification requires the raw
// request body, so this reads it via req.text() rather than req.json().
//
// Subscribe exactly these five event types on the endpoint (Stripe Dashboard >
// Developers > Webhooks). Anything else is acknowledged and ignored:
//
//   checkout.session.completed                 -> payment succeeded, run analysis
//   checkout.session.async_payment_succeeded   -> same, for delayed methods (ACH)
//   checkout.session.async_payment_failed      -> mark payment failed
//   charge.refunded                            -> mark payment refunded
//   charge.updated                             -> secondary confirmation / refund catch
//
// Response-code policy: Stripe retries any non-2xx for ~3 days and disables
// endpoints that keep failing. So a 2xx here means "received and decided" —
// including cases where we deliberately do nothing. Only genuine transient
// infrastructure failures (a DB write that could succeed on retry) return 5xx.
// An unrecognised payment is logged and 200'd, never 404'd.
type Admin = ReturnType<typeof createAdminClient>;

function paymentIntentId(
  intent: string | Stripe.PaymentIntent | null,
): string | null {
  if (!intent) return null;
  return typeof intent === "string" ? intent : intent.id;
}

async function findPaymentBySession(admin: Admin, sessionId: string) {
  const { data } = await admin
    .from("payments")
    .select("id, report_id, status")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  return data;
}

async function findPaymentByCharge(admin: Admin, charge: Stripe.Charge) {
  const intentId = paymentIntentId(charge.payment_intent);
  if (intentId) {
    const { data } = await admin
      .from("payments")
      .select("id, report_id, status")
      .eq("stripe_payment_intent_id", intentId)
      .maybeSingle();
    if (data) return data;
  }

  // Fallback for charges created before stripe_payment_intent_id was recorded
  // (migration 0003). The report_id metadata comes from /api/checkout.
  const reportId = charge.metadata?.report_id;
  if (!reportId) return null;

  const { data } = await admin
    .from("payments")
    .select("id, report_id, status")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

// Idempotent success transition. The `.eq("status", "pending")` filter is the
// idempotency guard: Stripe redelivers events, and checkout.session.completed
// plus charge.updated can both describe the same successful payment. Only the
// first one to land matches a pending row, so analysis runs exactly once and a
// later event can never flip an already-refunded payment back to succeeded.
// Returns the row if this call performed the transition, otherwise null.
async function markSucceeded(
  admin: Admin,
  paymentId: string,
  paymentIntentId?: string,
  amountCents?: number,
) {
  const { data, error } = await admin
    .from("payments")
    .update({
      status: "succeeded",
      // Only known once Stripe has actually processed the payment (absent at
      // Checkout Session creation time, which is why /api/checkout can't set
      // it up front) — backfilled here so later charge.* events can resolve
      // this payment directly instead of falling back to report_id metadata.
      ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
      // /api/checkout records a flat 500 (the full $5 price) at session
      // creation, before the customer has had a chance to enter a promotion
      // code — so a discounted or fully comped redemption would otherwise be
      // recorded as a full-price charge forever. This is the first point
      // where the real, final amount is known.
      ...(amountCents != null ? { amount_cents: amountCents } : {}),
    })
    .eq("id", paymentId)
    .eq("status", "pending")
    .select("id, report_id")
    .maybeSingle();

  if (error) throw new Error(`Failed to update payment: ${error.message}`);
  return data;
}

async function fulfill(
  admin: Admin,
  paymentId: string,
  paymentIntentId?: string,
  amountCents?: number,
) {
  const payment = await markSucceeded(admin, paymentId, paymentIntentId, amountCents);

  if (!payment) {
    // Already succeeded/refunded/failed — a redelivery or a duplicate event.
    return;
  }

  const { error: reportError } = await admin
    .from("reports")
    .update({ status: "paid" })
    .eq("id", payment.report_id);

  if (reportError) {
    throw new Error(`Failed to update report: ${reportError.message}`);
  }

  // Step 5 of the core flow (BUILD.md): trigger analysis in-process right
  // after payment succeeds. Called directly (no HTTP hop, no internal secret
  // needed since this is a same-process server-to-server call). A failure here
  // must not fail the webhook response — Stripe should not retry the payment
  // webhook just because the downstream AI analysis failed; that can be
  // retried later via the internal-secret-gated /api/analyze route.
  try {
    const result = await runAnalysis(payment.report_id);
    if (!result.ok) {
      console.error("Stripe webhook: runAnalysis failed", result.error);
    }
  } catch (err) {
    console.error("Stripe webhook: runAnalysis threw unexpectedly", err);
  }
}

async function setStatus(
  admin: Admin,
  paymentId: string,
  status: "failed" | "refunded",
) {
  const { error } = await admin
    .from("payments")
    .update({ status })
    .eq("id", paymentId);

  if (error) {
    throw new Error(`Failed to mark payment ${status}: ${error.message}`);
  }
}

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
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;

        // A completed session with an unpaid payment_status is an async method
        // still clearing; async_payment_succeeded will arrive later.
        if (session.payment_status === "unpaid") break;

        const payment = await findPaymentBySession(admin, session.id);
        if (!payment) {
          console.error(`Stripe webhook: no payment row for session ${session.id} (${event.type})`);
          break;
        }
        await fulfill(
          admin,
          payment.id,
          paymentIntentId(session.payment_intent) ?? undefined,
          session.amount_total ?? undefined,
        );
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const payment = await findPaymentBySession(admin, session.id);
        if (!payment) {
          console.error(`Stripe webhook: no payment row for session ${session.id} (${event.type})`);
          break;
        }
        await setStatus(admin, payment.id, "failed");
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const payment = await findPaymentByCharge(admin, charge);
        if (!payment) {
          console.error(`Stripe webhook: no payment row for charge ${charge.id} (${event.type})`);
          break;
        }
        // Report data is deliberately left in place — revoking access on
        // refund is a product decision, not a webhook one.
        await setStatus(admin, payment.id, "refunded");
        break;
      }

      case "charge.updated": {
        // Fires on any charge mutation (metadata edits included), so it is only
        // a backstop: it confirms success if checkout.session.completed was
        // missed, and catches a refund reflected on the charge. markSucceeded's
        // pending-only filter makes the success path a no-op in the normal case.
        const charge = event.data.object as Stripe.Charge;
        const payment = await findPaymentByCharge(admin, charge);
        if (!payment) {
          console.error(`Stripe webhook: no payment row for charge ${charge.id} (${event.type})`);
          break;
        }

        if (charge.refunded) {
          await setStatus(admin, payment.id, "refunded");
        } else if (charge.status === "succeeded" && charge.paid) {
          await fulfill(
            admin,
            payment.id,
            paymentIntentId(charge.payment_intent) ?? undefined,
            charge.amount ?? undefined,
          );
        }
        break;
      }

      default:
        // Acknowledged and ignored — keeps an over-broad endpoint subscription
        // from generating retries.
        break;
    }
  } catch (err) {
    // Reached only for database failures, which a Stripe retry may well
    // resolve. Signature is already verified at this point, so 500 is safe.
    const message = err instanceof Error ? err.message : "Unhandled webhook error";
    console.error(`Stripe webhook: ${event.type} failed`, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
