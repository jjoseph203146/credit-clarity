import { NextResponse } from "next/server";

// Lightweight liveness check — intentionally does not ping the database so it
// can't flake in CI or under Supabase cold starts. Add a DB-backed readiness
// check separately if/when that's needed.
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
