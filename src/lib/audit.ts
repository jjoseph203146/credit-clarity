import { createAdminClient } from "@/lib/supabase/admin";
import type { AuditAction } from "@/lib/supabase/types";

// Append-only record of security-sensitive actions on credit report data.
// See supabase/migrations/0005_audit_log.sql.
//
// Writes through the service-role client: the table is default-deny under
// RLS, so no browser client can read the trail or forge an entry.

type AuditInput = {
  action: AuditAction;
  userId?: string | null;
  reportId?: string | null;
  /** Small action-specific extras. Never credit report contents or PII. */
  metadata?: Record<string, unknown>;
  /** Pass the incoming Request to capture IP and user agent. */
  req?: Request;
};

function clientIpOf(req: Request): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || null;
}

/**
 * Records an audit entry. Never throws and never rejects: an audit write
 * failing must not break the user action it describes — a user should not be
 * unable to delete their account because logging is down. Failures are
 * logged loudly instead, since a silently missing trail is its own problem.
 *
 * Not awaited by most callers; treat it as fire-and-forget.
 */
export async function audit(input: AuditInput): Promise<void> {
  try {
    const { error } = await createAdminClient()
      .from("audit_log")
      .insert({
        action: input.action,
        user_id: input.userId ?? null,
        report_id: input.reportId ?? null,
        ip: input.req ? clientIpOf(input.req) : null,
        user_agent: input.req?.headers.get("user-agent")?.slice(0, 500) ?? null,
        metadata: input.metadata ?? {},
      });

    if (error) {
      console.error(`[audit] failed to record ${input.action}:`, error.message);
    }
  } catch (err) {
    console.error(`[audit] threw while recording ${input.action}:`, err);
  }
}
