import Link from "next/link";
import { AuthSplit, AuthError } from "@/components/marketing/AuthSplit";
import { SignupForm } from "./signup-form";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { reportId?: string; error?: string };
}) {
  return (
    <AuthSplit
      eyebrow={
        <span className="inline-flex items-center gap-2 rounded-full bg-[#e6f5ef] px-3 py-[5px] text-[12.5px] font-bold text-teal-deep">
          ✓ Payment received
        </span>
      }
      title="Create your account"
      subtitle="Your analysis will be saved here so you can track progress and re-upload reports every 90 days."
    >
      {searchParams.error && <AuthError>{searchParams.error}</AuthError>}

      <SignupForm reportId={searchParams.reportId ?? ""} />

      <div className="mt-6 text-center text-[13px] text-muted">
        Already have an account?{" "}
        <Link
          href={`/login${searchParams.reportId ? `?reportId=${searchParams.reportId}` : ""}`}
          className="font-semibold text-teal transition-colors hover:text-teal-deep"
        >
          Login instead
        </Link>
      </div>
    </AuthSplit>
  );
}
