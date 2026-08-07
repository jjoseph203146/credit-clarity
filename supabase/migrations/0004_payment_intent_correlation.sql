-- Correlate refunds and failed payments back to a `payments` row.
--
-- Only `stripe_session_id` was stored, but refund and failure events
-- (charge.refunded, payment_intent.payment_failed) carry a PaymentIntent id
-- and no Checkout Session id — so there was no way to find the row those
-- events refer to. That is why the `refunded` and `failed` statuses in the
-- schema were never written by anything, despite /checkout advertising a
-- money-back guarantee.

alter table payments
  add column if not exists stripe_payment_intent_id text;

-- Webhook handlers look rows up by this on every refund/failure event.
create index if not exists idx_payments_stripe_payment_intent_id
  on payments (stripe_payment_intent_id);

-- Existing lookups by session id (checkout.session.completed) were doing a
-- seq scan too.
create index if not exists idx_payments_stripe_session_id
  on payments (stripe_session_id);
