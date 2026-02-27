"use client";

import { X } from "lucide-react";

export type Platform = "ios" | "android" | "ios-inapp" | "android-inapp" | null;

interface Props {
  open: boolean;
  platform: Platform;
  onClose: () => void;
}

export default function InstallBanner({ open, platform, onClose }: Props) {
  if (!open || !platform) return null;

  const isInApp = platform === "ios-inapp" || platform === "android-inapp";

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50 animate-slide-up">
      <div
        className={`rounded-2xl shadow-2xl border border-white/20 p-4 ${
          isInApp
            ? "bg-gradient-to-br from-amber-500 to-amber-600"
            : "bg-gradient-to-br from-[#C60B1E] via-[#A00818] to-[#800612]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="text-2xl flex-shrink-0 mt-0.5">
              {isInApp ? "⚠️" : "📲"}
            </div>
            <div>
              {platform === "ios" && (
                <>
                  <p className="text-sm font-bold text-white mb-1">홈 화면에 추가하기</p>
                  <p className="text-xs text-white/85 leading-relaxed">
                    하단 <strong>□↑ 공유</strong> 버튼 탭 →<br />
                    <strong>&ldquo;홈 화면에 추가&rdquo;</strong> 선택 →<br />
                    우상단 <strong>&ldquo;추가&rdquo;</strong> 탭
                  </p>
                </>
              )}
              {platform === "android" && (
                <>
                  <p className="text-sm font-bold text-white mb-1">홈 화면에 추가하기</p>
                  <p className="text-xs text-white/85 leading-relaxed">
                    우상단 <strong>⋮ 메뉴</strong> 탭 →<br />
                    <strong>&ldquo;홈 화면에 추가&rdquo;</strong> 선택 →<br />
                    <strong>&ldquo;추가&rdquo;</strong> 탭
                  </p>
                </>
              )}
              {platform === "ios-inapp" && (
                <>
                  <p className="text-sm font-bold text-white mb-1">인앱 브라우저로 열림</p>
                  <p className="text-xs text-white/85 leading-relaxed">
                    홈 추가는 Safari에서만 가능해요.<br />
                    우하단 <strong>··· 버튼</strong> →<br />
                    <strong>&ldquo;Safari로 열기&rdquo;</strong> 탭
                  </p>
                </>
              )}
              {platform === "android-inapp" && (
                <>
                  <p className="text-sm font-bold text-white mb-1">인앱 브라우저로 열림</p>
                  <p className="text-xs text-white/85 leading-relaxed">
                    홈 추가는 Chrome에서만 가능해요.<br />
                    <strong>⋮ 메뉴</strong> →<br />
                    <strong>&ldquo;Chrome으로 열기&rdquo;</strong> 탭
                  </p>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white/25 text-white flex-shrink-0 active:scale-95 transition-all mt-0.5"
            aria-label="닫기"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
