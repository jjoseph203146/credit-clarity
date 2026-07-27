# Supabase

`migrations/0001_init.sql` is the full schema (verbatim copy of the root
`supabase-schema.sql`): 11 tables, RLS enabled and scoped to `auth.uid()`
on every table.

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
