-- Credit Clarity — full Supabase/Postgres schema
-- Run in order. Enables RLS on every table, scoped to auth.uid().

create extension if not exists "uuid-ossp";

-- ============ IDENTITY ============

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text check (type in ('school','employer','church','other')),
  seat_limit int,
  aggregate_only boolean default true,
  created_at timestamptz default now()
);

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  goal text check (goal in ('build_credit','recover_mistakes','pay_down_debt','major_purchase','understand_finances')),
  timeline text check (timeline in ('30_days','90_days','6_months','long_term')),
  challenge text check (challenge in ('debt','missed_payments','collections','low_score','lack_of_understanding')),
  org_id uuid references organizations(id) on delete set null,
  created_at timestamptz default now()
);

-- ============ REPORTS & MONEY ============

create table reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade, -- null until claimed at signup
  bureau text check (bureau in ('experian','equifax','transunion')),
  report_date date,
  credit_score int,
  clarity_score int,
  status text check (status in ('uploaded','parsed','paid','analyzed','error')) default 'uploaded',
  storage_path text not null, -- Supabase Storage path, encrypted at rest
  error_message text, -- set when status = 'error' (e.g. PDF parse failure reason)
  deleted_at timestamptz,
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete set null,
  report_id uuid references reports(id) on delete cascade,
  stripe_session_id text,
  stripe_customer_id text,
  amount_cents int not null default 500,
  status text check (status in ('pending','succeeded','failed','refunded')) default 'pending',
  created_at timestamptz default now()
);

-- ============ REPORT DETAIL ============

create table report_accounts (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid references reports(id) on delete cascade,
  name text not null,
  type text check (type in ('credit_card','retail_card','auto_loan','student_loan','mortgage','collection','other')),
  status text check (status in ('open','closed')) default 'open',
  balance numeric,
  credit_limit numeric,
  utilization numeric,
  payment_history text,
  opened_date date,
  ai_summary text,
  recommended_action text,
  confidence int check (confidence between 1 and 5),
  impact text check (impact in ('low','medium','high')),
  created_at timestamptz default now()
);

create table report_collections (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid references reports(id) on delete cascade,
  account_id uuid references report_accounts(id) on delete set null,
  original_creditor text,
  agency_name text,
  amount numeric,
  opened_date date,
  first_delinquency_date date,
  falls_off_date date,
  validation_status text check (validation_status in ('not_started','sent','responded','resolved')) default 'not_started',
  ai_summary text,
  created_at timestamptz default now()
);

create table report_inquiries (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid references reports(id) on delete cascade,
  lender_name text,
  inquiry_type text,
  inquiry_date date,
  impact text check (impact in ('none','small','medium')),
  ai_note text,
  created_at timestamptz default now()
);

-- ============ ENGAGEMENT ============

create table action_plans (
  id uuid primary key default uuid_generate_v4(),
  report_id uuid references reports(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  goal_snapshot text,
  tasks jsonb not null default '[]', -- [{month, week, label, sub, done}]
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  report_id uuid references reports(id) on delete cascade,
  messages jsonb not null default '[]', -- [{role, content, created_at}]
  tokens_used int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table learning_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  lesson_slug text not null,
  completed_at timestamptz default now(),
  unique (user_id, lesson_slug)
);

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  kind text check (kind in ('deadline','task_overdue','reupload_window','payment','system')),
  title text not null,
  body text,
  due_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ============ INDEXES ============
-- Foreign-key columns are queried heavily (RLS ownership checks, app
-- filters), so they're indexed explicitly — Postgres does not do this
-- automatically for foreign keys.

create index if not exists idx_reports_user_id on reports(user_id);

create index if not exists idx_payments_user_id on payments(user_id);
create index if not exists idx_payments_report_id on payments(report_id);

create index if not exists idx_report_accounts_report_id on report_accounts(report_id);

create index if not exists idx_report_collections_report_id on report_collections(report_id);
create index if not exists idx_report_collections_account_id on report_collections(account_id);

create index if not exists idx_report_inquiries_report_id on report_inquiries(report_id);

create index if not exists idx_action_plans_report_id on action_plans(report_id);
create index if not exists idx_action_plans_user_id on action_plans(user_id);

create index if not exists idx_ai_conversations_user_id on ai_conversations(user_id);
create index if not exists idx_ai_conversations_report_id on ai_conversations(report_id);

create index if not exists idx_notifications_user_id on notifications(user_id);

create index if not exists idx_users_org_id on users(org_id);

-- ============ ROW LEVEL SECURITY ============

alter table organizations enable row level security;
-- Intentionally no policies: no app code reads/writes this table yet
-- (org features are future work), so RLS-enabled-with-no-policy
-- (default-deny for anon/authenticated) is the correct, complete fix.
-- Add scoped policies here when org features ship.

alter table users enable row level security;
alter table reports enable row level security;
alter table payments enable row level security;
alter table report_accounts enable row level security;
alter table report_collections enable row level security;
alter table report_inquiries enable row level security;
alter table action_plans enable row level security;
alter table ai_conversations enable row level security;
alter table learning_progress enable row level security;
alter table notifications enable row level security;

create policy "users read own row" on users for select using (auth.uid() = id);
create policy "users update own row" on users for update using (auth.uid() = id);

-- reports: owner-only once claimed; anonymous (user_id null) rows are managed via service-role only
create policy "reports read own" on reports for select using (user_id = auth.uid());
create policy "reports update own" on reports for update using (user_id = auth.uid());

create policy "payments read own" on payments for select using (user_id = auth.uid());

create policy "report_accounts read own" on report_accounts for select using (
  exists (select 1 from reports r where r.id = report_id and r.user_id = auth.uid())
);
create policy "report_collections read own" on report_collections for select using (
  exists (select 1 from reports r where r.id = report_id and r.user_id = auth.uid())
);
create policy "report_inquiries read own" on report_inquiries for select using (
  exists (select 1 from reports r where r.id = report_id and r.user_id = auth.uid())
);

create policy "action_plans owner" on action_plans for all using (user_id = auth.uid());
create policy "ai_conversations owner" on ai_conversations for all using (user_id = auth.uid());
create policy "learning_progress owner" on learning_progress for all using (user_id = auth.uid());
create policy "notifications owner" on notifications for all using (user_id = auth.uid());

-- Note: inserts/updates on reports & report_* detail tables during the anonymous
-- upload → parse → analyze pipeline should run via the Supabase service-role key
-- (server-side only), bypassing RLS, until the report is claimed at signup.

-- ============ STORAGE & RETENTION ============
-- Mirrors supabase/migrations/0003_storage_limits_and_cleanup.sql. See that
-- file for the full rationale.

-- Private bucket with a real server-side size/MIME ceiling — the 15MB
-- PDF-only check in src/app/upload/page.tsx is client-side only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reports', 'reports', false, 15728640, array['application/pdf'])
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Retention for abandoned anonymous uploads. Returns storage_paths so the
-- caller (src/app/api/cleanup/route.ts) can remove the Storage objects.
-- Never touches claimed rows (user_id is not null).
create or replace function delete_stale_anonymous_reports(older_than interval default interval '48 hours')
returns table (id uuid, storage_path text)
language sql
security definer
set search_path = public
as $$
  delete from reports
  where user_id is null
    and created_at < now() - older_than
  returning reports.id, reports.storage_path;
$$;

revoke all on function delete_stale_anonymous_reports(interval) from public, anon, authenticated;
grant execute on function delete_stale_anonymous_reports(interval) to service_role;

create index if not exists idx_reports_anonymous_created_at
  on reports (created_at)
  where user_id is null;
