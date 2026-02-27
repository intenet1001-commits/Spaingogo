"use client";

import { useState, useEffect } from "react";
import InstallBanner, { type Platform } from "./InstallBanner";

const INAPP_RE = /KAKAOTALK|Instagram|NAVER|Line/i;

export default function PWAInstall() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    // 이미 설치된 standalone 모드면 무시
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((window.navigator as { standalone?: boolean }).standalone) return;

    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    if (!isIOS && !isAndroid) return;

    let detected: Platform = null;
    if (isIOS) {
      detected = INAPP_RE.test(ua) ? "ios-inapp" : "ios";
    } else {
      detected = INAPP_RE.test(ua) ? "android-inapp" : "android";
    }
    setPlatform(detected);

    // 이전에 닫은 적 없으면 자동 표시
    if (!sessionStorage.getItem("install-banner-dismissed")) {
      setBannerOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem("install-banner-dismissed", "1");
    setBannerOpen(false);
  };

  return (
    <>
      {/* 📲 버튼 — 플랫폼 감지된 경우만 표시 */}
      {platform && (
        <button
          onClick={() => setBannerOpen(true)}
          className="fixed top-3 right-3 z-40 w-9 h-9 bg-black/25 backdrop-blur-sm rounded-full flex items-center justify-center text-base active:scale-95 transition-all"
          aria-label="홈 화면에 추가"
        >
          📲
        </button>
      )}

      <InstallBanner
        open={bannerOpen}
        platform={platform}
        onClose={handleClose}
      />
    </>
  );
}
