"use client";

import { useState, useEffect } from "react";
import { MapPin, Loader2, AlertCircle, UtensilsCrossed, Landmark } from "lucide-react";
import RestaurantCard from "@/components/RestaurantCard";
import AttractionCard from "@/components/AttractionCard";
import BottomNav from "@/components/BottomNav";
import HotelNavigationButton from "@/components/HotelNavigationButton";
import { HOTEL_COORDINATES } from "@/domain/value-objects/HotelCoordinate";
import { haversineDistance, formatDistance, walkingMinutes } from "@/domain/services/DistanceCalculatorService";
import restaurantsData from "@/infrastructure/data/restaurants.json";
import attractionsData from "@/infrastructure/data/attractions.json";
import type { Restaurant } from "@/app/api/restaurants/route";
import type { Attraction } from "@/app/api/attractions/route";

export default function NearbyPage() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(2000);
  const [activeTab, setActiveTab] = useState<"restaurants" | "attractions">("restaurants");

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("이 기기는 GPS를 지원하지 않습니다.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        // GPS 거부 시 호텔 좌표로 폴백
        setUserCoords({ lat: HOTEL_COORDINATES.lat, lng: HOTEL_COORDINATES.lng });
        setGpsError("위치 권한이 없어 호텔 위치 기준으로 표시합니다.");
        setLoading(false);
      },
      { timeout: 8000 }
    );
  }, []);

  const nearby = userCoords
    ? (restaurantsData as Restaurant[])
        .map((r) => {
          const meters = haversineDistance(userCoords, { lat: r.lat, lng: r.lng });
          return {
            ...r,
            distanceMeters: Math.round(meters),
            distanceText: formatDistance(meters),
            walkingMinutes: walkingMinutes(meters),
          };
        })
        .filter((r) => r.distanceMeters <= radius)
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
    : [];

  const nearbyAttractions = userCoords
    ? (attractionsData as Attraction[])
        .filter((a) => !a.hidden)
        .map((a) => {
          const meters = haversineDistance(userCoords, { lat: a.lat, lng: a.lng });
          return {
            ...a,
            distanceMeters: Math.round(meters),
            distanceText: formatDistance(meters),
            walkingMinutes: walkingMinutes(meters),
          };
        })
        .filter((a) => a.distanceMeters <= radius)
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
    : [];

  const origin = gpsError
    ? `${HOTEL_COORDINATES.name} (호텔)`
    : userCoords
    ? "내 현재 위치"
    : "";

  const emptyEmoji = activeTab === "restaurants" ? "🍽️" : "🗺️";
  const emptyText = activeTab === "restaurants" ? "맛집" : "명소";

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <header className="bg-gradient-to-br from-[#1A1209] to-[#2A1810] px-5 pt-14 pb-8 text-white">
        <div className="flex items-center gap-2 mb-2">
          <MapPin size={18} className="text-[#FFC400]" />
          <h1 className="font-serif text-2xl font-bold">주변 맛집·명소</h1>
        </div>
        <p className="text-sm text-white/60">
          {loading ? "위치 확인 중..." : `${origin} 기준`}
        </p>

        {/* 탭 */}
        <div className="flex gap-2 mt-4 mb-3">
          <button
            onClick={() => setActiveTab("restaurants")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
              activeTab === "restaurants"
                ? "bg-[#FFC400] text-[#1A1209] font-semibold"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <UtensilsCrossed size={12} />
            맛집 {!loading && `(${nearby.length})`}
          </button>
          <button
            onClick={() => setActiveTab("attractions")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all ${
              activeTab === "attractions"
                ? "bg-[#FFC400] text-[#1A1209] font-semibold"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <Landmark size={12} />
            명소 {!loading && `(${nearbyAttractions.length})`}
          </button>
        </div>

        {/* 반경 선택 */}
        <div className="flex gap-2">
          {[500, 1000, 2000, 3000].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                radius === r
                  ? "bg-white/25 text-white font-semibold"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {r >= 1000 ? `${r / 1000}km` : `${r}m`}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4">
        {/* GPS 경고 */}
        {gpsError && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl mb-4">
            <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400">{gpsError}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-16 text-[#8A7A6A]">
            <Loader2 size={32} className="animate-spin mb-3 text-[#C60B1E]" />
            <p className="text-sm">위치 확인 중...</p>
          </div>
        ) : activeTab === "restaurants" && nearby.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">{emptyEmoji}</span>
            <p className="text-[#6B5E4E] dark:text-[#B8A898] font-medium">
              {radius / 1000 < 1 ? `${radius}m` : `${radius / 1000}km`} 내 {emptyText}이 없습니다
            </p>
            <p className="text-sm text-[#8A7A6A] mt-1">반경을 늘려보세요</p>
          </div>
        ) : activeTab === "attractions" && nearbyAttractions.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl mb-4 block">{emptyEmoji}</span>
            <p className="text-[#6B5E4E] dark:text-[#B8A898] font-medium">
              {radius / 1000 < 1 ? `${radius}m` : `${radius / 1000}km`} 내 {emptyText}이 없습니다
            </p>
            <p className="text-sm text-[#8A7A6A] mt-1">반경을 늘려보세요</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#8A7A6A] mb-4">
              반경 {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`} 내{" "}
              {activeTab === "restaurants" ? nearby.length : nearbyAttractions.length}개 {emptyText}
            </p>
            <div className="space-y-4">
              {activeTab === "restaurants"
                ? nearby.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
                : nearbyAttractions.map((a) => <AttractionCard key={a.id} attraction={a} />)}
            </div>
          </>
        )}
      </div>

      <HotelNavigationButton variant="fab" />
      <BottomNav />
    </div>
  );
}
