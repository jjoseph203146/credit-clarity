import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Service-role client — bypasses Row Level Security entirely.
//
// Server-only. Never import this from a Client Component or expose it to
// the browser. Per BUILD.md, this is the client the anonymous
// upload -> parse -> analyze pipeline writes through (reports.user_id is
// null pre-signup, so RLS-scoped clients can't touch those rows yet).
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
