import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Spaingogo 🇪🇸 | 바르셀로나 맛집 가이드",
  description: "Hotel & SPA Villa Olimpic@Suites 기준, 바르셀로나 최고의 맛집을 찾아보세요.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import EmergencyButton from "@/components/EmergencyButton";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#FAFAF8] dark:bg-[#1A1410]">
        <div className="max-w-md mx-auto min-h-dvh relative bg-white dark:bg-[#1E1810] shadow-2xl">
          {children}
          <EmergencyButton />
        </div>
      </body>
    </html>
  );
}
