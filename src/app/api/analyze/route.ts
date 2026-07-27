import { NextResponse } from "next/server";
import { runAnalysis } from "@/lib/analyze";

// Internal/manual re-trigger for the analysis step (BUILD.md step 5). In the
// normal flow, analysis is triggered in-process by the Stripe webhook
// (src/app/api/webhooks/stripe/route.ts) right after payment succeeds — this
// HTTP route exists only so analysis can be re-run manually (e.g. after a
// transient Claude failure) and is gated behind an internal shared secret so
// it can't be used by untrusted clients to trigger billed Claude calls or
// overwrite another user's report data.
export async function POST(req: Request) {
  // Read inside the handler (not at module scope) so this route doesn't
  // require INTERNAL_API_SECRET to be set at build time, matching the
  // lazy-env pattern used elsewhere (e.g. src/app/api/checkout/route.ts).
  const expectedSecret = process.env.INTERNAL_API_SECRET;
  const providedSecret = req.headers.get("x-internal-secret");

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reportId } = (await req.json()) as { reportId: string };

  const result = await runAnalysis(reportId);

  if (!result.ok) {
    const status = result.error.toLowerCase().includes("claude") ? 502 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ status: "analyzed" });
}
