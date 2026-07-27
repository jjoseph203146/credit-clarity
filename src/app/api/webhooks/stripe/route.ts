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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const admin = createAdminClient();

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .update({ status: "succeeded" })
      .eq("stripe_session_id", session.id)
      .select()
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: paymentError?.message ?? "Matching payment not found" },
        { status: 404 },
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
