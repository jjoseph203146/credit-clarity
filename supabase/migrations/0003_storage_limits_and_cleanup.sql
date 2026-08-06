-- Storage hardening + anonymous-report retention.
--
-- Two production gaps this closes:
--   1. The `reports` bucket was never defined in SQL (created by hand in the
--      dashboard), so it had no size or MIME ceiling. The 15MB/PDF-only check
--      in src/app/upload/page.tsx is CLIENT-SIDE ONLY — the signed upload URL
--      minted by /api/upload would accept any file of any size. Enforcing it
--      on the bucket makes it real.
--   2. Every abandoned upload leaves a `reports` row (user_id null) plus the
--      PDF in Storage forever. Those are real credit reports, so retaining
--      them indefinitely is both an unbounded-growth problem and a privacy
--      obligation.

-- ============ 1. BUCKET LIMITS ============

-- Idempotent: creates the bucket if it's missing, and (re)applies the limits
-- if it already exists. Private (public = false) — reads go through signed
-- URLs / the service-role client, never anonymous public access.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reports', 'reports', false, 15728640, array['application/pdf'])
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ============ 2. ANONYMOUS REPORT RETENTION ============

-- Anonymous reports are only useful for the short window between upload and
-- the signup that claims them. Anything older than this is an abandoned
-- funnel entry (or upload spam) and should not be retained.
--
-- Returns the storage_paths of the rows it deleted so the caller can remove
-- the matching Storage objects — Postgres cannot delete Storage objects, and
-- the DB row is the only pointer to them, so the row delete must not happen
-- without the caller handling the returned paths.
--
-- Deliberately never touches claimed rows (user_id is not null): a paying
-- user's report is theirs indefinitely until they delete it.
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

-- service_role only — this is invoked by the internal cleanup route, never
-- by a browser client.
revoke all on function delete_stale_anonymous_reports(interval) from public, anon, authenticated;
grant execute on function delete_stale_anonymous_reports(interval) to service_role;

-- Supports the created_at scan above; without it cleanup seq-scans `reports`.
create index if not exists idx_reports_anonymous_created_at
  on reports (created_at)
  where user_id is null;
