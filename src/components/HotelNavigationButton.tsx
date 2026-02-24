"use client";

import { Hotel, Navigation } from "lucide-react";
import { HOTEL_NAVIGATION_URL, HOTEL_COORDINATES } from "@/domain/value-objects/HotelCoordinate";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  variant?: "fab" | "inline";
}

export default function HotelNavigationButton({ className, variant = "fab" }: Props) {
  const handleClick = () => {
    window.open(HOTEL_NAVIGATION_URL, "_blank", "noopener,noreferrer");
  };

  if (variant === "inline") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-2 w-full px-4 py-3 rounded-xl",
          "bg-gradient-to-r from-[#C60B1E] to-[#A00818]",
          "text-white font-medium text-sm",
          "shadow-warm active:scale-95 transition-all duration-200",
          className
        )}
      >
        <Hotel size={18} />
        <span className="flex-1 text-left">호텔로 돌아가기</span>
        <Navigation size={16} className="opacity-80" />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      title={`${HOTEL_COORDINATES.name}으로 도보 안내`}
      className={cn(
        "fixed bottom-24 right-4 z-40",
        "flex items-center gap-2 px-4 py-3 rounded-full",
        "bg-gradient-to-r from-[#C60B1E] to-[#A00818]",
        "text-white font-semibold text-sm shadow-warm-lg",
        "active:scale-95 transition-all duration-200 hover:shadow-2xl",
        className
      )}
    >
      <Hotel size={18} />
      <span>호텔</span>
    </button>
  );
}
