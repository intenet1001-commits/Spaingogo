"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Hotel, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { distanceFromHotel, formatDistance, haversineDistance } from "@/domain/services/DistanceCalculatorService";
import { useUserLocation } from "@/hooks/useUserLocation";
import restaurantsData from "@/infrastructure/data/restaurants.json";

// 상황 정의
const SITUATIONS = [
  { id: "tired",      emoji: "😴", label: "피곤할 때",    desc: "가볍고 따뜻한 음식" },
  { id: "romantic",   emoji: "💑", label: "로맨틱한 밤",  desc: "분위기 있는 곳" },
  { id: "friends",    emoji: "🥂", label: "친구들과",     desc: "나눠 먹기 좋은 곳" },
  { id: "hangover",   emoji: "🤢", label: "해장이 필요해", desc: "든든하고 가까운 곳" },
  { id: "special",    emoji: "🎉", label: "특별한 날",    desc: "미슐랭 & 고급" },
  { id: "budget",     emoji: "💰", label: "가성비로",     desc: "$~$$ 알뜰 코스" },
  { id: "morning",    emoji: "🌅", label: "아침 일찍",    desc: "아침 영업 맛집" },
  { id: "nightsnack", emoji: "🌙", label: "야식 생각",    desc: "늦게까지 여는 곳" },
  { id: "wine",       emoji: "🍷", label: "와인 한 잔",   desc: "자연파 와인바" },
  { id: "quick",      emoji: "📍", label: "가까운데서",   desc: "호텔에서 도보 거리" },
  { id: "seafood",    emoji: "🦞", label: "해산물 먹고파", desc: "지중해 신선 해산물" },
  { id: "dessert",    emoji: "🍩", label: "달달한 거",    desc: "디저트 & 카페" },
] as const;

type SituationId = (typeof SITUATIONS)[number]["id"];

