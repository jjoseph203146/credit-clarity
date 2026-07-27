import { MarketingNav } from "@/components/marketing/MarketingNav";
import { Input } from "@/components/ui/input";
import { resetPassword } from "./actions";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
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
            <div className="text-xl font-bold tracking-[-.02em]">Set a new password</div>
          </div>

          {searchParams.error && (
            <div className="mb-4 rounded-lg bg-[#fbecec] px-3 py-2 text-[13px] font-medium text-[#a33232]">
              {searchParams.error}
            </div>
          )}

          <form action={resetPassword} className="flex flex-col gap-3">
            <div>
              <div className="mb-[5px] text-[12.5px] font-semibold text-[#3d5068]">
                New password
              </div>
              <Input
                name="password"
                type="password"
                placeholder="8+ characters"
                minLength={8}
                required
              />
            </div>
            <button
              type="submit"
              className="rounded-[11px] bg-navy py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#123152]"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
