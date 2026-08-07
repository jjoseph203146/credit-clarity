-- Audit log for security-sensitive actions on credit report data.
--
-- Answers "what actually happened to this report / this account?" after the
-- fact — for incident response, for a user asking what was done with their
-- data, and for spotting abuse patterns. This is a record of actions, not
-- application state; nothing in the product reads from it.
--
-- Records are intentionally NOT user-visible: exposing them would let an
-- attacker who gained account access see (and want to tamper with) the trail
-- of their own activity.

create table audit_log (
  id uuid primary key default uuid_generate_v4(),

  -- Nullable: the upload and parse steps happen before any account exists,
  -- and account deletion nulls this out while keeping the record.
  user_id uuid references users(id) on delete set null,

  action text not null check (action in (
    'report_uploaded',
    'report_parsed',
    'report_purchased',
    'report_analyzed',
    'report_downloaded',
    'report_deleted',
    'account_deleted',
    'payment_refunded',
    'payment_failed'
  )),

  -- The report acted on, where applicable. Deliberately NOT a foreign key:
  -- the whole point is that the record outlives the report it refers to, and
  -- `on delete cascade` would erase exactly the deletion events that matter
  -- most.
  report_id uuid,

  ip text,
  user_agent text,

  -- Small action-specific extras (amount_cents, error reasons, byte counts).
  -- Never put credit report contents or PII in here.
  metadata jsonb not null default '{}',

  created_at timestamptz default now()
);

create index if not exists idx_audit_log_user_id on audit_log (user_id);
create index if not exists idx_audit_log_report_id on audit_log (report_id);
create index if not exists idx_audit_log_created_at on audit_log (created_at desc);
create index if not exists idx_audit_log_action on audit_log (action);

-- RLS on with no policies: default-deny for anon and authenticated. Writes
-- and reads both go through the service-role client (server-side only), so
-- no client can read the trail or forge an entry.
alter table audit_log enable row level security;
