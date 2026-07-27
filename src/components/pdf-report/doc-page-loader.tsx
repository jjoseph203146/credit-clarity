"use client";

import Script from "next/script";

/**
 * Loads /doc-page.js (the <doc-page> custom element defined verbatim in
 * public/doc-page.js — do not modify that file) so the element is defined
 * before/soon after this route's markup paints.
 *
 * `beforeInteractive` is restricted to the root layout in the App Router,
 * so this nested route uses `afterInteractive` instead. That's safe here:
 * the design's own usage docs specify
 *   <style>doc-page:not(:defined){visibility:hidden}</style>
 * as the FOUC guard (rendered alongside this loader on the page), so the
 * still-undefined custom element simply stays invisible until upgrade
 * completes — no gating/mounting logic needed on our side.
 */
export function DocPageLoader() {
  return <Script src="/doc-page.js" strategy="afterInteractive" />;
}
