"use client";

import { useState, useEffect } from "react";

interface WeatherData {
  temperature: number;
  weathercode: number;
  windspeed: number;
  humidity: number;
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

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=41.3983&longitude=2.1969&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m&timezone=Europe/Madrid"
    )
      .then((r) => r.json())
      .then((data) => {
        const c = data.current;
        setWeather({
          temperature: Math.round(c.temperature_2m),
          weathercode: c.weathercode,
          windspeed: Math.round(c.windspeed_10m),
          humidity: c.relative_humidity_2m,
        });
      })
      .catch(() => {});
  }, []);

  if (!weather) return null;

  const { emoji, label } = getWeatherInfo(weather.weathercode);

  return (
    <div className="mt-4 flex items-center gap-2.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-2.5 text-white text-sm">
      <span className="text-lg">{emoji}</span>
      <span className="font-semibold">{weather.temperature}°C</span>
      <span className="text-white/80">{label}</span>
      <span className="text-white/40">·</span>
      <span className="text-white/75">💧{weather.humidity}%</span>
      <span className="text-white/40">·</span>
      <span className="text-white/75">💨{weather.windspeed}km/h</span>
    </div>
  );
}
