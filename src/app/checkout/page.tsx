"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

const MONO = "font-[family-name:var(--font-jetbrains-mono)]";

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPageInner />
    </Suspense>
  );
}

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("reportId");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    if (paying) return;
    if (!reportId) {
      setError("We couldn't find your report. Please start over from the upload page.");
      return;
    }
    setError(null);
    setPaying(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Something went wrong starting checkout.");
      }
      window.location.href = data.url;
    } catch (err) {
      setPaying(false);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong starting checkout. Please try again."
      );
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-8 py-14">
      <div className="grid grid-cols-[340px_400px] overflow-hidden rounded-[20px] border border-border bg-white shadow-[0_16px_48px_rgba(10,25,50,.1)] max-md:grid-cols-1">
        <div className="bg-navy p-8 text-white">
          <div className="mb-[18px] text-[13px] font-semibold text-[#8fa3ba]">
            ORDER SUMMARY
          </div>
          <div className="mb-1 text-[17px] font-bold">Full Credit Analysis</div>
          <div className="mb-[22px] text-[13px] leading-relaxed text-[#b9c8da]">
            AI account analysis · action plan · PDF report · Clarity AI Q&amp;A
          </div>
          <div className="flex justify-between border-t border-white/[.12] py-3 text-sm">
            <span className="text-[#b9c8da]">Subtotal</span>
            <span className={MONO}>$5.00</span>
          </div>
          <div className="flex justify-between border-t border-white/[.12] py-3 text-[15px] font-bold">
            <span>Total due today</span>
            <span className={MONO}>$5.00</span>
          </div>
          <div className="mt-[22px] text-xs leading-relaxed text-[#8fa3ba]">
            One-time payment. Not a subscription. 7-day money-back guarantee if the
            analysis isn&apos;t useful to you.
          </div>
        </div>
        <div className="flex flex-col p-8">
          <div className="mb-5 flex items-center justify-between">
            <div className="text-base font-bold">Continue to payment</div>
            <div className="rounded-lg bg-[var(--bg)] px-2.5 py-1 text-[11.5px] font-semibold text-muted">
              Powered by Stripe
            </div>
          </div>
          <div className="mb-6 text-[13.5px] leading-relaxed text-muted">
            You&apos;ll be redirected to Stripe&apos;s secure checkout to enter your
            payment details. We never see or store your card information.
          </div>
          <div className="mt-auto flex flex-col gap-3">
            {!reportId && !error && (
              <div className="rounded-[10px] bg-[#fdf3e7] px-3.5 py-3 text-[13px] font-medium text-[#9a6314]">
                No report found. Please upload a credit report first.
              </div>
            )}
            {error && (
              <div className="rounded-[10px] bg-[#fbecec] px-3.5 py-3 text-[13px] font-medium text-[#a33232]">
                {error}
              </div>
            )}
            <button
              onClick={pay}
              disabled={paying || !reportId}
              className={`mt-1 rounded-[11px] py-3.5 text-[15px] font-semibold text-white transition-colors ${
                paying || !reportId
                  ? "cursor-not-allowed bg-muted"
                  : "bg-navy hover:bg-[#123152]"
              }`}
            >
              {paying ? "Redirecting to Stripe…" : "Pay $5.00"}
            </button>
            <div className="text-center text-xs text-[#8fa3ba]">
              🔐 Encrypted &amp; PCI-compliant. We never store card numbers.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
