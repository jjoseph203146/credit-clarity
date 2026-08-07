import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument-sans",
  display: "swap",
});

// Display face — hero headlines only. Pairs with Instrument Sans by design,
// and keeps headings from reading in the same voice as body copy.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Credit Clarity",
  description:
    "AI-powered credit report analysis. Educational insights, not credit repair.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Credit Clarity",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#081527",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${jetBrainsMono.variable}`}
    >
      <body className="font-sans antialiased bg-[var(--bg)] text-[var(--ink)]">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
