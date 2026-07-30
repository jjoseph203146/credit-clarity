import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { runAnalysis } from "@/lib/analyze";

// Stripe webhook: confirms payment for the Checkout Session created in
// src/app/api/checkout/route.ts. Signature verification requires the raw
// request body, so this reads it via req.text() rather than req.json().
export async function POST(req: Request) {
  // Constructed inside the handler (not at module scope) so this route
  // doesn't require STRIPE_SECRET_KEY to be set at build time.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

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

  if (event.type === "charge.updated" || event.type === "checkout.session.completed") {
    const admin = createAdminClient();
    let paymentId: string | null = null;

    // Handle both charge.updated and checkout.session.completed events
    if (event.type === "charge.updated") {
      const charge = event.data.object as Stripe.Charge;

      // For charge.updated, find payment by charge ID in metadata
      if (charge.metadata?.payment_id) {
        paymentId = charge.metadata.payment_id;
      } else {
        // Fallback: search by charge ID if stored in payments table
        const { data: payment } = await admin
          .from("payments")
          .select("id")
          .eq("stripe_charge_id", charge.id)
          .maybeSingle();
        paymentId = payment?.id ?? null;
      }

      if (!paymentId) {
        return NextResponse.json(
          { error: "Could not find payment for charge" },
          { status: 404 },
        );
      }
    } else {
      // checkout.session.completed: find by session ID
      const session = event.data.object as Stripe.Checkout.Session;
      const { data: payment } = await admin
        .from("payments")
        .select("id")
        .eq("stripe_session_id", session.id)
        .maybeSingle();
      paymentId = payment?.id ?? null;

      if (!paymentId) {
        return NextResponse.json(
          { error: "Matching payment not found" },
          { status: 404 },
        );
      }
    }

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .update({ status: "succeeded" })
      .eq("id", paymentId)
      .select()
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: paymentError?.message ?? "Failed to update payment" },
        { status: 500 },
      );
    }

    const { error: reportError } = await admin
      .from("reports")
      .update({ status: "paid" })
      .eq("id", payment.report_id);

    if (reportError) {
      return NextResponse.json({ error: reportError.message }, { status: 500 });
    }

    // Step 5 of the core flow (BUILD.md): trigger analysis in-process right
    // after payment succeeds. Called directly (no HTTP hop, no internal
    // secret needed since this is a same-process server-to-server call). A
    // failure here must not fail the webhook response — Stripe should not
    // retry the payment webhook just because the downstream AI analysis
    // failed; that can be retried later via the internal-secret-gated
    // /api/analyze route.
    try {
      const result = await runAnalysis(payment.report_id);
      if (!result.ok) {
        console.error("Stripe webhook: runAnalysis failed", result.error);
      }
    } catch (err) {
      console.error("Stripe webhook: runAnalysis threw unexpectedly", err);
    }
  }

  return NextResponse.json({ received: true });
}
