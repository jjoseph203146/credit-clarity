// Hand-written from supabase-schema.sql. Replace with the CLI's generated
// types once the project is linked: `supabase gen types typescript --local`.

export type Bureau = "experian" | "equifax" | "transunion";
export type ReportStatus = "uploaded" | "parsed" | "paid" | "analyzed" | "error";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type AccountType =
  | "credit_card"
  | "retail_card"
  | "auto_loan"
  | "student_loan"
  | "mortgage"
  | "collection"
  | "other";
export type AccountStatus = "open" | "closed";
export type Impact = "low" | "medium" | "high";
export type InquiryImpact = "none" | "small" | "medium";
export type ValidationStatus = "not_started" | "sent" | "responded" | "resolved";
export type NotificationKind =
  | "deadline"
  | "task_overdue"
  | "reupload_window"
  | "payment"
  | "system";
export type Goal =
  | "build_credit"
  | "recover_mistakes"
  | "pay_down_debt"
  | "major_purchase"
  | "understand_finances";
export type Timeline = "30_days" | "90_days" | "6_months" | "long_term";
export type Challenge =
  | "debt"
  | "missed_payments"
  | "collections"
  | "low_score"
  | "lack_of_understanding";
export type OrgType = "school" | "employer" | "church" | "other";

// NOTE: these are declared as `type` (not `interface`) deliberately. An
// `interface` does not structurally satisfy `Record<string, unknown>` in
// TypeScript's conditional-type checks, which is exactly the check
// @supabase/postgrest-js's `GenericTable`/`GenericSchema` constraints run
// against `Row`/`Insert`/`Update` below — with `interface`, every table's
// Insert/Update/select() typing silently collapses to `never`.

export type Organization = {
  id: string;
  name: string;
  type: OrgType | null;
  seat_limit: number | null;
  aggregate_only: boolean | null;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  goal: Goal | null;
  timeline: Timeline | null;
  challenge: Challenge | null;
  org_id: string | null;
  created_at: string;
};

export type Report = {
  id: string;
  user_id: string | null; // null until claimed at signup
  bureau: Bureau | null;
  report_date: string | null;
  credit_score: number | null;
  clarity_score: number | null;
  status: ReportStatus;
  storage_path: string;
  error_message: string | null;
  deleted_at: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  user_id: string | null;
  report_id: string;
  stripe_session_id: string | null;
  stripe_customer_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  status: PaymentStatus;
  created_at: string;
};

export type ReportAccount = {
  id: string;
  report_id: string;
  name: string;
  type: AccountType | null;
  status: AccountStatus;
  balance: number | null;
  credit_limit: number | null;
  utilization: number | null;
  payment_history: string | null;
  opened_date: string | null;
  ai_summary: string | null;
  recommended_action: string | null;
  confidence: number | null; // 1-5
  impact: Impact | null;
  created_at: string;
};

export type ReportCollection = {
  id: string;
  report_id: string;
  account_id: string | null;
  original_creditor: string | null;
  agency_name: string | null;
  amount: number | null;
  opened_date: string | null;
  first_delinquency_date: string | null;
  falls_off_date: string | null;
  validation_status: ValidationStatus;
  ai_summary: string | null;
  created_at: string;
};

export type ReportInquiry = {
  id: string;
  report_id: string;
  lender_name: string | null;
  inquiry_type: string | null;
  inquiry_date: string | null;
  impact: InquiryImpact | null;
  ai_note: string | null;
  created_at: string;
};

export type ActionPlanTask = {
  month: number;
  week: number;
  label: string;
  sub?: string;
  done: boolean;
};

export type ActionPlan = {
  id: string;
  report_id: string;
  user_id: string;
  goal_snapshot: string | null;
  tasks: ActionPlanTask[];
  created_at: string;
  updated_at: string;
};

export type AiConversationSource = {
  type: "account" | "collection";
  id: string;
  label: string;
};

export type AiConversationMessage = {
  role: "user" | "assistant";
  content: string;
  created_at: string;
  /** Assistant messages only — accounts/collections the reply actually referenced. */
  sources?: AiConversationSource[];
  /** Assistant messages only — user's thumbs up/down on this specific reply. */
  feedback?: "up" | "down" | null;
};

export type AiConversation = {
  id: string;
  user_id: string;
  report_id: string;
  messages: AiConversationMessage[];
  tokens_used: number | null;
  created_at: string;
  updated_at: string;
};

export type LearningProgress = {
  id: string;
  user_id: string;
  lesson_slug: string;
  completed_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  kind: NotificationKind | null;
  title: string;
  body: string | null;
  due_at: string | null;
  read_at: string | null;
  created_at: string;
};

type Table<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

// Simplified stand-in for `supabase gen types typescript` output — enough
// for `createClient<Database>()` to type-check table access. Does not mark
// server-defaulted columns optional on Insert the way the CLI's output does.
export interface Database {
  public: {
    Tables: {
      organizations: Table<Organization>;
      users: Table<User>;
      reports: Table<Report>;
      payments: Table<Payment>;
      report_accounts: Table<ReportAccount>;
      report_collections: Table<ReportCollection>;
      report_inquiries: Table<ReportInquiry>;
      action_plans: Table<ActionPlan>;
      ai_conversations: Table<AiConversation>;
      learning_progress: Table<LearningProgress>;
      notifications: Table<Notification>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
