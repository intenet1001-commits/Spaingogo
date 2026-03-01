"use client";

import { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";

const DINNER_MAP_URL = "https://maps.app.goo.gl/v1oTjfKAmeiR2kYM8?g_st=ic";
const SESSION_KEY = "dinner-dismissed";

export default function DinnerAnnouncement() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const now = new Date();
    const isMarch1 =
      now.getFullYear() === 2026 &&
      now.getMonth() === 2 &&
      now.getDate() === 1;
    const isBefore18 = now.getHours() < 18;
    const alreadyDismissed = sessionStorage.getItem(SESSION_KEY) === "1";

    if (isMarch1 && isBefore18 && !alreadyDismissed) {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#FFFDF8] rounded-t-3xl shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[#E8DDD0]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-2">
          <h2 className="font-serif text-xl font-bold text-[#1A1209]">
            🍽️ 오늘 저녁 만찬 안내
          </h2>
          <button
            onClick={dismiss}
            className="w-8 h-8 rounded-full bg-[#F5F0E8] flex items-center justify-center"
            aria-label="닫기"
          >
            <X size={16} className="text-[#6B5E4E]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pb-8 space-y-4">
          <div className="bg-[#C60B1E]/8 border border-[#C60B1E]/20 rounded-2xl p-4 space-y-1.5">
            <p className="text-sm text-[#1A1209] leading-snug">
              <span className="font-semibold text-[#C60B1E]">
                3월 1일(일) 오늘 저녁 6시 전까지
              </span>{" "}
              아래 장소에서 만찬이 진행됩니다.
            </p>
            <p className="text-sm text-[#1A1209] leading-snug">
              지도를 확인하고 늦지 않게 이동해 주세요! 🇪🇸
            </p>
          </div>

          <a
            href={DINNER_MAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#C60B1E] text-white font-semibold text-sm active:scale-[0.98] transition-transform"
          >
            <MapPin size={18} />
            만찬 장소 지도 보기
          </a>

          <button
            onClick={dismiss}
            className="w-full py-3 rounded-2xl border border-[#E8DDD0] text-[#6B5E4E] text-sm font-medium active:scale-[0.98] transition-transform"
          >
            닫기
          </button>
        </div>
      </div>
    </>
  );
}
