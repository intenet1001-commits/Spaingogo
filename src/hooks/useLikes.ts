"use client";

import { useState, useEffect, useCallback } from "react";

type PlaceType = "restaurant" | "attraction";

export function useLikes(type: PlaceType, placeId: string) {
  const storageKey = `spaingogo_likes_${type}`;
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const likes: string[] = stored ? JSON.parse(stored) : [];
      setLiked(likes.includes(placeId));
    } catch {
      // localStorage 접근 불가 환경 무시
    }
  }, [storageKey, placeId]);

  const toggle = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      const likes: string[] = stored ? JSON.parse(stored) : [];
      const updated = likes.includes(placeId)
        ? likes.filter((id) => id !== placeId)
        : [...likes, placeId];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setLiked(!likes.includes(placeId));
    } catch {
      // silent fail
    }
  }, [storageKey, placeId]);

  return { liked, toggle };
}
