import { NextRequest, NextResponse } from "next/server";
import restaurantsData from "@/infrastructure/data/restaurants.json";
import { distanceFromHotel, formatDistance, walkingMinutes } from "@/domain/services/DistanceCalculatorService";

export interface Restaurant {
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
  priceRange: string;
  openHours: string;
  tags: string[];
  michelin: boolean;
  imageUrl: string;
  district: string;
  distanceMeters?: number;
  distanceText?: string;
  walkingMinutes?: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("q");
  const sort = searchParams.get("sort") || "rating";
  const michelin = searchParams.get("michelin");

  let results: Restaurant[] = (restaurantsData as Restaurant[]).map((r) => {
    const meters = distanceFromHotel({ lat: r.lat, lng: r.lng });
    return {
      ...r,
      distanceMeters: Math.round(meters),
      distanceText: formatDistance(meters),
      walkingMinutes: walkingMinutes(meters),
    };
  });

  // 카테고리 필터
  if (category && category !== "all") {
    results = results.filter((r) => r.category === category);
  }

  // 검색 필터
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.district.toLowerCase().includes(q)
    );
  }

  // 미슐랭 필터
  if (michelin === "true") {
    results = results.filter((r) => r.michelin);
  }

  // 정렬
  if (sort === "rating") {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sort === "distance") {
    results.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  } else if (sort === "reviews") {
    results.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  return NextResponse.json({ restaurants: results, total: results.length });
}
