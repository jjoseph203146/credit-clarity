import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "./actions";

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string; sent?: string };
}) {
  return (
    <div>
      <MarketingNav />
      <div className="flex min-h-[70vh] items-center justify-center px-8 py-16">
        <div className="w-[400px] rounded-[20px] border border-border bg-white p-9 shadow-[0_12px_40px_rgba(10,25,50,.08)]">
          <div className="mb-[26px] text-center">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-navy to-blue">
              <div className="h-3.5 w-3.5 rounded-full bg-mint" />
            </div>
            <div className="text-xl font-bold tracking-[-.02em]">Reset your password</div>
            <div className="mt-1 text-sm text-muted">
              We&apos;ll email you a link to set a new one.
            </div>
          </div>

          {searchParams.error && (
            <div className="mb-4 rounded-lg bg-[#fbecec] px-3 py-2 text-[13px] font-medium text-[#a33232]">
              {searchParams.error}
            </div>
          )}

          {searchParams.sent ? (
            <div className="rounded-lg bg-[#e6f5ef] px-3 py-3 text-[13.5px] font-medium leading-relaxed text-teal-deep">
              If an account exists for that email, we&apos;ve sent a password reset link. Check
              your inbox (and spam folder).
            </div>
          ) : (
            <form action={requestPasswordReset} className="flex flex-col gap-3">
              <div>
                <div className="mb-[5px] text-[12.5px] font-semibold text-[#3d5068]">Email</div>
                <Input name="email" type="email" placeholder="you@email.com" required />
              </div>
              <button
                type="submit"
                className="rounded-[11px] bg-navy py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#123152]"
              >
                Send Reset Link
              </button>
            </form>
          )}

          <div className="mt-4 text-center text-[13px] text-muted">
            <Link href="/login" className="font-semibold text-teal">
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
