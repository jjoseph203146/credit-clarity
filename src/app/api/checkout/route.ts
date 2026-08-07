import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { clientIp, hit, tooManyRequests } from "@/lib/rate-limit";
import { reportError } from "@/lib/report-error";

// Unauthenticated by design (payment precedes signup for new users). Each
// call creates a live Stripe Checkout Session plus a `payments` row, so
// unbounded access means unbounded junk in both systems.
const CHECKOUT_LIMIT = 10;
const CHECKOUT_WINDOW_MS = 10 * 60 * 1000;

// Step 4 of the core flow (BUILD.md): Stripe Checkout ($5 one-time payment).
//
// Creates a Checkout Session for the report's paid analysis, records a
// `payments` row via the admin client (report is still anonymous at this
// point), and returns the session URL for client-side redirect. The
// webhook (src/app/api/webhooks/stripe/route.ts) marks both `succeeded`
// once Stripe confirms payment.
export async function POST(req: Request) {
  const limit = hit(
    `checkout:${clientIp(req)}`,
    CHECKOUT_LIMIT,
    CHECKOUT_WINDOW_MS,
  );
  if (!limit.ok) return tooManyRequests(limit);

  // Constructed inside the handler (not at module scope) so this route
  // doesn't require STRIPE_SECRET_KEY to be set at build time — only when
  // the route actually runs, matching the lazy-client pattern in
  // src/lib/supabase/admin.ts.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  const { reportId } = (await req.json()) as { reportId: string };

  const origin = req.headers.get("origin")!;

  // If the buyer is already signed in, claim the report onto their account
  // now and send them straight back to /processing after payment instead of
  // through /signup — otherwise an existing user gets forced through
  // account creation again (and signUp() errors on their already-used
  // email).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();

  if (user) {
    const { error: claimError } = await admin
      .from("reports")
      .update({ user_id: user.id })
      .eq("id", reportId)
      .is("user_id", null);

    if (claimError) {
      void reportError({
        event: "checkout_claim_failed",
        severity: "error",
        error: claimError,
        context: { reportId },
      });
      return NextResponse.json(
        { error: "We couldn't start checkout. Please try again — you have not been charged." },
        { status: 500 },
      );
    }
  }

  const successPath = user
    ? `/processing?reportId=${reportId}`
    : `/signup?reportId=${reportId}`;

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
    success_url: `${origin}${successPath}`,
    cancel_url: `${origin}/preview`,
  });

  const { error: insertError } = await admin.from("payments").insert({
    report_id: reportId,
    user_id: user?.id ?? null,
    stripe_session_id: session.id,
    amount_cents: 500,
    status: "pending",
  });

  if (insertError) {
    void reportError({
      event: "checkout_payment_row_failed",
      // A live Stripe session now exists with no local row to reconcile it
      // against — if the user pays anyway, the webhook will not find them.
      severity: "fatal",
      error: insertError,
      context: { reportId, stripeSessionId: session.id },
    });
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again — you have not been charged." },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: session.url });
}
