-- Read-only schema verification. Safe to run against production — this only
-- SELECTs from catalog views and changes nothing.
--
-- Purpose: 0002_security_hardening.sql is an empty stub (it contains the
-- literal text `ok` and applies no SQL), so a database migrated from this
-- folder may be missing whatever that step was meant to add. There is no
-- lost SQL to recover — instead, this confirms that the security-relevant
-- parts of 0001_init.sql and 0003 are actually present.
--
-- Every row returned should read status = 'OK'. Anything marked MISSING is a
-- real gap between this repo and the live database.

-- ---------- 1. Tables ----------
select
  'table' as check_type,
  expected.name as object,
  case when c.relname is null then 'MISSING' else 'OK' end as status
from (values
  ('organizations'), ('users'), ('reports'), ('payments'),
  ('report_accounts'), ('report_collections'), ('report_inquiries'),
  ('action_plans'), ('ai_conversations'), ('learning_progress'),
  ('notifications')
) as expected(name)
left join pg_class c
  on c.relname = expected.name
 and c.relnamespace = 'public'::regnamespace
 and c.relkind = 'r'

union all

-- ---------- 2. Row Level Security enabled ----------
-- RLS off on any of these means that table is fully readable by any client
-- holding the anon key.
select
  'rls_enabled',
  expected.name,
  case
    when c.relname is null then 'MISSING (no such table)'
    when c.relrowsecurity then 'OK'
    else 'MISSING (RLS DISABLED)'
  end
from (values
  ('organizations'), ('users'), ('reports'), ('payments'),
  ('report_accounts'), ('report_collections'), ('report_inquiries'),
  ('action_plans'), ('ai_conversations'), ('learning_progress'),
  ('notifications')
) as expected(name)
left join pg_class c
  on c.relname = expected.name
 and c.relnamespace = 'public'::regnamespace
 and c.relkind = 'r'

union all

-- ---------- 3. RLS policies ----------
-- `organizations` is intentionally absent here: 0001 enables RLS on it with
-- no policies (default-deny) because no app code touches it yet.
select
  'policy',
  expected.tbl || ': ' || expected.policyname,
  case when p.policyname is null then 'MISSING' else 'OK' end
from (values
  ('users',              'users read own row'),
  ('users',              'users update own row'),
  ('reports',            'reports read own'),
  ('reports',            'reports update own'),
  ('payments',           'payments read own'),
  ('report_accounts',    'report_accounts read own'),
  ('report_collections', 'report_collections read own'),
  ('report_inquiries',   'report_inquiries read own'),
  ('action_plans',       'action_plans owner'),
  ('ai_conversations',   'ai_conversations owner'),
  ('learning_progress',  'learning_progress owner'),
  ('notifications',      'notifications owner')
) as expected(tbl, policyname)
left join pg_policies p
  on p.schemaname = 'public'
 and p.tablename = expected.tbl
 and p.policyname = expected.policyname

union all

-- ---------- 4. Storage bucket limits (migration 0003) ----------
select
  'storage_bucket',
  'reports bucket: ' || expected.attribute,
  expected.status
from (
  select 'exists' as attribute,
         case when count(*) = 0 then 'MISSING' else 'OK' end as status
  from storage.buckets where id = 'reports'
  union all
  select 'private',
         case when bool_or(public) then 'MISSING (BUCKET IS PUBLIC)' else 'OK' end
  from storage.buckets where id = 'reports'
  union all
  select 'size limit 15MB',
         case when bool_or(file_size_limit = 15728640) then 'OK' else 'MISSING' end
  from storage.buckets where id = 'reports'
  union all
  select 'pdf-only mime',
         case when bool_or(allowed_mime_types @> array['application/pdf']) then 'OK' else 'MISSING' end
  from storage.buckets where id = 'reports'
) as expected

union all

-- ---------- 5. Retention function (migration 0003) ----------
select
  'function',
  'delete_stale_anonymous_reports',
  case when count(*) = 0 then 'MISSING' else 'OK' end
from pg_proc
where proname = 'delete_stale_anonymous_reports'
  and pronamespace = 'public'::regnamespace

order by 1, 2;
