"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  emoji: string;
  label: string;
}

function getWeatherInfo(code: number): { emoji: string; label: string } {
  if (code === 0) return { emoji: "☀️", label: "맑음" };
  if (code <= 2) return { emoji: "⛅", label: "구름 조금" };
  if (code === 3) return { emoji: "☁️", label: "흐림" };
  if (code <= 49) return { emoji: "🌫️", label: "안개" };
  if (code <= 59) return { emoji: "🌦️", label: "이슬비" };
  if (code <= 69) return { emoji: "🌧️", label: "비" };
  if (code <= 79) return { emoji: "❄️", label: "눈" };
  if (code <= 84) return { emoji: "🌧️", label: "소나기" };
  if (code <= 99) return { emoji: "⛈️", label: "뇌우" };
  return { emoji: "🌡️", label: "-" };
}

function formatTime(tz: string) {
  return new Date().toLocaleTimeString("ko-KR", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(tz: string) {
  return new Date().toLocaleDateString("ko-KR", {
    timeZone: tz,
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function DualClock() {
  const [tick, setTick] = useState(0);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=41.3983&longitude=2.1969&current=temperature_2m,weathercode&timezone=Europe/Madrid"
    )
      .then((r) => r.json())
      .then((data) => {
        const c = data.current;
        const { emoji, label } = getWeatherInfo(c.weathercode);
        setWeather({ temperature: Math.round(c.temperature_2m), emoji, label });
      })
      .catch(() => {});
  }, []);

  void tick;

  const bcnTime = formatTime("Europe/Madrid");
  const seoulTime = formatTime("Asia/Seoul");
  const bcnDate = formatDate("Europe/Madrid");
  const seoulDate = formatDate("Asia/Seoul");

  return (
    <div className="flex items-center gap-3 text-white/90">
      {/* 바르셀로나 */}
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">🇪🇸</span>
        <div className="leading-tight">
          <p className="text-[10px] text-white/60">바르셀로나</p>
          <p className="text-sm font-bold tabular-nums tracking-tight">{bcnTime}</p>
          <p className="text-[10px] text-white/55">{bcnDate}</p>
        </div>
      </div>

      <div className="w-px h-8 bg-white/20 flex-shrink-0" />

      {/* 서울 */}
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">🇰🇷</span>
        <div className="leading-tight">
          <p className="text-[10px] text-white/60">서울</p>
          <p className="text-sm font-bold tabular-nums tracking-tight">{seoulTime}</p>
          <p className="text-[10px] text-white/55">{seoulDate}</p>
        </div>
      </div>

      {/* 날씨 */}
      {weather && (
        <>
          <div className="w-px h-8 bg-white/20 flex-shrink-0" />
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{weather.emoji}</span>
            <div className="leading-tight">
              <p className="text-[10px] text-white/60">날씨</p>
              <p className="text-sm font-bold tabular-nums">{weather.temperature}°C</p>
              <p className="text-[10px] text-white/55">{weather.label}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
