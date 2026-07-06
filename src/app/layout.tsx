import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Spendscape",
    template: "%s · Spendscape",
  },
  description: "Personal financial intelligence, beautifully understood.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={geist.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased selection:bg-primary/20">
        <AppProviders>
          {children}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.015] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='128' height='128' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
              backgroundSize: "128px 128px",
            }}
          />
        </AppProviders>
      </body>
    </html>
  );
}
