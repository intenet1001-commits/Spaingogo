"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Send } from "lucide-react";

interface Comment {
  id: string;
  type: string;
  placeId: string;
  nickname: string;
  content: string;
  rating?: number;
  createdAt: string;
}

interface Props {
  type: "restaurant" | "attraction";
  placeId: string;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

export default function CommentSection({ type, placeId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?type=${type}&id=${placeId}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [type, placeId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) {
      setError("닉네임과 내용을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          placeId,
          nickname,
          content,
          rating: rating || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "오류가 발생했습니다.");
        return;
      }
      setNickname("");
      setContent("");
      setRating(0);
      setShowForm(false);
      await fetchComments();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-[#C60B1E]" />
          <h3 className="font-bold text-[#1A1209] dark:text-[#F5F0E8]">
            MWC 멤버 리뷰{" "}
            <span className="text-[#8A7A6A] font-normal text-sm">
              ({comments.length})
            </span>
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs px-3 py-1.5 rounded-full bg-[#C60B1E] text-white font-semibold active:scale-95 transition-all"
        >
          {showForm ? "취소" : "✏️ 리뷰 쓰기"}
        </button>
      </div>

      {/* 댓글 작성 폼 */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 p-4 bg-[#F5F0E8] dark:bg-[#2A2018] rounded-2xl"
        >
          <input
            type="text"
            placeholder="닉네임 (최대 20자)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={20}
            className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-[#1A1209] border border-[#D4C9B4] dark:border-[#4A3E30] focus:outline-none focus:border-[#C60B1E] text-[#1A1209] dark:text-[#F5F0E8] placeholder:text-[#C8B898]"
          />

          {/* 별점 */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#8A7A6A] mr-1">별점:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? 0 : star)}
                className="text-xl transition-transform active:scale-90 leading-none"
              >
                {star <= rating ? "⭐" : "☆"}
              </button>
            ))}
            {rating > 0 && (
              <span className="text-xs text-[#8A7A6A] ml-1">{rating}점</span>
            )}
          </div>

          <textarea
            placeholder="MWC 멤버 리뷰를 남겨주세요! (최대 300자)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={300}
            rows={3}
            className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-[#1A1209] border border-[#D4C9B4] dark:border-[#4A3E30] focus:outline-none focus:border-[#C60B1E] resize-none text-[#1A1209] dark:text-[#F5F0E8] placeholder:text-[#C8B898]"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8A7A6A]">{content.length}/300</span>
            {error && <span className="text-xs text-[#C60B1E]">{error}</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#C60B1E] text-white font-semibold text-sm active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={14} />
            {submitting ? "등록 중..." : "리뷰 등록"}
          </button>
        </form>
      )}

      {/* 댓글 목록 */}
      {loading ? (
        <p className="text-center text-sm text-[#8A7A6A] py-4">불러오는 중...</p>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-[#8A7A6A]">
          <MessageCircle size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">첫 번째 MWC 리뷰를 남겨보세요!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3.5 bg-[#F5F0E8] dark:bg-[#2A2018] rounded-2xl"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-[#C60B1E]/10 flex items-center justify-center text-sm font-bold text-[#C60B1E]">
                    {comment.nickname[0].toUpperCase()}
                  </span>
                  <span className="font-semibold text-sm text-[#1A1209] dark:text-[#F5F0E8]">
                    {comment.nickname}
                  </span>
                  {comment.rating && (
                    <span className="text-xs">
                      {"⭐".repeat(comment.rating)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#8A7A6A]">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-[#4A3E30] dark:text-[#C8B898] leading-relaxed pl-9">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
