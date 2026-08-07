# Phase 2

Everything known to be outstanding, from the pre-production audit and the work
that followed. Phase 1 closed: rate limiting, storage limits, retention job,
audit logging, AI cost controls, prompt-injection hardening, refund/failure
handling, error reporting and alerting, the Next 16 upgrade, and the legal
pages.

Ordered by what blocks real users, not by effort.

---

## 0. Before the first real user

Not code — configuration and decisions. Nothing below matters if these aren't
done, and most take minutes.

- [ ] **Stripe: sandbox → production.** Swap `STRIPE_SECRET_KEY` and
      `STRIPE_PUBLISHABLE_KEY`, create the live webhook endpoint, and set
      `STRIPE_WEBHOOK_SECRET` from it.
- [ ] **Subscribe the webhook to exactly four events.** Listed at the top of
      `src/app/api/webhooks/stripe/route.ts`: `checkout.session.completed`,
      `checkout.session.async_payment_failed`,
      `payment_intent.payment_failed`, `charge.refunded`. Refunds and failed
      payments are handled in code but will never arrive unless subscribed.
- [ ] **Set `ERROR_WEBHOOK_URL`.** A Slack or Discord incoming webhook. Without
      it, failures are logged but nobody is paged — including the case where a
      user pays and the analysis fails.
- [ ] **Schedule `/api/cleanup` daily.** See `supabase/README.md`. Until this
      runs, every abandoned upload keeps a real credit report indefinitely,
      contradicting the 48-hour promise now written into the Privacy Policy.
- [ ] **Click through the whole flow once against production.** Upload →
      preview → pay → analysis → report → delete. Client-side hydration was
      never verified after the Next 16 upgrade; `src/app/preview/page.tsx`
      changed the most and deserves the closest look.
- [ ] **Decide: Supabase "Confirm email" on or off.** Both paths work, but they
      are different first-run experiences. Off is smoother (straight into the
      report after paying); on is safer against typo'd and disposable emails,
      and costs a round trip through the inbox before a paying user sees
      anything.
- [ ] **Have a lawyer review the Terms and Privacy Policy.** They accurately
      describe what the code does; that is a different bar from being legally
      sufficient. Credit-adjacent products sit near CROA, FCRA and state
      regulation. The "not credit repair" positioning is the right posture —
      confirm it holds.

---

## 1. Security and infrastructure

- [ ] **Malware scanning on upload.** Files are validated by extension, size,
      declared MIME type and `%PDF-` magic bytes — none of which detect a
      malicious payload inside a structurally valid PDF. Needs an external
      service (ClamAV sidecar, VirusTotal, an S3-antivirus style scanner).
      Slightly more pressing now that `GET /api/reports/[id]/file` lets a user
      re-download what they uploaded.
- [ ] **Move rate limiting to a shared store.** `src/lib/rate-limit.ts` keeps
      counters in a single instance's memory, so on serverless the effective
      limit is `limit × instances` and a cold start resets the window. Upstash
      Redis is the usual fit. The call sites already treat the return value as
      the only contract, so this is a one-function swap.
- [ ] **Remove `'unsafe-inline'` from the CSP script-src.** Currently required
      because the App Router inlines bootstrap and flight-data scripts.
      Eliminating it needs per-request nonces generated in `src/proxy.ts` and
      threaded through. Meaningful hardening for an app holding credit reports.
- [ ] **Upgrade `@anthropic-ai/sdk`.** Pinned at `0.32.1`; current is `0.115.x`.
      Far behind, and the app calls a model much newer than the SDK.

---

## 2. Data policy decisions

These are judgement calls, not tasks. Each one is a real liability question.

- [x] **DECIDED — data is kept until the client deletes it.** Claimed reports
      are retained until the user deletes the report or their account;
      unclaimed uploads are still auto-deleted after 48 hours. This is what the
      Privacy Policy already states, and the code already implements. No change
      required.
- [x] **DECIDED — a refund does not revoke access.** Someone who is refunded
      keeps their analysis. This is the existing behaviour: the webhook records
      `refunded` and changes nothing else. Documented in `settle()` in
      `src/app/api/webhooks/stripe/route.ts`. No change required.
- [ ] **Reconcile `deleted_at` with hard deletes.** Seven pages filter
      `.is("deleted_at", null)`, but nothing ever sets the column — deletion is
      a hard delete. The filters are harmless dead weight today and actively
      misleading to the next person reading the code. Either implement soft
      delete or drop the column and the filters.

---

## 3. Product gaps

- [x] **DONE — `/questionnaire` is wired into the funnel.** It now sits between
      the free preview and checkout, writes to the report (migration 0006), and
      is copied onto the users row when the report is claimed. It had to run
      before payment, not after signup: the webhook starts the analysis the
      moment payment succeeds, which in the anonymous flow is before any
      account exists. `action_plans.goal_snapshot` and `/goals` now populate,
      and the Privacy Policy's claim about questionnaire answers is true.
- [ ] **An abandoned checkout leaves a report on the dashboard.** Since
      checkout claims the report up front for signed-in users, someone who
      clicks Pay and then abandons Stripe ends up with a `parsed` report in
      their list. No paid content leaks — all `ai_summary` fields stay null —
      but it looks like something completed. The cleaner fix is to claim in the
      webhook via Stripe session metadata instead.
- [ ] **Scanned and image-only PDFs silently produce nothing.** The parser is
      regex over extracted text, so a photographed or scanned report yields no
      accounts. `/upload` mentions this, but a user who gets through to a paid
      analysis with zero extracted data has a bad experience. Either detect it
      before checkout and refuse the sale, or add OCR.
- [ ] **`siteConfig.supportEmail` is defined but never rendered anywhere.**
      Either surface it (a support link in the app shell or settings) or drop
      the field.

---

## 4. Engineering quality

- [ ] **No tests above the unit level.** 40 tests cover pure helpers
      (`rate-limit`, `limits`, `report-error`, `auth-guard`, `utils`, types).
      Nothing tests a route handler, the webhook's idempotency, the report
      claim logic, or RLS actually isolating one user's data from another's.
      The last of those is worth an integration test on its own — it is the
      security boundary the whole design rests on.
- [ ] **No uptime or synthetic monitoring.** Error reporting now fires when
      something breaks loudly. Nothing notices if the site is simply down, or
      if uploads quietly stop succeeding.
- [ ] **Consider Sentry once there's traffic.** The current reporter covers
      alerting well, but not stack-trace grouping, release tracking, or
      source-mapped client stacks. `reportError()` is the only call site
      contract, so swapping the implementation touches nothing else.
