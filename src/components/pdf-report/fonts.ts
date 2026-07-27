// Font loaders for the PDF report. Kept separate from the report page/root
// layout so this route can self-host the exact fonts the design reference
// (`Credit Clarity PDF Report.dc.html`) pulls from Google Fonts
// (Instrument Sans + JetBrains Mono) without touching `src/app/layout.tsx`.
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";

export const reportSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-report-sans",
  display: "swap",
});

export const reportMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-report-mono",
  display: "swap",
});

export const monoFontFamily = "var(--font-report-mono), 'JetBrains Mono', monospace";
export const sansFontFamily =
  "var(--font-report-sans), 'Instrument Sans', system-ui, sans-serif";
