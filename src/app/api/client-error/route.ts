import { NextResponse } from "next/server";
import { clientIp, hit, tooManyRequests } from "@/lib/rate-limit";
import { reportError } from "@/lib/report-error";

// Sink for errors caught by the client-side error boundaries
// (src/app/global-error.tsx and src/app/(app)/error.tsx). Those run in the
// browser, where console.error reaches nobody — this is how a client crash
// becomes something anyone can find out about.
//
// Unauthenticated by necessity: an error boundary fires precisely when the
// page is broken, which may include whatever would have established identity.
// That makes this a public write endpoint, so it is deliberately narrow:
//   - rate limited per IP, tighter than the other public routes
//   - accepts only the three fields below, each length-capped
//   - reports at "error", never "fatal", so a hostile client cannot page
//     anyone at will
//   - the body is treated as untrusted text and is never parsed or executed
//
// Worst case this lets someone write bounded junk into the logs at a limited
// rate, which is an acceptable trade for seeing real client crashes.

const CLIENT_ERROR_LIMIT = 10;
const CLIENT_ERROR_WINDOW_MS = 10 * 60 * 1000;

const MAX_MESSAGE_CHARS = 500;
const MAX_DIGEST_CHARS = 100;
const MAX_PATH_CHARS = 200;

function clamp(value: unknown, max: number): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  return value.slice(0, max);
}

export async function POST(req: Request) {
  const limit = hit(
    `client-error:${clientIp(req)}`,
    CLIENT_ERROR_LIMIT,
    CLIENT_ERROR_WINDOW_MS,
  );
  if (!limit.ok) return tooManyRequests(limit);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const input = (body ?? {}) as Record<string, unknown>;
  const message = clamp(input.message, MAX_MESSAGE_CHARS);

  if (!message) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  void reportError({
    event: "client_error",
    severity: "error",
    error: message,
    context: {
      // Next's error digest is the only reliable link between a client-side
      // error and the full server-side stack it was produced from.
      digest: clamp(input.digest, MAX_DIGEST_CHARS),
      path: clamp(input.path, MAX_PATH_CHARS),
      boundary: clamp(input.boundary, 50),
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
  });

  return NextResponse.json({ received: true });
}
