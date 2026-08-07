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

- [ ] **Store-forever vs store-temporarily.** Today: claimed reports are kept
      until the user deletes them; unclaimed uploads are auto-deleted after 48
      hours. The alternative — generate the analysis, then let the user
      explicitly choose to save the underlying report — materially lowers the
      cost of a breach, because the most sensitive artifact stops being
      retained by default. Worth deciding deliberately rather than by omission.
- [ ] **Does a refund revoke access to the analysis?** The webhook records
      `refunded` but deliberately does not delete or hide anything, on the
      grounds that silently removing something someone paid for is the worse
      default. If the policy should be otherwise, the hook is `settle()` in
      `src/app/api/webhooks/stripe/route.ts`.
- [ ] **Reconcile `deleted_at` with hard deletes.** Seven pages filter
      `.is("deleted_at", null)`, but nothing ever sets the column — deletion is
      a hard delete. The filters are harmless dead weight today and actively
      misleading to the next person reading the code. Either implement soft
      delete or drop the column and the filters.

---

## 3. Product gaps

- [ ] **`/questionnaire` is disconnected, and it takes personalization with
      it.** This is bigger than a dead route. Nothing links to the page, it
      persists nothing, and it redirects to `/processing` without a `reportId`
      (an infinite spinner). Downstream: **`users.goal`, `users.timeline` and
      `users.challenge` are never written by anything.** So
      `action_plans.goal_snapshot` is always null, `/goals` shows no goal, and
      every action plan is generic despite `src/lib/analyze.ts` being built to
      personalize from it. The Privacy Policy also tells users their
      questionnaire answers personalize their plan — which is not currently
      true. Either wire it up (into signup or first dashboard visit) or remove
      the route and the privacy claim.
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
