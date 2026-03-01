import type { Metadata, Viewport } from "next";
import "./globals.css";
import EmergencyButton from "@/components/EmergencyButton";
import PWAInstall from "@/components/PWAInstall";
import DinnerAnnouncement from "@/components/DinnerAnnouncement";

export const metadata: Metadata = {
  title: "Spaingogo 🇪🇸 | 바르셀로나 최대 음식 플랫폼",
  description: "바르셀로나 최대 음식 플랫폼 — 호텔 기준 맛집·명소를 한눈에 찾아보세요.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Spaingogo",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Spaingogo 🇪🇸 | 바르셀로나 최대 음식 플랫폼",
    description: "바르셀로나 최대 음식 플랫폼 — 호텔 기준 맛집·명소를 한눈에 찾아보세요.",
    url: "https://spaingogo.vercel.app",
    siteName: "Spaingogo",
    locale: "ko_KR",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#C60B1E",
};

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
          <PWAInstall />
          <DinnerAnnouncement />
        </div>
      </body>
    </html>
  );
}
