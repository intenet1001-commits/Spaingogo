"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, MapPin, ChevronRight, Timer, Hotel } from "lucide-react";
import { cn } from "@/lib/utils";
import { HOTEL_COORDINATES } from "@/domain/value-objects/HotelCoordinate";
import { useUserLocation } from "@/hooks/useUserLocation";
import SituationRecommender from "./SituationRecommender";
import SituationRecommenderPlaces from "./SituationRecommenderPlaces";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RestaurantItem {
  id: number | string;
  name: string;
  categoryEmoji: string;
  rating: number;
  description: string;
  district: string;
  distanceText: string;
  distanceMeters?: number;
  imageUrl: string;
  michelin?: boolean;
}

interface AttractionItem {
  id: string;
  name: string;
  categoryEmoji: string;
  rating: number;
  description: string;
  district: string;
  distanceText: string;
  distanceMeters?: number;
  imageUrl: string;
  entryFee: string;
  duration: number;
}

interface Props {
  topRestaurants: RestaurantItem[];
  nearbyRestaurants: RestaurantItem[];
  topAttractions: AttractionItem[];
  nearbyAttractions: AttractionItem[];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function HomeTabView({
  topRestaurants,
  nearbyRestaurants,
  topAttractions,
  nearbyAttractions,
}: Props) {
  const [tab, setTab] = useState<"eat" | "go">("eat");
  useUserLocation(); // GPS 권한 즉시 요청 — SituationRecommender 캐시 재사용

  return (
    <>
      {/* ── Hero ── */}
      {tab === "eat" ? <EatHero /> : <GoHero />}

      {/* ── Tab Switcher ── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#1A1209]/95 backdrop-blur-sm border-b border-[#E8DDD0] dark:border-[#3A2E24] px-4 py-2.5">
        <div className="flex gap-2 bg-[#F5F0E8] dark:bg-[#2A2018] p-1 rounded-2xl">
          <button
            onClick={() => setTab("eat")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200",
              tab === "eat"
                ? "bg-white dark:bg-[#3A2E24] shadow-warm text-[#C60B1E]"
                : "text-[#8A7A6A] hover:text-[#4A3E30]"
            )}
          >
            🍽️ 먹고?
          </button>
          <button
            onClick={() => setTab("go")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200",
              tab === "go"
                ? "bg-white dark:bg-[#3A2E24] shadow-warm text-[#C60B1E]"
                : "text-[#8A7A6A] hover:text-[#4A3E30]"
            )}
          >
            🗺️ 갈래?
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {tab === "eat" ? (
        <EatContent
          topRestaurants={topRestaurants}
          nearbyRestaurants={nearbyRestaurants}
        />
      ) : (
        <GoContent
          topAttractions={topAttractions}
          nearbyAttractions={nearbyAttractions}
        />
      )}
    </>
  );
}

// ─── Eat Hero ─────────────────────────────────────────────────────────────────

function EatHero() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#C60B1E] via-[#A00818] to-[#800612] text-white px-5 pt-14 pb-10">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-6 text-8xl select-none">🇪🇸</div>
        <div className="absolute bottom-2 left-2 text-6xl select-none">🥘</div>
      </div>
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={14} className="text-[#FFC400]" />
          <span className="text-xs text-white/80 font-medium">
            {HOTEL_COORDINATES.address.split(",")[0]} 기준
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold leading-tight mb-2">
          ¡Buen provecho!<br />
          <span className="text-[#FFC400]">바르셀로나</span> 맛집 가이드
        </h1>
        <p className="text-sm text-white/75 leading-relaxed">
          호텔에서 걸어갈 수 있는 최고의 맛집을 찾아보세요
        </p>
        <Link
          href="/restaurants"
          className="mt-5 flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white/70 text-sm"
        >
          <span>🔍</span>
          <span>타파스, 파에야, 핀초스...</span>
        </Link>
      </div>
    </header>
  );
}

// ─── Go Hero ──────────────────────────────────────────────────────────────────

function GoHero() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#1B4F8A] via-[#154080] to-[#0D2E5E] text-white px-5 pt-14 pb-10">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-6 text-8xl select-none">⛪</div>
        <div className="absolute bottom-2 left-2 text-6xl select-none">🏖️</div>
      </div>
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={14} className="text-[#FFC400]" />
          <span className="text-xs text-white/80 font-medium">
            {HOTEL_COORDINATES.address.split(",")[0]} 기준
          </span>
        </div>
        <h1 className="font-serif text-3xl font-bold leading-tight mb-2">
          ¡Barcelona!<br />
          <span className="text-[#FFC400]">바르셀로나</span> 관광 가이드
        </h1>
        <p className="text-sm text-white/75 leading-relaxed">
          가우디부터 해변까지, 놓치면 후회할 명소들
        </p>
        <Link
          href="/attractions"
          className="mt-5 flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 text-white/70 text-sm"
        >
          <span>🔍</span>
          <span>사그라다 파밀리아, 공원 구엘...</span>
        </Link>
      </div>
    </header>
  );
}

// ─── Eat Content ──────────────────────────────────────────────────────────────

function EatContent({
  topRestaurants,
  nearbyRestaurants,
}: {
  topRestaurants: RestaurantItem[];
  nearbyRestaurants: RestaurantItem[];
}) {
  return (
    <>
      {/* 카테고리 빠른 접근 */}
      <section className="px-4 pt-6 pb-2">
        <div className="grid grid-cols-4 gap-3">
          {[
            { emoji: "🥘", label: "타파스", href: "/restaurants?category=tapas" },
            { emoji: "🍚", label: "파에야", href: "/restaurants?category=paella" },
            { emoji: "🍢", label: "핀초스", href: "/restaurants?category=pintxos" },
            { emoji: "🍩", label: "츄러스", href: "/restaurants?category=churros" },
          ].map(({ emoji, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#F5F0E8] dark:bg-[#2A2018] hover:bg-[#E8DDD0] dark:hover:bg-[#3A2E24] transition-colors active:scale-95"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium text-[#6B5E4E] dark:text-[#B8A898]">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 호텔 근처 맛집 */}
      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8]">
            🏨 호텔 근처 맛집
          </h2>
          <Link href="/nearby" className="flex items-center gap-0.5 text-xs text-[#C60B1E] font-medium">
            더보기 <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-1">
          {nearbyRestaurants.map((r) => (
            <Link key={r.id} href={`/restaurants/${r.id}`}>
              <div className="flex gap-3 p-3 rounded-xl hover:bg-[#F5F0E8] dark:hover:bg-[#2A2018] transition-colors active:scale-[0.99]">
                <div className="w-12 h-12 rounded-xl bg-[#FFC400]/20 flex items-center justify-center text-2xl flex-shrink-0">
                  {r.categoryEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-[#1A1209] dark:text-[#F5F0E8] truncate">{r.name}</h3>
                    <span className="text-xs font-bold text-[#C60B1E] flex-shrink-0">{r.distanceText}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star size={11} className="fill-[#FFC400] text-[#FFC400]" />
                    <span className="text-xs text-[#6B5E4E] dark:text-[#B8A898]">{r.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#8A7A6A]">· {r.district}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 인기 맛집 TOP 6 */}
      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8]">
            🔥 인기 맛집 TOP 6
          </h2>
          <Link href="/restaurants?sort=rating" className="flex items-center gap-0.5 text-xs text-[#C60B1E] font-medium">
            전체보기 <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-4">
          {topRestaurants.map((r) => (
            <Link key={r.id} href={`/restaurants/${r.id}`}>
              <article className="card-warm group">
                <div className="flex gap-3 p-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-[#1A1209] dark:text-[#F5F0E8] leading-tight">
                        {r.categoryEmoji} {r.name}
                      </h3>
                      {r.michelin && <span className="text-xs flex-shrink-0">⭐미슐랭</span>}
                    </div>
                    <p className="text-xs text-[#6B5E4E] dark:text-[#B8A898] line-clamp-2 mb-2 leading-relaxed">
                      {r.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-[#1A1209] dark:text-[#F5F0E8]">
                        <Star size={11} className="fill-[#FFC400] text-[#FFC400]" />
                        {r.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-[#C60B1E] font-medium">
                        <Hotel size={10} />
                        {r.distanceText}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* 상황별 추천 */}
      <SituationRecommender />
    </>
  );
}

// ─── Go Content ───────────────────────────────────────────────────────────────

function GoContent({
  topAttractions,
  nearbyAttractions,
}: {
  topAttractions: AttractionItem[];
  nearbyAttractions: AttractionItem[];
}) {
  return (
    <>
      {/* 카테고리 빠른 접근 */}
      <section className="px-4 pt-6 pb-2">
        <div className="grid grid-cols-4 gap-3">
          {[
            { emoji: "🏛️", label: "랜드마크", href: "/attractions?category=landmark" },
            { emoji: "🖼️", label: "박물관", href: "/attractions?category=museum" },
            { emoji: "🏖️", label: "해변", href: "/attractions?category=beach" },
            { emoji: "🌃", label: "야경", href: "/attractions?category=nightview" },
          ].map(({ emoji, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#EBF0F8] dark:bg-[#1A2A3A] hover:bg-[#D8E4F0] dark:hover:bg-[#243444] transition-colors active:scale-95"
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-medium text-[#3A5070] dark:text-[#8AABCC]">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 호텔 근처 명소 */}
      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8]">
            🏨 호텔 근처 명소
          </h2>
          <Link href="/attractions" className="flex items-center gap-0.5 text-xs text-[#1B4F8A] font-medium">
            더보기 <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-1">
          {nearbyAttractions.map((a) => (
            <Link key={a.id} href={`/attractions/${a.id}`}>
              <div className="flex gap-3 p-3 rounded-xl hover:bg-[#EBF0F8] dark:hover:bg-[#1A2A3A] transition-colors active:scale-[0.99]">
                <div className="w-12 h-12 rounded-xl bg-[#1B4F8A]/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {a.categoryEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-[#1A1209] dark:text-[#F5F0E8] truncate">{a.name}</h3>
                    <span className="text-xs font-bold text-[#1B4F8A] flex-shrink-0">{a.distanceText}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star size={11} className="fill-[#FFC400] text-[#FFC400]" />
                    <span className="text-xs text-[#6B5E4E] dark:text-[#B8A898]">{a.rating.toFixed(1)}</span>
                    <span className="text-xs text-[#8A7A6A]">· {a.district}</span>
                    <span className={cn(
                      "text-xs font-medium",
                      a.entryFee === "무료" ? "text-[#6B7C3E]" : "text-[#8A7A6A]"
                    )}>
                      · {a.entryFee === "무료" ? "🆓무료" : a.entryFee.split("~")[0]}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 인기 명소 TOP 6 */}
      <section className="px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8]">
            ✨ 인기 명소 TOP 6
          </h2>
          <Link href="/attractions?sort=rating" className="flex items-center gap-0.5 text-xs text-[#1B4F8A] font-medium">
            전체보기 <ChevronRight size={14} />
          </Link>
        </div>
        <div className="space-y-4">
          {topAttractions.map((a) => (
            <Link key={a.id} href={`/attractions/${a.id}`}>
              <article className="card-warm group">
                <div className="flex gap-3 p-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.imageUrl} alt={a.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <h3 className="font-semibold text-sm text-[#1A1209] dark:text-[#F5F0E8] leading-tight mb-1">
                      {a.categoryEmoji} {a.name}
                    </h3>
                    <p className="text-xs text-[#6B5E4E] dark:text-[#B8A898] line-clamp-2 mb-2 leading-relaxed">
                      {a.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-[#1A1209] dark:text-[#F5F0E8]">
                        <Star size={11} className="fill-[#FFC400] text-[#FFC400]" />
                        {a.rating.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-[#1B4F8A] font-medium">
                        <Hotel size={10} />
                        {a.distanceText}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-[#8A7A6A]">
                        <Timer size={10} />
                        {a.duration}분
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* 상황별 추천 */}
      <SituationRecommenderPlaces />
    </>
  );
}
