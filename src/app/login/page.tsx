import Link from "next/link";
import {
  AuthSplit,
  AuthSubmitButton,
  AuthLabel,
  AuthError,
} from "@/components/marketing/AuthSplit";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string; reportId?: string };
}) {
  const reportId = searchParams.reportId;

  return (
    <AuthSplit
      title="Welcome back"
      subtitle={
        reportId
          ? "Log in and we'll add the report you just paid for to your account."
          : "Log in to your Credit Clarity account"
      }
    >
      {searchParams.error && <AuthError>{searchParams.error}</AuthError>}
      {searchParams.message && (
        <div className="mb-4 rounded-lg bg-[#e6f5ef] px-3 py-2 text-[13px] font-medium text-teal-deep">
          {searchParams.message}
        </div>
      )}
      <form action={login} className="flex flex-col gap-3">
        {/* Carries the just-paid report through sign-in so it can be claimed. */}
        {reportId && <input type="hidden" name="reportId" value={reportId} />}
        <div>
          <AuthLabel>Email</AuthLabel>
          <Input name="email" type="email" placeholder="you@email.com" required />
        </div>
        <div>
          <AuthLabel>Password</AuthLabel>
          <Input name="password" type="password" placeholder="••••••••" required />
        </div>
        <Link
          href="/forgot-password"
          className="self-end rounded text-[12.5px] font-semibold text-teal transition-colors duration-150 hover:text-teal-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
        >
          Forgot password?
        </Link>
        <AuthSubmitButton>Log In</AuthSubmitButton>
        <div className="mt-1 text-center text-[13px] text-muted">
          New here?{" "}
          <Link href="/upload" className="font-semibold text-teal hover:text-teal-deep">
            Start with your report
          </Link>{" "}
          — no account needed.
        </div>
      </form>
    </AuthSplit>
  );
}
