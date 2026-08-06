# Supabase

`migrations/0001_init.sql` is the base schema (verbatim copy of the root
`supabase-schema.sql`): 11 tables, RLS enabled and scoped to `auth.uid()`
on every table.

## Migrations

| File | What it does |
| --- | --- |
| `0001_init.sql` | Base schema — tables, indexes, RLS policies. |
| `0002_security_hardening.sql` | **Empty placeholder — applies nothing.** See below. |
| `0003_storage_limits_and_cleanup.sql` | `reports` bucket size/MIME limits + anonymous-report retention function. |

### ⚠️ `0002_security_hardening.sql` is a stub

The file contains the literal text `ok` and applies no SQL. If a database was
migrated from this folder, that step silently no-opped. Diff your live schema
against `0001_init.sql` before trusting it, and either write the intended
hardening into `0002` or delete it so the gap isn't mistaken for applied work.

### `0003` — storage limits and retention

Two things the app cannot enforce on its own:

- **Bucket limits.** The 15MB / PDF-only check in `src/app/upload/page.tsx` is
  client-side only; the signed upload URL from `/api/upload` would otherwise
  accept any file of any size. `0003` puts a real ceiling on the bucket.
- **Retention.** Abandoned uploads leave `reports` rows (`user_id` null) plus
  PDFs in Storage indefinitely. `delete_stale_anonymous_reports(interval)`
  removes rows older than the window (default 48h) and returns their
  `storage_path`s so the caller can delete the objects. Claimed reports are
  never touched.

Drive it by scheduling a POST to `/api/cleanup` with the
`x-internal-secret: $INTERNAL_API_SECRET` header (daily is fine):

```
curl -X POST https://<your-domain>/api/cleanup \
  -H "x-internal-secret: $INTERNAL_API_SECRET"
```

Any scheduler that can set a custom header works (GitHub Actions, Supabase
`pg_cron` + `pg_net`, a hosted cron service). Vercel Cron **cannot** — it
sends its own `Authorization: Bearer $CRON_SECRET` and no custom headers, so
it would need a separate GET handler checking that header instead.

## Apply to a project

Linked via the Supabase CLI:

```
supabase link --project-ref <your-project-ref>
supabase db push
```

Or paste `migrations/0001_init.sql` directly into the Supabase SQL editor.

## Regenerate types

`src/lib/supabase/types.ts` is hand-written from the schema. Once linked,
replace it with the CLI's generated types:

```
supabase gen types typescript --local > src/lib/supabase/types.ts
```
