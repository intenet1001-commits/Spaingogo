"use client";

import { useState, useEffect } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import BottomNav from "@/components/BottomNav";
import HotelNavigationButton from "@/components/HotelNavigationButton";
import { distanceFromHotel, formatDistance, walkingMinutes } from "@/domain/services/DistanceCalculatorService";
import restaurantsData from "@/infrastructure/data/restaurants.json";
import type { Restaurant } from "@/app/api/restaurants/route";

const STORAGE_KEY = "spaingogo_bookmarks";

export default function BookmarksPage() {
  const [bookmarkIds, setBookmarkIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setBookmarkIds(JSON.parse(saved)); } catch { /**/ }
    }
  }, []);

  const bookmarked: Restaurant[] = restaurantsData
    .filter((r) => bookmarkIds.includes(r.id))
    .map((r) => {
      const meters = distanceFromHotel({ lat: r.lat, lng: r.lng });
      return {
        ...r,
        distanceMeters: Math.round(meters),
        distanceText: formatDistance(meters),
        walkingMinutes: walkingMinutes(meters),
      };
    }) as Restaurant[];

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBookmarkIds([]);
  };

  return (
    <div className="pb-24">
      <header className="bg-gradient-to-br from-[#C60B1E] to-[#800612] px-5 pt-14 pb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bookmark size={18} className="text-[#FFC400]" fill="#FFC400" />
              <h1 className="font-serif text-2xl font-bold">즐겨찾기</h1>
            </div>
            <p className="text-sm text-white/60">{bookmarked.length}개의 맛집을 저장했어요</p>
          </div>
          {bookmarked.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors"
            >
              <Trash2 size={14} />
              전체 삭제
            </button>
          )}
        </div>
      </header>

      <div className="px-4 pt-4">
        {bookmarked.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark size={48} className="mx-auto text-[#E8DDD0] dark:text-[#3A2E24] mb-4" />
            <p className="text-[#6B5E4E] dark:text-[#B8A898] font-medium">저장된 맛집이 없어요</p>
            <p className="text-sm text-[#8A7A6A] mt-1">
              마음에 드는 맛집을 즐겨찾기에 추가해보세요
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarked.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>

      <HotelNavigationButton variant="fab" />
      <BottomNav />
    </div>
  );
}
