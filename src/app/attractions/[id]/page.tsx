import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Clock, ChevronLeft, Navigation, Timer } from "lucide-react";
import HotelNavigationButton from "@/components/HotelNavigationButton";
import BottomNav from "@/components/BottomNav";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import attractionsData from "@/infrastructure/data/attractions.json";
import { distanceFromHotel, formatDistance, walkingMinutes } from "@/domain/services/DistanceCalculatorService";

interface Props {
  params: Promise<{ id: string }>;
}

function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export default async function AttractionDetailPage({ params }: Props) {
  const { id } = await params;
  const attraction = attractionsData.find((a) => a.id === id);
  if (!attraction) notFound();

  const meters = distanceFromHotel({ lat: attraction.lat, lng: attraction.lng });
  const distanceText = formatDistance(meters);
  const walkMins = walkingMinutes(meters);
  const googleMapsUrl = getGoogleMapsUrl(attraction.lat, attraction.lng);
  const isFree = attraction.entryFee === "무료";

  return (
    <div className="pb-24">
      {/* 이미지 헤더 */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image
          src={attraction.imageUrl}
          alt={attraction.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* 뒤로가기 */}
        <Link
          href="/attractions"
          className="absolute top-4 left-4 w-9 h-9 bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>

        {/* 입장료 배지 */}
        <div className="absolute top-4 right-4">
          <span
            className={`text-sm px-3 py-1 rounded-full font-semibold backdrop-blur-sm ${
              isFree
                ? "bg-[#6B7C3E]/80 text-white"
                : "bg-[#FFC400]/80 text-[#1A1209]"
            }`}
          >
            {isFree ? "🆓 무료" : attraction.entryFee.split("~")[0]}
          </span>
        </div>

        {/* 하단 정보 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-2xl">{attraction.categoryEmoji}</span>
            <span className="text-xs text-white/70 font-medium">{attraction.district}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-white leading-tight">
            {attraction.name}
          </h1>
        </div>
      </div>

      <div className="px-5 pt-5 space-y-5">
        {/* 핵심 정보 */}
        <div className="flex flex-wrap items-center gap-3">
          {attraction.reviewCount > 0 && (
            <>
              <div className="flex items-center gap-1.5">
                <Star size={16} className="fill-[#FFC400] text-[#FFC400]" />
                <span className="font-bold text-[#1A1209] dark:text-[#F5F0E8]">{attraction.rating.toFixed(1)}</span>
                <span className="text-sm text-[#8A7A6A]">({attraction.reviewCount.toLocaleString()})</span>
                <span className="text-[10px] text-[#B0A898] bg-orange-50 dark:bg-orange-950/20 px-1.5 py-0.5 rounded-full">TripAdvisor 기준</span>
              </div>
              <span className="text-[#8A7A6A]">·</span>
            </>
          )}
          <div className="flex items-center gap-1 text-sm font-semibold text-[#8A7A6A]">
            <Timer size={14} />
            약 {attraction.duration}분
          </div>
          <span className="text-[#8A7A6A]">·</span>
          <div className="flex items-center gap-1 text-sm font-semibold text-[#C60B1E]">
            <Navigation size={14} />
            {walkMins}분 (호텔에서 {distanceText})
          </div>
        </div>

        {/* 설명 */}
        <p className="text-sm text-[#4A3E30] dark:text-[#C8B898] leading-relaxed">
          {attraction.description}
        </p>

        {/* 위치 & 영업시간 & 입장료 */}
        <div className="space-y-2.5 p-4 bg-[#F5F0E8] dark:bg-[#2A2018] rounded-2xl">
          <div className="flex items-start gap-2.5">
            <MapPin size={16} className="text-[#C60B1E] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[#1A1209] dark:text-[#F5F0E8]">{attraction.address}</p>
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
            <p className="text-sm text-[#1A1209] dark:text-[#F5F0E8]">{attraction.openHours}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-base flex-shrink-0">🎟️</span>
            <p className="text-sm font-semibold text-[#1A1209] dark:text-[#F5F0E8]">{attraction.entryFee}</p>
          </div>
        </div>

        {/* 여행 팁 */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-xl">
          <span className="text-base mt-0.5">💡</span>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>팁:</strong> {attraction.tips}
          </p>
        </div>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2">
          {attraction.tags.map((tag) => (
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
          {/* Google Maps 길찾기 */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-br from-[#4285F4] to-[#3367D6] text-white active:scale-95 transition-all shadow-sm"
          >
            <Navigation size={18} />
            Google Maps로 길찾기
          </a>

          {/* 교회 연락처 링크 */}
          {(attraction as unknown as { contactUrl?: string }).contactUrl && (
            <a
              href={(attraction as unknown as { contactUrl?: string }).contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-br from-[#6B7C3E] to-[#556030] text-white active:scale-95 transition-all shadow-sm"
            >
              <span>✉️</span>
              교회 연락처 페이지
            </a>
          )}

          {/* 호텔로 돌아가기 */}
          <HotelNavigationButton variant="inline" />

          {/* 찜하기 버튼 */}
          <LikeButton type="attraction" placeId={attraction.id} />
        </div>

        {/* MWC 멤버 리뷰 */}
        <div className="border-t border-[#E8DFD0] dark:border-[#3A3028] pt-5">
          <CommentSection type="attraction" placeId={attraction.id} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export async function generateStaticParams() {
  return attractionsData.map((a) => ({ id: a.id }));
}
