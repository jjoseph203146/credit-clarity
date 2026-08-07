import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";
import { clientIp, hit, tooManyRequests } from "@/lib/rate-limit";
import { parseAnswers } from "@/lib/questionnaire";
import { reportError } from "@/lib/report-error";

// POST /api/reports/[id]/questionnaire — records the three personalization
// answers against a report, before checkout.
//
// Unauthenticated by necessity: this sits between the free preview and
// payment, which is before any account exists in the primary funnel. Access
// follows the same rule as GET /api/reports/[id] — an unclaimed report may be
// written by anyone holding its (unguessable) id, a claimed one only by its
// owner. The blast radius is one report's three enum fields.
//
// Also mirrors the answers onto the users row when the caller is signed in,
// so /goals and future reports see them without waiting for a claim.

const QUESTIONNAIRE_LIMIT = 20;
const QUESTIONNAIRE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const limit = hit(
    `questionnaire:${clientIp(req)}`,
    QUESTIONNAIRE_LIMIT,
    QUESTIONNAIRE_WINDOW_MS,
  );
  if (!limit.ok) return tooManyRequests(limit);

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const answers = parseAnswers(body);
  if (!answers) {
    return NextResponse.json(
      { error: "Please answer all three questions." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const { data: report, error: lookupError } = await admin
    .from("reports")
    .select("id, user_id")
    .eq("id", id)
    .maybeSingle();

  if (lookupError || !report) {
    return NextResponse.json(
      { error: "We couldn't find that report." },
      { status: 404 },
    );
  }

  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A claimed report is only writable by its owner. 404 rather than 403 so the
  // response doesn't confirm the report exists to someone who isn't entitled.
  if (report.user_id !== null && report.user_id !== user?.id) {
    return NextResponse.json(
      { error: "We couldn't find that report." },
      { status: 404 },
    );
  }

  const { error: updateError } = await admin
    .from("reports")
    .update(answers)
    .eq("id", report.id);

  if (updateError) {
    void reportError({
      event: "questionnaire_write_failed",
      severity: "error",
      error: updateError,
      context: { reportId: report.id },
    });
    return NextResponse.json(
      { error: "We couldn't save your answers. Please try again." },
      { status: 500 },
    );
  }

  // Best effort: the report already carries the answers, which is what the
  // analysis reads, so a failure here must not block checkout.
  if (user) {
    const { error: userUpdateError } = await admin
      .from("users")
      .update(answers)
      .eq("id", user.id);

    if (userUpdateError) {
      console.warn(
        `[questionnaire] failed to mirror answers onto user ${user.id}: ${userUpdateError.message}`,
      );
    }
  }

  return NextResponse.json({ saved: true });
}
