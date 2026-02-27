"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Hotel, MapPin, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { distanceFromHotel, formatDistance, haversineDistance } from "@/domain/services/DistanceCalculatorService";
import { useUserLocation } from "@/hooks/useUserLocation";
import attractionsData from "@/infrastructure/data/attractions.json";

const SITUATIONS = [
  { id: "photo",    emoji: "📸", label: "사진 찍기 좋은",  desc: "인생샷 명소" },
  { id: "walk",     emoji: "🚶", label: "걷기 좋은",       desc: "산책 & 거닐기 좋은 곳" },
  { id: "church",   emoji: "⛪", label: "한인교회",        desc: "바르셀로나 한서교회 (한인교회)" },
  { id: "free",     emoji: "🆓", label: "무료 입장",       desc: "돈 안 드는 명소" },
  { id: "night",    emoji: "🌃", label: "야경 보러",        desc: "밤에 빛나는 바르셀로나" },
  { id: "history",  emoji: "📚", label: "역사 탐방",        desc: "유적 & 역사 문화" },
  { id: "beach",    emoji: "🏖️", label: "해변 즐기기",      desc: "지중해 해변 & 산책로" },
  { id: "indoor",   emoji: "🌧️", label: "비 올 때(실내)",   desc: "날씨 상관없는 실내 명소" },
  { id: "shopping", emoji: "🛍️", label: "쇼핑하기",         desc: "쇼핑 & 시장 탐방" },
  { id: "near",     emoji: "⚡", label: "호텔 근처",         desc: "도보 15분 이내" },
  { id: "halfday",  emoji: "🕐", label: "반나절 코스",       desc: "2~3시간 알차게" },
  { id: "art",      emoji: "🎨", label: "예술 감상",         desc: "미술관 & 건축 예술" },
] as const;

type SituationId = (typeof SITUATIONS)[number]["id"];

function filterBySituation(id: SituationId) {
  const all = attractionsData.map((a) => ({
    ...a,
    distanceMeters: distanceFromHotel({ lat: a.lat, lng: a.lng }),
    distanceText: formatDistance(distanceFromHotel({ lat: a.lat, lng: a.lng })),
  }));

  switch (id) {
    case "photo":
      return all
        .filter((a) =>
          a.tags.some((t) => ["사진명소", "전망", "야경", "가우디", "모자이크"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "walk":
      return all
        .filter((a) =>
          a.category === "beach" ||
          a.tags.some((t) => ["산책", "가로수길", "공원", "골목"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "church":
      return all
        .filter((a) => a.tags.some((t) => ["한인교회", "교회", "예배"].includes(t)))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "free":
      return all
        .filter((a) => a.entryFee === "무료")
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "night":
      return all
        .filter((a) =>
          a.category === "nightview" ||
          a.tags.some((t) => ["야경", "야간", "일몰", "썬셋"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "history":
      return all
        .filter((a) =>
          a.tags.some((t) => ["역사", "유네스코", "유적", "로마유적", "중세건물"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "beach":
      return all
        .filter((a) =>
          a.category === "beach" ||
          a.tags.some((t) => ["해변", "지중해", "해산물", "지중해뷰"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "indoor":
      return all
        .filter((a) =>
          a.category === "museum" ||
          a.tags.some((t) => ["실내", "미술관", "박물관"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "shopping":
      return all
        .filter((a) =>
          a.category === "shopping" ||
          a.tags.some((t) => ["쇼핑", "시장", "명품"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "near":
      return all
        .filter((a) => a.distanceMeters < 2500)
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 4);

    case "halfday":
      return all
        .filter((a) => a.duration >= 60 && a.duration <= 120)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    case "art":
      return all
        .filter((a) =>
          a.category === "museum" ||
          a.tags.some((t) => ["미술관", "가우디", "건축", "모더니즘", "유네스코", "예술"].includes(t))
        )
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);

    default:
      return all.sort((a, b) => b.rating - a.rating).slice(0, 4);
  }
}

export default function SituationRecommenderPlaces() {
  const [selected, setSelected] = useState<SituationId | null>(null);
  const userCoords = useUserLocation();

  const situation = SITUATIONS.find((s) => s.id === selected);
  const picks = selected ? filterBySituation(selected) : [];

  return (
    <section className="px-4 pt-6">
      <h2 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8] mb-1">
        🗺️ 상황별 추천
      </h2>
      <p className="text-xs text-[#8A7A6A] mb-3">지금 원하는 여행 스타일을 선택하세요</p>

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
              href={`/attractions?situation=${selected}`}
              className="flex items-center gap-0.5 text-xs text-[#C60B1E] font-medium"
            >
              더보기 <ChevronRight size={14} />
            </Link>
          </div>

          {/* 명소 리스트 */}
          <div className="space-y-2">
            {picks.map((a, i) => {
              const userDistText = userCoords
                ? formatDistance(haversineDistance(userCoords, { lat: a.lat, lng: a.lng }))
                : null;
              return (
                <Link key={a.id} href={`/attractions/${a.id}`}>
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
                        <span className="text-sm">{a.categoryEmoji}</span>
                        <h3 className="font-semibold text-sm truncate text-[#1A1209] dark:text-[#F5F0E8]">
                          {a.name}
                        </h3>
                      </div>
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-[#6B5E4E] dark:text-[#B8A898]">
                        {a.reviewCount > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star size={10} className="fill-[#FFC400] text-[#FFC400]" />
                            {a.rating.toFixed(1)}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-[#C60B1E] font-medium">
                          <Hotel size={10} />
                          {a.distanceText}
                        </span>
                        {userDistText && (
                          <span className="flex items-center gap-0.5 text-[#6B7C3E] font-medium">
                            <MapPin size={10} />
                            {userDistText}
                          </span>
                        )}
                        <span className={cn(
                          "font-medium",
                          a.entryFee === "무료" ? "text-[#6B7C3E]" : "text-[#8A7A6A]"
                        )}>
                          {a.entryFee === "무료" ? "무료" : a.entryFee.split("~")[0]}
                        </span>
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
          해당 상황의 관광지 정보가 부족합니다 😅
        </div>
      )}
    </section>
  );
}
