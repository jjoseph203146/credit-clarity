import Image from "next/image";
import { MarketingNav } from "@/components/marketing/MarketingNav";

/**
 * Shared split-screen shell for the auth pages (log in, sign up, forgot /
 * reset password): brand panel left, form right, brand-gradient seam between.
 * The panel is decorative, so it drops out below lg rather than pushing the
 * form down a screen on mobile.
 */
export function AuthSplit({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  /** Optional pill above the heading, e.g. the post-payment confirmation. */
  eyebrow?: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <MarketingNav />

      <div className="grid min-h-[calc(100vh-76px)] grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_12px_minmax(0,1.1fr)]">
        <div className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center">
          {/* Brand Navy-to-Teal-to-Mint, run on a diagonal so the mint sits
              top-left and deep navy meets the seam — a bright edge against the
              white form panel read as an unfinished join. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(155deg, #2ee6a8 0%, #0e9f77 26%, #0b1f3a 64%, #081527 100%)",
            }}
          />
          {/* Depth: an off-centre bloom plus fine grain, so the panel isn't a
              flat gradient wash. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(680px 560px at 16% 10%, rgba(46,230,168,.28), transparent 64%), radial-gradient(560px 500px at 92% 96%, rgba(8,21,39,.6), transparent 62%)",
            }}
          />
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[.16] mix-blend-overlay"
          >
            <filter id="cc-auth-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" />
            </filter>
            <rect width="100%" height="100%" filter="url(#cc-auth-noise)" />
          </svg>

          <div className="relative flex flex-col items-center px-12 text-center">
            {/* White plate keeps the logo in its real two-tone brand colors
                rather than flattening it to a silhouette on the gradient. */}
            <div className="flex h-[132px] w-[132px] items-center justify-center rounded-[34px] bg-white shadow-[0_2px_4px_rgba(8,21,39,.18),0_28px_60px_-20px_rgba(8,21,39,.55)]">
              <Image src="/logo.png" alt="" width={309} height={235} className="h-[76px] w-auto" />
            </div>
            <div className="mt-8 font-display text-[46px] font-normal leading-[1.05] tracking-[-.03em] text-white">
              Credit Clarity
            </div>
            <p className="mt-3 max-w-[340px] text-[15px] leading-[1.7] text-white/85">
              Your credit report, finally legible.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12.5px] font-medium text-white/70">
              <span>No credit pull</span>
              <span aria-hidden>·</span>
              <span>No SSN required</span>
              <span aria-hidden>·</span>
              <span>Delete anytime</span>
            </div>
          </div>
        </div>

        {/* Brand seam between the two halves: the full Navy → Teal → Mint ramp
            run vertically, deliberately counter to the panel behind it (which
            goes mint at top to navy at bottom) so the seam stays legible at
            both ends instead of vanishing into a matching tone. Its own grid
            column, so it can't drift if the split ratio changes. */}
        <div
          aria-hidden
          className="hidden lg:block"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #0b1f3a 0%, #0b7d5e 30%, #0e9f77 52%, #5bd6a9 82%, #2ee6a8 100%)",
            boxShadow: "0 0 48px rgba(46,230,168,.45), 0 0 14px rgba(14,159,119,.55)",
          }}
        />

        <div className="flex items-center justify-center bg-white px-8 py-16">
          <div className="w-full max-w-[420px]">
            {eyebrow && <div className="mb-4">{eyebrow}</div>}
            <div className="mb-[26px]">
              <h1 className="font-display text-[34px] font-normal leading-[1.1] tracking-[-.02em] text-navy">
                {title}
              </h1>
              {subtitle && (
                <div className="mt-1.5 text-sm leading-relaxed text-muted">{subtitle}</div>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export { AuthSubmitButton, AuthLabel, AuthError } from "./auth-ui";
