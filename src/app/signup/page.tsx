"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { signup } from "./actions";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { reportId?: string; error?: string };
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      e.preventDefault();
      return;
    }

    setPasswordError("");
    signup(formData);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-8 py-14">
      <div className="w-[420px] rounded-[20px] border border-border bg-white p-9 shadow-[0_12px_40px_rgba(10,25,50,.08)]">
        <div className="mb-[18px] inline-flex items-center gap-2 rounded-full bg-[#e6f5ef] px-3 py-[5px] text-[12.5px] font-bold text-teal-deep">
          ✓ Payment received
        </div>
        <div className="mb-1.5 text-[21px] font-bold tracking-[-.02em]">
          Create your account
        </div>
        <div className="mb-[22px] text-sm leading-relaxed text-muted">
          Your analysis will be saved here so you can track progress and re-upload
          reports every 90 days.
        </div>
        {searchParams.error && (
          <div className="mb-4 rounded-lg bg-[#fbecec] px-3 py-2 text-[13px] font-medium text-[#a33232]">
            {searchParams.error}
          </div>
        )}
        <form action={signup} onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="hidden" name="reportId" value={searchParams.reportId ?? ""} />
          <div>
            <div className="mb-[5px] text-[12.5px] font-semibold text-[#3d5068]">
              Full name
            </div>
            <Input name="full_name" placeholder="Jordan Ellis" required />
          </div>
          <div>
            <div className="mb-[5px] text-[12.5px] font-semibold text-[#3d5068]">
              Email
            </div>
            <Input name="email" type="email" placeholder="jordan@email.com" required />
          </div>
          <div>
            <div className="mb-[5px] text-[12.5px] font-semibold text-[#3d5068]">
              Password
            </div>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="8+ characters"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[#3d5068] hover:text-navy transition-colors"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <div>
            <div className="mb-[5px] text-[12.5px] font-semibold text-[#3d5068]">
              Confirm password
            </div>
            <Input
              name="confirm_password"
              type={showPassword ? "text" : "password"}
              placeholder="8+ characters"
              minLength={8}
              required
            />
          </div>
          {passwordError && (
            <div className="rounded-lg bg-[#fbecec] px-3 py-2 text-[13px] font-medium text-[#a33232]">
              {passwordError}
            </div>
          )}
          <button
            type="submit"
            className="rounded-[11px] bg-navy py-3 text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#123152]"
          >
            Create Account &amp; Continue
          </button>
        </form>
      </div>
    </div>
  );
}
