"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteAccount } from "@/app/(app)/settings/actions";

const CONFIRM_WORD = "DELETE";

export function DeleteAccountForm() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canDelete = confirmText === CONFIRM_WORD;

  const handleConfirmDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount();
      // deleteAccount() redirects on success, so reaching here means it
      // returned an error instead of redirecting.
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="bg-[#fbecec] text-[#a33232] hover:bg-[#f6dcdc]"
      >
        Delete My Account &amp; All Data
      </Button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-[#f0d4d4] bg-[#fef8f8] p-4">
      <div className="mb-2 text-[13.5px] font-semibold text-[#a33232]">
        This permanently deletes your reports, analysis, chat history, and account. This cannot
        be undone.
      </div>
      <div className="mb-2 text-[12.5px] text-[var(--muted)]">
        Type <span className="font-mono font-bold text-[var(--ink)]">DELETE</span> to confirm.
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          className="sm:max-w-[200px]"
        />
        <div className="flex gap-2">
          <Button
            disabled={!canDelete || isPending}
            onClick={handleConfirmDelete}
            className="bg-[#a33232] text-white hover:bg-[#8a2929] disabled:opacity-50"
          >
            {isPending ? "Deleting…" : "Permanently Delete"}
          </Button>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => {
              setOpen(false);
              setConfirmText("");
              setError(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
      {error && <div className="mt-2 text-[12.5px] font-semibold text-[#a33232]">{error}</div>}
    </div>
  );
}
