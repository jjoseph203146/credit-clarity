import Link from "next/link";
import {
  AuthSplit,
  AuthSubmitButton,
  AuthLabel,
  AuthError,
} from "@/components/marketing/AuthSplit";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; sent?: string };
}) {
  return (
    <AuthSplit
      title="Reset your password"
      subtitle="We'll email you a link to set a new one."
    >
      {searchParams.error && <AuthError>{searchParams.error}</AuthError>}

      {searchParams.sent ? (
        <div className="rounded-lg bg-[#e6f5ef] px-3 py-3 text-[13.5px] font-medium leading-relaxed text-teal-deep">
          If an account exists for that email, we&apos;ve sent a password reset link. Check your
          inbox (and spam folder).
        </div>
      ) : (
        <form action={requestPasswordReset} className="flex flex-col gap-3">
          <div>
            <AuthLabel>Email</AuthLabel>
            <Input name="email" type="email" placeholder="you@email.com" required />
          </div>
          <AuthSubmitButton>Send Reset Link</AuthSubmitButton>
        </form>
      )}

      <div className="mt-4 text-center text-[13px] text-muted">
        <Link href="/login" className="font-semibold text-teal hover:text-teal-deep">
          Back to log in
        </Link>
      </div>
    </AuthSplit>
  );
}