// 상황별 맛집 필터링 규칙
function filterBySituation(id: SituationId) {
  const all = restaurantsData.map((r) => ({
    ...r,
    distanceMeters: distanceFromHotel({ lat: r.lat, lng: r.lng }),
    distanceText: formatDistance(distanceFromHotel({ lat: r.lat, lng: r.lng })),
  }));

  switch (id) {
    case "tired":
      // 피곤할 때 = 가깝고 편안한 타파스/해산물 (빠르게와 차별화)
      return all
        .filter((r) =>
          r.distanceMeters < 2500 &&
          (r.category === "tapas" || r.category === "seafood" ||
           r.tags.some((t) => ["현지인추천", "카탈루냐", "역사"].includes(t)))
        )
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 4);

    case "romantic":
      return all
        .filter((r) =>
          r.tags.some((t) => ["로맨틱", "해변뷰", "고급", "지중해", "분위기"].includes(t)) ||
          r.priceRange === "$$$" || r.priceRange === "$$$$"
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "friends":
      return all
        .filter((r) =>
          ["tapas", "pintxos", "paella"].includes(r.category) ||
          r.tags.some((t) => ["타파스", "핀초스", "공유", "다양"].includes(t))
        )
        .sort((a, b) => b.reviewCount - a.reviewCount)
        .slice(0, 4);

    case "hangover":
      // 해장 — 해산물·파에야·든든한 음식, 거리 < 3500m, 츄러스 제외
      return all
        .filter((r) =>
          r.category !== "churros" &&
          r.distanceMeters < 3500 &&
          (r.category === "seafood" || r.category === "paella" ||
           r.tags.some((t) => ["해산물", "아침", "든든"].includes(t)) ||
           r.openHours.includes("09:") || r.openHours.includes("08:"))
        )
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 4);

    case "special":
      // 특별한 날 — 미슐랭 + $$$ 이상 (기존 $$$$만 → 결과 2개 문제 해결)
      return all
        .filter((r) => r.michelin || r.priceRange === "$$$" || r.priceRange === "$$$$")
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "budget":
      return all
        .filter((r) => r.priceRange === "$" || r.priceRange === "$$")
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "morning":
      return all
        .filter((r) =>
          r.openHours.includes("09:") ||
          r.openHours.includes("08:") ||
          r.tags.some((t) => ["아침"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "nightsnack":
      return all
        .filter((r) =>
          r.openHours.includes("23:") ||
          r.openHours.includes("01:") ||
          r.openHours.includes("00:")
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "wine":
      return all
        .filter((r) =>
          r.tags.some((t) => ["와인", "카바", "베르무트", "자연파와인"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "quick":
      // 가까운데서 = 순수 거리순
      return all
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 4);

    case "seafood":
      return all
        .filter((r) =>
          r.category === "seafood" ||
          r.tags.some((t) => ["해산물", "파에야", "지중해"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "dessert":
      // 달달한 거 — 츄러스 + 브런치카페 포함 (기존 2개 결과 문제 해결)
      return all
        .filter((r) =>
          r.category === "churros" ||
          r.tags.some((t) => ["디저트", "츄러스", "초콜릿", "도넛", "아티즌", "브런치", "카페"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    default:
      return all.sort((a, b) => b.rating - a.rating).slice(0, 4);
  }
}

export default function SituationRecommender() {
  const [selected, setSelected] = useState<SituationId | null>(null);
  const userCoords = useUserLocation();

  const situation = SITUATIONS.find((s) => s.id === selected);
  const picks = selected ? filterBySituation(selected) : [];

  return (
    <section className="px-4 pt-6">
      <h2 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8] mb-1">
        🎯 상황별 추천
      </h2>
      <p className="text-xs text-[#8A7A6A] mb-3">지금 기분이나 상황을 선택하세요</p>

      {/* 상황 칩 그리드 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {SITUATIONS.map(({ id, emoji, label }) => (
          <button
            key={id}
            onClick={() => setSelected(selected === id ? null : id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2.5 rounded-2xl text-center transition-all duration-200 active:scale-95 border",
              selected === id
                ? "bg-gradient-to-br from-[#C60B1E] to-[#A00818] text-white border-transparent shadow-warm"
                : "bg-[#F5F0E8] dark:bg-[#2A2018] text-[#4A3E30] dark:text-[#C8B898] border-[#E8DDD0] dark:border-[#3A2E24] hover:border-[#C60B1E]/40"
            )}
          >
            <span className="text-xl leading-none">{emoji}</span>
            <span className="text-[10px] font-semibold leading-tight">{label}</span>
          </button>
        ))}
      </div>

      {/* 추천 결과 */}
      {selected && picks.length > 0 && (
        <div className="animate-slide-up">
          {/* 상황 설명 헤더 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{situation?.emoji}</span>
              <div>
                <p className="text-sm font-bold text-[#1A1209] dark:text-[#F5F0E8]">
                  {situation?.label}
                </p>
                <p className="text-xs text-[#8A7A6A]">{situation?.desc}</p>
              </div>
            </div>
            <Link
              href={`/restaurants?situation=${selected}`}
              className="flex items-center gap-0.5 text-xs text-[#C60B1E] font-medium"
            >
              더보기 <ChevronRight size={14} />
            </Link>
          </div>

          {/* 맛집 리스트 */}
          <div className="space-y-2">
            {picks.map((r, i) => {
              const userDistText = userCoords
                ? formatDistance(haversineDistance(userCoords, { lat: r.lat, lng: r.lng }))
                : null;
              return (
                <Link key={r.id} href={`/restaurants/${r.id}`}>
                  <div className="flex gap-3 p-3 rounded-xl bg-white dark:bg-[#2A2018] border border-[#E8DDD0] dark:border-[#3A2E24] hover:border-[#C60B1E]/30 transition-all active:scale-[0.99] shadow-sm">
                    {/* 순위 */}
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                      i === 0 ? "bg-[#FFC400] text-[#1A1209]" :
                      i === 1 ? "bg-[#C0C0C0] text-white" :
                      i === 2 ? "bg-[#CD7F32] text-white" :
                      "bg-[#F5F0E8] dark:bg-[#3A2E24] text-[#8A7A6A]"
                    )}>
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm">{r.categoryEmoji}</span>
                        <h3 className="font-semibold text-sm truncate text-[#1A1209] dark:text-[#F5F0E8]">
                          {r.name}
                        </h3>
                        {r.michelin && <span className="text-xs flex-shrink-0">⭐</span>}
                      </div>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-[#6B5E4E] dark:text-[#B8A898]">
                        <span className="flex items-center gap-0.5">
                          <Star size={10} className="fill-[#FFC400] text-[#FFC400]" />
                          {r.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-0.5 text-[#C60B1E] font-medium">
                          <Hotel size={10} />
                          {r.distanceText}
                        </span>
                        {userDistText && (
                          <span className="flex items-center gap-0.5 text-[#6B7C3E] font-medium">
                            <MapPin size={10} />
                            {userDistText}
                          </span>
                        )}
                        <span className="text-[#8A7A6A]">{r.priceRange}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {selected && picks.length === 0 && (
        <div className="text-center py-8 text-[#8A7A6A] text-sm">
          해당 상황의 맛집 정보가 부족합니다 😅
        </div>
      )}
    </section>
  );
}
