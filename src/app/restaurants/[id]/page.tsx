import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, ChevronLeft, Navigation, Footprints } from "lucide-react";
import HotelNavigationButton from "@/components/HotelNavigationButton";
import BottomNav from "@/components/BottomNav";
import restaurantsData from "@/infrastructure/data/restaurants.json";
import { distanceFromHotel, formatDistance, walkingMinutes } from "@/domain/services/DistanceCalculatorService";

interface Props {
  params: Promise<{ id: string }>;
}

function getTheForkUrl(name: string): string {
  const query = encodeURIComponent(`${name} Barcelona`);
  return `https://www.thefork.es/buscar?q=${query}`;
}

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

// Google Maps 예약 기능 - 레스토랑 검색 페이지 (예약 버튼 포함)
function getGoogleReserveUrl(name: string): string {
  const query = encodeURIComponent(`${name} Barcelona`);
  return `https://www.google.com/maps/search/${query}`;
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { id } = await params;
  const restaurant = restaurantsData.find((r) => r.id === id);
  if (!restaurant) notFound();

  const meters = distanceFromHotel({ lat: restaurant.lat, lng: restaurant.lng });
  const distanceText = formatDistance(meters);
  const walkMins = walkingMinutes(meters);
  const googleMapsUrl = getGoogleMapsUrl(restaurant.lat, restaurant.lng);
  const googleReserveUrl = getGoogleReserveUrl(restaurant.name);
  const theForkUrl = getTheForkUrl(restaurant.name);

  return (
    <div className="pb-24">
      {/* 이미지 헤더 */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={restaurant.imageUrl}
          alt={restaurant.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* 뒤로가기 */}
        <Link
          href="/restaurants"
          className="absolute top-4 left-4 w-9 h-9 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>

        {/* 미슐랭 배지 */}
        {restaurant.michelin && (
          <div className="absolute top-4 right-4">
            <span className="badge-michelin text-sm px-3 py-1">⭐ 미슐랭</span>
          </div>
        )}

        {/* 하단 정보 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-2xl">{restaurant.categoryEmoji}</span>
            <span className="text-xs text-white/70 font-medium">{restaurant.district}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white leading-tight">
            {restaurant.name}
          </h1>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* 핵심 정보 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Star size={16} className="fill-[#FFC400] text-[#FFC400]" />
            <span className="font-bold text-[#1A1209] dark:text-[#F5F0E8]">{restaurant.rating.toFixed(1)}</span>
            <span className="text-sm text-[#8A7A6A]">({restaurant.reviewCount.toLocaleString()})</span>
          </div>
          <span className="text-[#8A7A6A]">·</span>
          <span className="text-sm font-semibold text-[#6B7C3E]">{restaurant.priceRange}</span>
          <span className="text-[#8A7A6A]">·</span>
          <div className="flex items-center gap-1 text-sm font-semibold text-[#C60B1E]">
            <Footprints size={14} />
            {walkMins}분 (호텔에서 {distanceText})
          </div>
        </div>

        {/* 설명 */}
        <p className="text-sm text-[#4A3E30] dark:text-[#C8B898] leading-relaxed">
          {restaurant.description}
        </p>

        {/* 위치 & 영업시간 */}
        <div className="space-y-2.5 p-4 bg-[#F5F0E8] dark:bg-[#2A2018] rounded-2xl">
          <div className="flex items-start gap-2.5">
            <MapPin size={16} className="text-[#C60B1E] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[#1A1209] dark:text-[#F5F0E8]">{restaurant.address}</p>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#C60B1E] font-medium mt-0.5 hover:underline"
              >
                지도에서 보기 →
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-[#6B7C3E] flex-shrink-0" />
            <p className="text-sm text-[#1A1209] dark:text-[#F5F0E8]">{restaurant.openHours}</p>
          </div>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2">
          {restaurant.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1.5 rounded-full bg-[#FFC400]/15 text-[#8A6A00] dark:text-[#FFC400] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3 pt-1">
          {/* 예약 버튼 2종 */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Google Reserve */}
            <a
              href={googleReserveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl font-semibold text-sm bg-white dark:bg-[#2A2018] border-2 border-[#4285F4] text-[#4285F4] active:scale-95 transition-all shadow-sm"
            >
              <span className="text-xl">🗺️</span>
              <span>Google 예약</span>
            </a>

            {/* TheFork */}
            <a
              href={theForkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-br from-[#00B67A] to-[#009A68] text-white active:scale-95 transition-all shadow-sm"
            >
              <span className="text-xl">🍴</span>
              <span>TheFork 예약</span>
            </a>
          </div>

          {/* 예약 안내 */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl">
            <span className="text-base mt-0.5">💡</span>
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <strong>Google 예약</strong>은 레스토랑이 Google과 직접 연동된 경우 즉시 예약 가능합니다.{" "}
              <strong>TheFork</strong>는 유럽 최대 예약 플랫폼으로 대부분의 레스토랑을 지원합니다.
            </p>
          </div>

          {/* 길찾기 버튼 */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm border-2 border-[#C60B1E] text-[#C60B1E] active:scale-95 transition-all hover:bg-[#C60B1E]/5"
          >
            <Navigation size={18} />
            레스토랑으로 길찾기
          </a>

          {/* 호텔로 돌아가기 */}
          <HotelNavigationButton variant="inline" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export async function generateStaticParams() {
  return restaurantsData.map((r) => ({ id: r.id }));
}
