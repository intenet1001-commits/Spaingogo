"use client";

import { useState, useEffect } from "react";

// 모듈 레벨 캐시 — 페이지 내 여러 카드가 GPS를 중복 호출하지 않도록
let cachedCoords: { lat: number; lng: number } | null = null;
let fetchCalled = false;
const subscribers = new Set<(c: { lat: number; lng: number } | null) => void>();

function fetchGPS() {
  if (fetchCalled || typeof window === "undefined" || !navigator.geolocation) return;
  fetchCalled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      cachedCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      subscribers.forEach((fn) => fn(cachedCoords));
    },
    () => subscribers.forEach((fn) => fn(null)),
    { timeout: 8000, maximumAge: 60000 }
  );
}

export function useUserLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(cachedCoords);

  useEffect(() => {
    subscribers.add(setCoords);
    if (!cachedCoords) fetchGPS();
    else setCoords(cachedCoords);

    return () => { subscribers.delete(setCoords); };
  }, []);

  return coords;
}
