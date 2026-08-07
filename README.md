# Credit Clarity

AI-powered credit report analysis. Educational insights, not credit repair.

A user uploads a credit report PDF, gets a free preview of what was parsed, and
pays a one-time $5 fee for a full AI analysis: per-account summaries, debt
validation scripts, a 90-day action plan, and a chat assistant grounded in
their own report.

**Credit Clarity is deliberately not a credit repair service.** It does not
dispute anything on a user's behalf, does not promise score changes, and does
not perform credit pulls or collect SSNs. That positioning is enforced in the
AI system prompts and stated in the Terms — keep it that way.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Database / auth / storage | Supabase (Postgres + RLS) |
| Payments | Stripe Checkout |
| AI | Anthropic Claude (`claude-sonnet-5`) |
| PDF parsing | `pdf-parse` + regex heuristics (`src/lib/parsing/`) |
| Styling | Tailwind, shadcn-style primitives |
| Tests | Vitest |

## Setup

Requires Node >= 20.

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Safe to expose; RLS is the boundary. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | **Server only.** Bypasses RLS entirely. Never import `src/lib/supabase/admin.ts` from a Client Component. |
| `STRIPE_SECRET_KEY` | yes | Server only. |
| `STRIPE_PUBLISHABLE_KEY` | yes | |
| `STRIPE_WEBHOOK_SECRET` | yes | From the Stripe webhook endpoint config. |
| `ANTHROPIC_API_KEY` | yes | Server only. |
| `INTERNAL_API_SECRET` | yes | Gates `/api/analyze` and `/api/cleanup`. |

Anything not prefixed `NEXT_PUBLIC_` must stay server-side. The service-role
key and the Anthropic key in particular grant full data access and billable
API calls respectively.

Outward-facing legal details — contact addresses, the contracting entity, and
the governing-law jurisdiction — are static values in
[`src/lib/site-config.ts`](src/lib/site-config.ts), not environment variables.
They render verbatim in the Terms and Privacy Policy, so edit them there.

### Database

See [`supabase/README.md`](supabase/README.md). Apply the migrations in order,
then run `supabase/verify-schema.sql` — every row it returns should read `OK`.

## The core flow

```
/upload      anonymous upload -> POST /api/upload mints a signed Storage URL
                                 (reports row created with user_id = null)
   |
   v
/api/parse   downloads the PDF, validates the %PDF- header, extracts
             accounts/collections/inquiries via regex heuristics
   |
   v
/preview     free preview of what was parsed
   |
   v
/checkout    POST /api/checkout -> Stripe Checkout Session
             signed in?  success_url -> /processing (report claimed up front)
             anonymous?  success_url -> /signup    (report claimed at signup)
   |
   v
webhook      checkout.session.completed -> payment succeeded -> runAnalysis()
   |
   v
/processing  polls until reports.status is `analyzed`, then -> /reports/[id]
```

Reports are claimed onto a user (`reports.user_id`) either at checkout (if
already signed in) or at signup. Until claimed they are anonymous, readable
only by whoever holds the unguessable UUID, and auto-deleted after 48 hours.

## Security model

- **RLS is the boundary.** Every table has RLS enabled and scoped to
  `auth.uid()`. The anon key is public by design; the service-role key is what
  must never leak.
- **Storage is private.** The `reports` bucket is not public. Uploads use
  short-lived signed upload URLs; downloads go through
  `GET /api/reports/[id]/file`, which verifies ownership server-side and then
  mints a 60-second signed URL. Never use `getPublicUrl` here.
- **Report content is untrusted.** Parsed PDF text is attacker-controlled and
  flows into Claude prompts. Both AI call sites fence it in `<report_data>`
  tags and instruct the model to treat it as data, never instructions. Keep
  that framing on any new AI call that touches report content.
- **Rate limits** on the unauthenticated routes (`/api/upload`, `/api/parse`,
  `/api/checkout`) and per-user on chat — see the deployment caveat in
  `src/lib/rate-limit.ts`.
- **Cost controls.** `src/lib/limits.ts` caps parsed rows per report, field
  lengths, prompt size, chat message length and replayed history. Without
  these one unusual PDF can become an unbounded Anthropic bill.
- **Audit log.** Uploads, purchases, analyses, downloads and deletions are
  recorded to `audit_log` (service-role only, never user-visible). See
  `src/lib/audit.ts`.
- **User-facing errors are generic.** Raw Supabase/Stripe/Anthropic messages
  go to the logs; users get plain-language text. Keep it that way — provider
  errors leak schema detail and mean nothing to the person reading them.
- **Security claims are commitments.** Copy on `/security`, `/upload` and the
  Privacy Policy is deliberately worded to attribute infrastructure guarantees
  to the provider that actually makes them. Don't upgrade those claims without
  something to back them up.

## Scheduled jobs

Abandoned anonymous uploads must be swept, or they accumulate real credit
reports indefinitely. Schedule a daily call:

```bash
curl -X POST https://<your-domain>/api/cleanup \
  -H "x-internal-secret: $INTERNAL_API_SECRET"
```

Any scheduler that can set a custom header works. Vercel Cron cannot — see
`supabase/README.md`.

## Commands

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
npm test        # vitest
```

## Known gaps

Tracked but not yet done:

- **Dependency advisories.** `npm audit` reports high-severity Next.js and
  PostCSS issues; the fix requires a breaking upgrade to Next 16.
- **No malware scanning.** Uploads are validated by extension, size, declared
  MIME type and `%PDF-` header, but not scanned for malicious payloads.
- **No error tracking.** Failures reach `console.error` and the audit log,
  but nothing pages anyone — no Sentry or equivalent.
- **Rate limiting is per-instance** and resets on cold start.
- **`/questionnaire` is orphaned** — nothing links to it, it persists nothing,
  and it redirects to `/processing` without a `reportId`.
