import { NextRequest, NextResponse } from "next/server";
import { distanceFromHotel, formatDistance, walkingMinutes } from "@/domain/services/DistanceCalculatorService";
import attractionsData from "@/infrastructure/data/attractions.json";

export interface Attraction {
  id: string;
  name: string;
  category: string;
  categoryEmoji: string;
  rating: number;
  reviewCount: number;
  address: string;
  lat: number;
  lng: number;
  description: string;
  openHours: string;
  entryFee: string;
  duration: number;
  tags: string[];
  tips: string;
  googleMapsUrl: string;
  imageUrl: string;
  district: string;
  michelin: boolean;
  distanceMeters?: number;
  distanceText?: string;
  walkingMinutes?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const sort = searchParams.get("sort") || "rating";
  const free = searchParams.get("free");

  let results = attractionsData.map((a) => {
    const meters = distanceFromHotel({ lat: a.lat, lng: a.lng });
    return {
      ...a,
      distanceMeters: Math.round(meters),
      distanceText: formatDistance(meters),
      walkingMinutes: walkingMinutes(meters),
    };
  }) as Attraction[];

  if (category && category !== "all") {
    results = results.filter((a) => a.category === category);
  }

  if (free === "true") {
    results = results.filter((a) => a.entryFee === "무료");
  }

  if (q) {
    const lower = q.toLowerCase();
    results = results.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        a.district.toLowerCase().includes(lower) ||
        a.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }

  if (sort === "distance") {
    results.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  } else {
    results.sort((a, b) => b.rating - a.rating);
  }

  return NextResponse.json({ attractions: results, total: results.length });
}
