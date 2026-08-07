// Content Security Policy.
//
// 'unsafe-inline' on script-src is required by Next's App Router: the
// framework inlines bootstrap and flight-data scripts on every response.
// Removing it needs per-request nonces via middleware, which is a larger
// change — this policy still meaningfully constrains what an injected script
// could reach (no arbitrary origins, no framing, no plugins).
//
// Connect/img/frame origins are the third parties this app actually talks
// to: Supabase (REST, Storage, Realtime) and Stripe Checkout.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  // next/font/google inlines its CSS but self-hosts the font files.
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "upgrade-insecure-requests",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // DENY rather than SAMEORIGIN to match `frame-ancestors 'none'`
            // in the CSP above (nothing in the app frames itself). This is
            // the legacy fallback; modern browsers use frame-ancestors.
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Two years, preloadable. Only ever sent over HTTPS by the host,
            // so this is inert in local HTTP development.
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: CSP,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
