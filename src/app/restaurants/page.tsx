"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import CategoryFilter, { CATEGORIES, CategoryId } from "@/components/CategoryFilter";
import BottomNav from "@/components/BottomNav";
import HotelNavigationButton from "@/components/HotelNavigationButton";
import type { Restaurant } from "@/app/api/restaurants/route";

const SITUATION_LABELS: Record<string, { emoji: string; label: string }> = {
  tired:     { emoji: "😴", label: "피곤할 때" },
  romantic:  { emoji: "💑", label: "로맨틱한 밤" },
  friends:   { emoji: "🥂", label: "친구들과" },
  hangover:  { emoji: "🤢", label: "해장이 필요해" },
  special:   { emoji: "🎉", label: "특별한 날" },
  budget:    { emoji: "💰", label: "가성비로" },
  morning:   { emoji: "🌅", label: "아침 일찍" },
  nightsnack:{ emoji: "🌙", label: "야식 생각" },
  wine:      { emoji: "🍷", label: "와인 한 잔" },
  quick:     { emoji: "📍", label: "가까운데서" },
  seafood:   { emoji: "🦞", label: "해산물 먹고파" },
  dessert:   { emoji: "🍩", label: "달달한 거" },
};

function RestaurantListContent() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const situation = searchParams.get("situation") || "";
  const [category, setCategory] = useState<CategoryId>(
    (searchParams.get("category") as CategoryId) || "all"
  );
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || (situation === "quick" ? "distance" : "rating"));

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("q", search);
    if (sort) params.set("sort", sort);
    if (situation) params.set("situation", situation);

    setLoading(true);
    fetch(`/api/restaurants?${params}`)
      .then((r) => r.json())
      .then((data) => setRestaurants(data.restaurants ?? []))
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#1E1810]/90 backdrop-blur border-b border-[#E8DDD0] dark:border-[#3A2E24]">
        <div className="px-4 pt-4 pb-2">
          <h1 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8] mb-3">
            🇪🇸 바르셀로나 맛집
          </h1>

          {/* 검색 바 */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7A6A]" />
            <input
              type="text"
              placeholder="맛집 이름, 지역, 태그 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F5F0E8] dark:bg-[#2A2018] border border-[#E8DDD0] dark:border-[#3A2E24] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1A1209] dark:text-[#F5F0E8] placeholder-[#8A7A6A] focus:outline-none focus:border-[#C60B1E] transition-colors"
            />
          </div>

          {/* 카테고리 필터 */}
          <CategoryFilter selected={category} onChange={setCategory} />
        </div>

        {/* 정렬 */}
        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
          <SlidersHorizontal size={14} className="text-[#8A7A6A]" />
          <span className="text-xs text-[#8A7A6A]">정렬:</span>
          {[
            { id: "rating", label: "평점순" },
            { id: "distance", label: "거리순" },
            { id: "reviews", label: "리뷰순" },
            { id: "memberReviews", label: "MWC멤버리뷰순" },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSort(id)}
              className={`text-xs px-3 py-1 rounded-full transition-all ${
                sort === id
                  ? "bg-[#C60B1E] text-white font-medium"
                  : "bg-[#F5F0E8] dark:bg-[#2A2018] text-[#6B5E4E] dark:text-[#B8A898]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* 상황 필터 배너 */}
      {situation && SITUATION_LABELS[situation] && (
        <div className="mx-4 mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-[#C60B1E]/10 border border-[#C60B1E]/20">
          <div className="flex items-center gap-2 text-sm font-medium text-[#C60B1E]">
            <span>{SITUATION_LABELS[situation].emoji}</span>
            <span>{SITUATION_LABELS[situation].label} 맛집만 보는 중</span>
          </div>
          <a href="/restaurants" className="text-[#C60B1E] hover:opacity-70">
            <X size={16} />
          </a>
        </div>
      )}

      {/* 결과 */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[#F5F0E8] dark:bg-[#2A2018] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-[#6B5E4E] dark:text-[#B8A898] font-medium">검색 결과가 없습니다</p>
            <p className="text-sm text-[#8A7A6A] mt-1">다른 검색어나 카테고리를 시도해보세요</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#8A7A6A] mb-4">총 {restaurants.length}개 맛집</p>
            <div className="space-y-4">
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          </>
        )}
      </div>

      <HotelNavigationButton variant="fab" />
      <BottomNav />
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#FAFAF8] animate-pulse" />}>
      <RestaurantListContent />
    </Suspense>
  );
}
