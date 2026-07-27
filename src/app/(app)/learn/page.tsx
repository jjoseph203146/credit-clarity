import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { LearnCenter, type Lesson, type GlossaryTerm } from "@/components/app/learn-center";

// Lesson content mirrors the design prototype — no DB table backs lesson
// content itself, only per-user completion (`learning_progress`).
const lessons: Lesson[] = [
  { slug: "understanding-utilization", title: "Understanding Utilization", description: "Why 30% matters, per-card vs. overall, and statement timing tricks.", tag: "BASICS", minutes: 4, relevant: true },
  { slug: "collections-explained", title: "Collections, Explained", description: "What happens when debt is sold, your FDCPA rights, and validation.", tag: "DEBT", minutes: 6, relevant: true },
  { slug: "late-payments-and-goodwill", title: "Late Payments & Goodwill", description: "How lates age off, and when a goodwill letter actually works.", tag: "REPAIR", minutes: 5, relevant: true },
  { slug: "charge-offs", title: "Charge-Offs", description: 'What "charged off" really means and why the debt still exists.', tag: "DEBT", minutes: 5 },
  { slug: "credit-mix", title: "Credit Mix", description: "Revolving vs. installment, and why variety helps (a little).", tag: "BASICS", minutes: 3 },
  { slug: "snowball-vs-avalanche", title: "Snowball vs. Avalanche", description: "Two payoff methods, and how to pick for your psychology.", tag: "STRATEGY", minutes: 6 },
  { slug: "hard-inquiries", title: "Hard Inquiries", description: "What they cost, how long they last, and rate-shopping windows.", tag: "BASICS", minutes: 3 },
  { slug: "identity-theft", title: "Identity Theft", description: "Spotting accounts that aren't yours, freezes, and fraud alerts.", tag: "SAFETY", minutes: 7 },
  { slug: "disputes-that-work", title: "Disputes That Work", description: "What's disputable, evidence that wins, and bureau timelines.", tag: "REPAIR", minutes: 8 },
  { slug: "building-from-thin-credit", title: "Building From Thin Credit", description: "Secured cards, credit-builder loans, and authorized users.", tag: "BUILDING", minutes: 6 },
];

const glossary: GlossaryTerm[] = [
  { term: "Utilization", what: "The share of your credit limits you're currently using — per card and overall.", why: "About 30% of your score. High utilization reads as financial stress even with perfect payments." },
  { term: "Collection", what: "A debt your original creditor sold to a collection agency after non-payment. The agency now owns it and reports it monthly.", why: "One of the heaviest negative marks — it caps how high your score can climb until resolved." },
  { term: "Hard Inquiry", what: "A lender checking your full report because you applied for credit.", why: "Small (~3-5 points), fades within 12 months, falls off after 24." },
  { term: "Charge-Off", what: "A creditor declaring your debt a loss after ~180 days of non-payment. An accounting step — not forgiveness.", why: "A severe derogatory that reports for 7 years from first delinquency." },
  { term: "Closed Account", what: "An account no longer active — closed by you or the issuer.", why: "Positive closed accounts keep helping your history for up to 10 years." },
  { term: "Derogatory Mark", what: "Umbrella term for serious negatives: collections, charge-offs, repossessions, bankruptcies, 60+ day lates.", why: "These weigh more than everything else — one derogatory can outweigh years of on-time payments." },
  { term: "Revolving Credit", what: "Credit with a limit you borrow against repeatedly — credit cards, store cards. Balance and payment vary monthly.", why: "Revolving balances drive utilization, which is ~30% of your score." },
  { term: "Installment Loan", what: "Fixed amount, fixed payments, set end date — auto loans and student loans.", why: "Balances matter much less than revolving; what counts is on-time payment history." },
  { term: "Available Credit", what: "Your total limits minus current balances.", why: "It's the denominator of utilization — more available credit at the same balance means lower utilization." },
  { term: "Credit Mix", what: "The variety of account types on your file — cards, retail, auto, student loan, etc.", why: "About 10% of your score — a helpful bonus, not a driver." },
];

export default async function LearnPage() {
  const supabase = (await createClient()) as unknown as SupabaseClient<Database>;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: progress } = await supabase
    .from("learning_progress")
    .select("lesson_slug")
    .eq("user_id", user.id);

  const completedSlugs = (progress ?? []).map((p) => p.lesson_slug);

  return (
    <LearnCenter lessons={lessons} glossary={glossary} initialCompletedSlugs={completedSlugs} />
  );
}
