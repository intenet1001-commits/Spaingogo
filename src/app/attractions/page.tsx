"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import AttractionCard from "@/components/AttractionCard";
import BottomNav from "@/components/BottomNav";
import HotelNavigationButton from "@/components/HotelNavigationButton";
import type { Attraction } from "@/app/api/attractions/route";

const CATEGORIES = [
  { id: "all",      label: "전체",     emoji: "🗺️" },
  { id: "landmark", label: "랜드마크", emoji: "🏛️" },
  { id: "museum",   label: "박물관",   emoji: "🖼️" },
  { id: "beach",    label: "해변",     emoji: "🏖️" },
  { id: "park",     label: "공원",     emoji: "🌳" },
  { id: "shopping", label: "쇼핑",     emoji: "🛍️" },
  { id: "activity", label: "액티비티", emoji: "🎡" },
  { id: "nightview",label: "야경",     emoji: "🌃" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

function AttractionsListContent() {
  const searchParams = useSearchParams();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryId>(
    (searchParams.get("category") as CategoryId) || "all"
  );
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "rating");
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("q", search);
    if (sort) params.set("sort", sort);
    if (freeOnly) params.set("free", "true");

    setLoading(true);
    fetch(`/api/attractions?${params}`)
      .then((r) => r.json())
      .then((data) => setAttractions(data.attractions ?? []))
      .finally(() => setLoading(false));
  }, [category, search, sort, freeOnly]);

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#1E1810]/90 backdrop-blur border-b border-[#E8DDD0] dark:border-[#3A2E24]">
        <div className="px-4 pt-4 pb-2">
          <h1 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8] mb-3">
            🇪🇸 바르셀로나 관광
          </h1>

          {/* 검색 바 */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A7A6A]" />
            <input
              type="text"
              placeholder="관광지 이름, 지역, 태그 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F5F0E8] dark:bg-[#2A2018] border border-[#E8DDD0] dark:border-[#3A2E24] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1A1209] dark:text-[#F5F0E8] placeholder-[#8A7A6A] focus:outline-none focus:border-[#C60B1E] transition-colors"
            />
          </div>

          {/* 카테고리 필터 */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(({ id, label, emoji }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === id
                    ? "bg-[#C60B1E] text-white shadow-sm"
                    : "bg-[#F5F0E8] dark:bg-[#2A2018] text-[#6B5E4E] dark:text-[#B8A898] border border-[#E8DDD0] dark:border-[#3A2E24]"
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 정렬 + 무료 필터 */}
        <div className="flex items-center gap-2 px-4 pb-3 pt-1">
          <SlidersHorizontal size={14} className="text-[#8A7A6A]" />
          <span className="text-xs text-[#8A7A6A]">정렬:</span>
          {[
            { id: "rating",   label: "평점순" },
            { id: "distance", label: "거리순" },
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
          <div className="ml-auto">
            <button
              onClick={() => setFreeOnly(!freeOnly)}
              className={`text-xs px-3 py-1 rounded-full transition-all border ${
                freeOnly
                  ? "bg-[#6B7C3E] text-white border-transparent font-medium"
                  : "bg-[#F5F0E8] dark:bg-[#2A2018] text-[#6B5E4E] dark:text-[#B8A898] border-[#E8DDD0] dark:border-[#3A2E24]"
              }`}
            >
              🆓 무료만
            </button>
          </div>
        </div>
      </header>

      {/* 결과 */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[#F5F0E8] dark:bg-[#2A2018] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : attractions.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-[#6B5E4E] dark:text-[#B8A898] font-medium">검색 결과가 없습니다</p>
            <p className="text-sm text-[#8A7A6A] mt-1">다른 검색어나 카테고리를 시도해보세요</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#8A7A6A] mb-4">총 {attractions.length}개 관광지</p>
            <div className="space-y-4">
              {attractions.map((a) => (
                <AttractionCard key={a.id} attraction={a} />
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

export default function AttractionsPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#FAFAF8] animate-pulse" />}>
      <AttractionsListContent />
    </Suspense>
  );
}
