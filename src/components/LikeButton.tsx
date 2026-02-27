"use client";

import { Heart } from "lucide-react";
import { useLikes } from "@/hooks/useLikes";

interface Props {
  type: "restaurant" | "attraction";
  placeId: string;
}

export default function LikeButton({ type, placeId }: Props) {
  const { liked, toggle } = useLikes(type, placeId);

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95 ${
        liked
          ? "bg-[#C60B1E] border-[#C60B1E] text-white shadow-md"
          : "bg-white dark:bg-[#2A2018] border-[#C60B1E] text-[#C60B1E]"
      }`}
    >
      <Heart size={16} className={liked ? "fill-white" : ""} />
      {liked ? "찜 완료 ♥" : "찜하기"}
    </button>
  );
}
