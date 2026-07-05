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
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
