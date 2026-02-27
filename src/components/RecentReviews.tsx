"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, PenLine } from "lucide-react";

interface EnrichedComment {
  id: string;
  type: "restaurant" | "attraction";
  placeId: string;
  placeName: string;
  placeEmoji: string;
  nickname: string;
  content: string;
  rating?: number;
  createdAt: string;
}

export default function RecentReviews() {
  const [comments, setComments] = useState<EnrichedComment[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/comments?limit=5&enrich=true")
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  return (
    <section className="px-4 pt-6 pb-2">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle size={18} className="text-[#C60B1E]" />
        <h2 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8]">
          ✍️ MWC 멤버 리뷰
        </h2>
      </div>

      {comments.length === 0 ? (
        /* 리뷰 없을 때 — 작성 유도 */
        <div className="p-5 rounded-2xl bg-[#F5F0E8] dark:bg-[#2A2018] border border-dashed border-[#D0C4B4] dark:border-[#3A2E24] text-center">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-sm font-bold text-[#1A1209] dark:text-[#F5F0E8] mb-1">
            아직 MWC 멤버 리뷰가 없어요!
          </p>
          <p className="text-xs text-[#6B5E4E] dark:text-[#B8A898] leading-relaxed mb-4">
            아직 방문 전이라도 괜찮아요 😊<br />
            저녁 예약해둔 곳, 꼭 가보고 싶은 맛집·명소가 있다면<br />
            <strong className="text-[#C60B1E]">첫 번째 MWC 리뷰어</strong>가 되어보세요!
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/restaurants"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C60B1E] text-white text-xs font-semibold active:scale-95 transition-all shadow-sm"
            >
              <PenLine size={13} />
              🍽️ 맛집 리뷰 쓰기
            </Link>
            <Link
              href="/attractions"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1B4F8A] text-white text-xs font-semibold active:scale-95 transition-all shadow-sm"
            >
              <PenLine size={13} />
              🗺️ 명소 리뷰 쓰기
            </Link>
          </div>
        </div>
      ) : (
        /* 리뷰 있을 때 — 목록 표시 */
        <div className="space-y-2.5">
          {comments.map((comment) => (
            <Link
              key={comment.id}
              href={`/${comment.type === "restaurant" ? "restaurants" : "attractions"}/${comment.placeId}`}
            >
              <div className="p-3.5 bg-[#F5F0E8] dark:bg-[#2A2018] rounded-2xl active:scale-[0.99] transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-[#1A1209] dark:text-[#F5F0E8] truncate max-w-[65%]">
                    {comment.placeEmoji} {comment.placeName}
                  </span>
                  {comment.rating ? (
                    <span className="text-xs">{"⭐".repeat(comment.rating)}</span>
                  ) : (
                    <span className="text-xs text-[#8A7A6A]">
                      {comment.type === "restaurant" ? "🍽️ 맛집" : "🗺️ 명소"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A3E30] dark:text-[#C8B898] line-clamp-2 leading-relaxed mb-2">
                  {comment.content}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#C60B1E]/10 flex items-center justify-center text-xs font-bold text-[#C60B1E]">
                    {comment.nickname[0].toUpperCase()}
                  </span>
                  <span className="text-xs text-[#8A7A6A]">{comment.nickname}</span>
                </div>
              </div>
            </Link>
          ))}

          {/* 추가 리뷰 유도 */}
          <div className="flex gap-2 pt-1">
            <Link
              href="/restaurants"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#F5F0E8] dark:bg-[#2A2018] border border-[#E8DDD0] dark:border-[#3A2E24] text-xs font-medium text-[#6B5E4E] dark:text-[#B8A898] active:scale-95 transition-all"
            >
              <PenLine size={12} />
              맛집 리뷰 추가
            </Link>
            <Link
              href="/attractions"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#F5F0E8] dark:bg-[#2A2018] border border-[#E8DDD0] dark:border-[#3A2E24] text-xs font-medium text-[#6B5E4E] dark:text-[#B8A898] active:scale-95 transition-all"
            >
              <PenLine size={12} />
              명소 리뷰 추가
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
