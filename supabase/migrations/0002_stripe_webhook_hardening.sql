-- Stripe webhook hardening + cleanup-sweep support.
--
-- Context: the webhook now subscribes to five event types, including
-- charge-level ones (charge.updated, charge.refunded). Charge events carry a
-- payment_intent but NOT a checkout session id, so payments needs a
-- payment-intent column to resolve them back to a row. Previously the handler
-- tried to read charge.metadata, which /api/checkout never populated — every
-- charge event 404'd and Stripe retried it for ~3 days.

alter table payments
  add column if not exists stripe_payment_intent_id text;

-- Resolve charge.* events -> payments row.
create index if not exists payments_stripe_payment_intent_id_idx
  on payments (stripe_payment_intent_id);

-- Idempotency: Stripe redelivers events, and a Checkout Session must map to at
-- most one payments row so a redelivery can never create a second one.
create unique index if not exists payments_stripe_session_id_key
  on payments (stripe_session_id)
  where stripe_session_id is not null;

-- Supports the /api/cleanup sweeps, which filter on (status, created_at) and
-- on anonymous reports (user_id is null).
create index if not exists payments_status_created_at_idx
  on payments (status, created_at);

create index if not exists reports_anonymous_status_created_at_idx
  on reports (status, created_at)
  where user_id is null;
