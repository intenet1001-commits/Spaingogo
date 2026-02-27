"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Clock, MapPin, Hotel, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Attraction } from "@/app/api/attractions/route";
import { useUserLocation } from "@/hooks/useUserLocation";
import { haversineDistance, formatDistance, walkingMinutes } from "@/domain/services/DistanceCalculatorService";

interface Props {
  attraction: Attraction;
  compact?: boolean;
}

export default function AttractionCard({ attraction, compact = false }: Props) {
  const {
    id,
    name,
    categoryEmoji,
    rating,
    reviewCount,
    address,
    description,
    entryFee,
    openHours,
    duration,
    imageUrl,
    distanceText,
    walkingMinutes: hotelWalkMins,
  } = attraction;

  const userCoords = useUserLocation();
  const userDistanceText = userCoords
    ? formatDistance(haversineDistance(userCoords, { lat: attraction.lat, lng: attraction.lng }))
    : null;
  const userWalkMins = userCoords
    ? walkingMinutes(haversineDistance(userCoords, { lat: attraction.lat, lng: attraction.lng }))
    : null;

  const isFree = entryFee === "무료";

  if (compact) {
    return (
      <Link href={`/attractions/${id}`}>
        <div className="flex gap-3 p-3 rounded-xl hover:bg-[#F5F0E8] dark:hover:bg-[#2A2018] transition-colors">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={imageUrl} alt={name} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-sm">{categoryEmoji}</span>
              <h3 className="font-semibold text-sm truncate text-[#1A1209] dark:text-[#F5F0E8]">{name}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B5E4E] dark:text-[#B8A898]">
              {reviewCount > 0 && (
                <>
                  <span className="flex items-center gap-0.5">
                    <Star size={11} className="fill-[#FFC400] text-[#FFC400]" />
                    {rating.toFixed(1)}
                    <span className="text-[8px] text-[#B0A898] ml-0.5">TA</span>
                  </span>
                  <span>·</span>
                </>
              )}
              <span className={cn("font-medium", isFree ? "text-[#6B7C3E]" : "text-[#8A7A6A]")}>
                {isFree ? "무료" : entryFee.split("~")[0]}
              </span>
              {distanceText && (
                <span className="flex items-center gap-0.5 text-[#C60B1E] font-medium">
                  <Hotel size={10} />{hotelWalkMins}분
                </span>
              )}
              {userDistanceText && (
                <span className="flex items-center gap-0.5 text-[#6B7C3E] font-medium">
                  <MapPin size={10} />{userWalkMins}분
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/attractions/${id}`}>
      <article className="card-warm">
        {/* 이미지 */}
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 448px) 100vw, 448px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* 카테고리 + 입장료 배지 */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="badge-category">{categoryEmoji}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm",
                isFree
                  ? "bg-[#6B7C3E]/80 text-white"
                  : "bg-[#FFC400]/80 text-[#1A1209]"
              )}
            >
              {isFree ? "무료" : entryFee.split("~")[0]}
            </span>
          </div>

          {/* 거리 배지 — 호텔 + 내 위치 */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            {distanceText && (
              <span className="badge-distance">
                <Hotel size={10} />
                {hotelWalkMins}분
              </span>
            )}
            {userDistanceText && (
              <span className="inline-flex items-center gap-1 bg-[#6B7C3E]/25 text-white text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                <MapPin size={10} />
                {userWalkMins}분
              </span>
            )}
          </div>

          {/* 하단 이름 */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-serif font-bold text-lg text-white leading-tight drop-shadow">
              {name}
            </h3>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-4">
          {/* 별점 & 거리 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {reviewCount > 0 && (
                <>
                  <Star size={14} className="fill-[#FFC400] text-[#FFC400]" />
                  <span className="font-bold text-[#1A1209] dark:text-[#F5F0E8]">{rating.toFixed(1)}</span>
                  <span className="text-xs text-[#8A7A6A]">({reviewCount.toLocaleString()})</span>
                  <span className="text-[8px] text-[#B0A898] bg-orange-50 dark:bg-orange-950/20 px-1 py-0.5 rounded">TA기준</span>
                  <span className="text-[#D0C4B8] mx-1">·</span>
                </>
              )}
              <Timer size={12} className="text-[#8A7A6A]" />
              <span className="text-xs text-[#8A7A6A]">{duration}분</span>
            </div>

            {/* 거리 이중 표시 */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              {distanceText && (
                <span className="flex items-center gap-0.5 text-[#C60B1E]">
                  <Hotel size={11} />
                  {distanceText}
                </span>
              )}
              {distanceText && userDistanceText && (
                <span className="text-[#D0C4B8]">|</span>
              )}
              {userDistanceText && (
                <span className="flex items-center gap-0.5 text-[#6B7C3E]">
                  <MapPin size={11} />
                  {userDistanceText}
                </span>
              )}
            </div>
          </div>

          {/* 설명 */}
          <p className="text-sm text-[#6B5E4E] dark:text-[#B8A898] line-clamp-2 mb-3 leading-relaxed">
            {description}
          </p>

          {/* 주소 & 영업시간 */}
          <div className="space-y-1.5">
            <div className="flex items-start gap-1.5 text-xs text-[#8A7A6A]">
              <MapPin size={12} className="mt-0.5 flex-shrink-0 text-[#C60B1E]" />
              <span className="line-clamp-1">{address}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#8A7A6A]">
              <Clock size={12} className="flex-shrink-0 text-[#6B7C3E]" />
              <span>{openHours}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
