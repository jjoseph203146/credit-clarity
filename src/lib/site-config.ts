// Single source of truth for outward-facing contact details.
//
// These appear in the Terms and Privacy pages, which are legal commitments —
// a privacy contact that doesn't receive mail is a compliance problem, not a
// cosmetic one. They were previously hardcoded to `@creditclarity.example`
// (a reserved, undeliverable TLD).
//
// Set NEXT_PUBLIC_LEGAL_EMAIL / NEXT_PUBLIC_PRIVACY_EMAIL / NEXT_PUBLIC_SUPPORT_EMAIL
// in the environment. The fallbacks below are still placeholders: they are
// deliberately obvious so an unconfigured deploy reads as unfinished rather
// than quietly shipping a dead address that looks real.

const PLACEHOLDER = "SET_NEXT_PUBLIC_CONTACT_EMAIL@example.invalid";
const LEGAL_PLACEHOLDER = "[LEGAL ENTITY NAME — NOT YET SET]";
const JURISDICTION_PLACEHOLDER = "[STATE/JURISDICTION — NOT YET SET]";

export const siteConfig = {
  name: "Credit Clarity",
  legalEmail: process.env.NEXT_PUBLIC_LEGAL_EMAIL || PLACEHOLDER,
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || PLACEHOLDER,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || PLACEHOLDER,

  // The entity that actually contracts with users, and the law the Terms are
  // governed by. Both appear verbatim in the Terms of Service, so they must
  // be the real registered entity and a real jurisdiction before launch.
  legalEntity: process.env.NEXT_PUBLIC_LEGAL_ENTITY || LEGAL_PLACEHOLDER,
  governingLaw: process.env.NEXT_PUBLIC_GOVERNING_LAW || JURISDICTION_PLACEHOLDER,

  // How long an abandoned anonymous upload is kept before the retention job
  // deletes it. Must stay in sync with the default in
  // supabase/migrations/0003_storage_limits_and_cleanup.sql — the Privacy
  // Policy states this number.
  anonymousRetentionHours: 48,
} as const;

/** True when any outward-facing legal detail is still a placeholder. */
export const hasPlaceholderContact =
  siteConfig.legalEmail === PLACEHOLDER ||
  siteConfig.privacyEmail === PLACEHOLDER ||
  siteConfig.supportEmail === PLACEHOLDER ||
  siteConfig.legalEntity === LEGAL_PLACEHOLDER ||
  siteConfig.governingLaw === JURISDICTION_PLACEHOLDER;
