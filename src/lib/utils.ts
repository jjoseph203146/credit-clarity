import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared between the upload page (writer) and the signup form (reader): the
// name typed at upload survives the redirect through Stripe Checkout only
// via the browser's own localStorage, since Checkout is an external
// same-tab redirect with no room to thread extra state through. Scoped by
// reportId so an old, abandoned upload attempt in the same browser can't
// autofill a name into an unrelated later signup.
export function fullNameStorageKey(reportId: string) {
  return `cc_full_name_${reportId}`;
}
