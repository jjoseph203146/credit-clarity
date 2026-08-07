import type { Challenge, Goal, Timeline } from "@/lib/supabase/types";

// Shared vocabulary for the three-question personalization step. The UI shows
// the labels; the database stores the enum values (constrained by CHECK on
// both `users` and `reports`). Keeping the mapping here means the page, the
// API route, and the validation cannot drift apart.

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "build_credit", label: "Build my credit" },
  { value: "recover_mistakes", label: "Recover from credit mistakes" },
  { value: "pay_down_debt", label: "Pay down debt" },
  { value: "major_purchase", label: "Prepare for a major purchase" },
  { value: "understand_finances", label: "Understand my finances" },
];

export const TIMELINE_OPTIONS: { value: Timeline; label: string }[] = [
  { value: "30_days", label: "30 days" },
  { value: "90_days", label: "90 days" },
  { value: "6_months", label: "6 months" },
  { value: "long_term", label: "Long term" },
];

export const CHALLENGE_OPTIONS: { value: Challenge; label: string }[] = [
  { value: "debt", label: "Debt" },
  { value: "missed_payments", label: "Missed payments" },
  { value: "collections", label: "Collections" },
  { value: "low_score", label: "Low score" },
  { value: "lack_of_understanding", label: "Lack of understanding" },
];

export type QuestionnaireAnswers = {
  goal: Goal;
  timeline: Timeline;
  challenge: Challenge;
};

/**
 * Validates an untrusted request body against the option lists above.
 * Returns null rather than throwing so callers can answer with a 400.
 *
 * The database CHECK constraints would reject bad values anyway, but that
 * surfaces as an opaque 500 — this rejects them at the edge with intent.
 */
export function parseAnswers(input: unknown): QuestionnaireAnswers | null {
  if (!input || typeof input !== "object") return null;
  const { goal, timeline, challenge } = input as Record<string, unknown>;

  const isGoal = GOAL_OPTIONS.some((o) => o.value === goal);
  const isTimeline = TIMELINE_OPTIONS.some((o) => o.value === timeline);
  const isChallenge = CHALLENGE_OPTIONS.some((o) => o.value === challenge);

  if (!isGoal || !isTimeline || !isChallenge) return null;

  return {
    goal: goal as Goal,
    timeline: timeline as Timeline,
    challenge: challenge as Challenge,
  };
}
