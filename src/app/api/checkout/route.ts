import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Step 4 of the core flow (BUILD.md): Stripe Checkout ($5 one-time payment).
//
// Creates a Checkout Session for the report's paid analysis, records a
// `payments` row via the admin client (report is still anonymous at this
// point), and returns the session URL for client-side redirect. The
// webhook (src/app/api/webhooks/stripe/route.ts) marks both `succeeded`
// once Stripe confirms payment.
export async function POST(req: Request) {
  // Constructed inside the handler (not at module scope) so this route
  // doesn't require STRIPE_SECRET_KEY to be set at build time — only when
  // the route actually runs, matching the lazy-client pattern in
  // src/lib/supabase/admin.ts.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  const { reportId } = (await req.json()) as { reportId: string };

  const origin = req.headers.get("origin")!;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: 500,
          product_data: {
            name: "Credit Clarity Full Analysis",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/signup?reportId=${reportId}`,
    cancel_url: `${origin}/preview`,
  });

  const admin = createAdminClient();

  const { error: insertError } = await admin.from("payments").insert({
    report_id: reportId,
    stripe_session_id: session.id,
    amount_cents: 500,
    status: "pending",
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
