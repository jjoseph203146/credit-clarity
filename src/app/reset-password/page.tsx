import {
  AuthSplit,
  AuthSubmitButton,
  AuthLabel,
  AuthError,
} from "@/components/marketing/AuthSplit";
import { Input } from "@/components/ui/input";
import { resetPassword } from "./actions";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <AuthSplit title="Set a new password">
      {searchParams.error && <AuthError>{searchParams.error}</AuthError>}

      <form action={resetPassword} className="flex flex-col gap-3">
        <div>
          <AuthLabel>New password</AuthLabel>
          <Input
            name="password"
            type="password"
            placeholder="8+ characters"
            minLength={8}
            required
          />
        </div>
        <AuthSubmitButton>Update Password</AuthSubmitButton>
      </form>
    </AuthSplit>
  );
}
