// Single source of truth for outward-facing contact and legal details.
//
// These render verbatim in the Terms of Service and Privacy Policy, which are
// legal commitments — a privacy contact that doesn't receive mail is a
// compliance problem, not a cosmetic one. They were previously hardcoded to
// `@creditclarity.example`, a reserved and undeliverable TLD.
//
// Static values rather than environment variables: nothing functional depends
// on them, they change roughly never, and keeping them here means there is no
// deploy configuration to forget.

export const siteConfig = {
  name: "Credit Clarity",

  // One inbox for all three. They're separate fields so a support address can
  // be split out later without touching the legal pages.
  legalEmail: "luminatewebco@gmail.com",
  privacyEmail: "luminatewebco@gmail.com",
  supportEmail: "luminatewebco@gmail.com",

  // The entity that actually contracts with users, and the law the Terms are
  // governed by. Both appear verbatim in the Terms of Service.
  legalEntity: "Luminate Web Design & Development, LC",
  governingLaw: "the State of Georgia",

  // How long an abandoned anonymous upload is kept before the retention job
  // deletes it. Must stay in sync with the default in
  // supabase/migrations/0003_storage_limits_and_cleanup.sql — the Privacy
  // Policy states this number.
  anonymousRetentionHours: 48,
} as const;
