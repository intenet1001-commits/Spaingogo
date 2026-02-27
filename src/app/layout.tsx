import type { Metadata, Viewport } from "next";
import "./globals.css";
import EmergencyButton from "@/components/EmergencyButton";
import PWAInstall from "@/components/PWAInstall";

export const metadata: Metadata = {
  title: "Spaingogo 🇪🇸 | 바르셀로나 맛집 가이드",
  description: "Hotel & SPA Villa Olimpic@Suites 기준, 바르셀로나 최고의 맛집을 찾아보세요.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Spaingogo",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
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
        </div>
      </body>
    </html>
  );
}
