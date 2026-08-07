import { reportError } from "@/lib/report-error";

// Next's global server-error hook. Catches anything that throws out of a
// route handler, Server Component, Server Action, or the proxy — i.e. every
// failure the explicit `reportError` call sites did NOT anticipate.
//
// This matters because an unhandled throw is the failure mode most likely to
// be silent: a misconfigured environment variable makes createAdminClient()
// throw at construction, the route 500s, and none of the hand-placed
// reporting inside that route ever runs. Without this hook that whole class
// of outage reaches nobody.
//
// Severity is "error" rather than "fatal": this catches everything, so it
// would otherwise page on ordinary noise. The specific money-losing paths
// already report themselves as fatal.
export async function onRequestError(
  error: unknown,
  request: { path?: string; method?: string },
  context: { routerKind?: string; routePath?: string; renderSource?: string },
) {
  await reportError({
    event: "unhandled_server_error",
    severity: "error",
    error,
    context: {
      path: request?.path,
      method: request?.method,
      routePath: context?.routePath,
      routerKind: context?.routerKind,
      renderSource: context?.renderSource,
    },
  });
}
