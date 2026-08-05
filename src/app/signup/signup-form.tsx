"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AuthLabel, AuthSubmitButton } from "@/components/marketing/auth-ui";
import { signup } from "./actions";

export function SignupForm({ reportId }: { reportId: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (password !== confirmPassword) {
      e.preventDefault();
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    // Submission is handled by the form's `action`. Calling signup() here as
    // well would run the server action twice on every successful submit.
  }

  return (
    <form action={signup} onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input type="hidden" name="reportId" value={reportId} />
      <div>
        <AuthLabel>Full name</AuthLabel>
        <Input name="full_name" placeholder="Jordan Ellis" required />
      </div>
      <div>
        <AuthLabel>Email</AuthLabel>
        <Input name="email" type="email" placeholder="jordan@email.com" required />
      </div>
      <div>
        <AuthLabel>Password</AuthLabel>
        <div className="relative">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="8+ characters"
            minLength={8}
            required
            className="pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-[13px] font-semibold text-[#3d5068] transition-colors duration-150 hover:text-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      <div>
        <AuthLabel>Confirm password</AuthLabel>
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
      <AuthSubmitButton>Create Account &amp; Continue</AuthSubmitButton>
    </form>
  );
}
