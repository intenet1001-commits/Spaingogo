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
  const situation = searchParams.get("situation");
  const sort = searchParams.get("sort") || (situation === "quick" ? "distance" : "rating");
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

  // 상황 필터
  if (situation) {
    switch (situation) {
      case "tired":
        results = results.filter((r) =>
          (r.distanceMeters ?? 0) < 2500 &&
          (r.category === "tapas" || r.category === "seafood" ||
           r.tags.some((t) => ["현지인추천", "카탈루냐", "역사"].includes(t)))
        );
        break;
      case "romantic":
        results = results.filter((r) =>
          r.tags.some((t) => ["로맨틱", "해변뷰", "고급", "지중해", "분위기"].includes(t)) ||
          r.priceRange === "$$$" || r.priceRange === "$$$$"
        );
        break;
      case "friends":
        results = results.filter((r) =>
          ["tapas", "pintxos", "paella"].includes(r.category) ||
          r.tags.some((t) => ["타파스", "핀초스", "공유", "다양"].includes(t))
        );
        break;
      case "hangover":
        results = results.filter((r) =>
          r.category !== "churros" &&
          (r.distanceMeters ?? 0) < 3500 &&
          (r.category === "seafood" || r.category === "paella" ||
           r.tags.some((t) => ["해산물", "아침", "든든"].includes(t)) ||
           r.openHours.includes("09:") || r.openHours.includes("08:"))
        );
        break;
      case "special":
        results = results.filter((r) => r.michelin || r.priceRange === "$$$" || r.priceRange === "$$$$");
        break;
      case "budget":
        results = results.filter((r) => r.priceRange === "$" || r.priceRange === "$$");
        break;
      case "morning":
        results = results.filter((r) =>
          r.openHours.includes("09:") || r.openHours.includes("08:") ||
          r.tags.some((t) => ["아침"].includes(t))
        );
        break;
      case "nightsnack":
        results = results.filter((r) =>
          r.openHours.includes("23:") || r.openHours.includes("01:") || r.openHours.includes("00:")
        );
        break;
      case "wine":
        results = results.filter((r) =>
          r.tags.some((t) => ["와인", "카바", "베르무트", "자연파와인"].includes(t))
        );
        break;
      case "seafood":
        results = results.filter((r) =>
          r.category === "seafood" ||
          r.tags.some((t) => ["해산물", "파에야", "지중해"].includes(t))
        );
        break;
      case "dessert":
        results = results.filter((r) =>
          r.category === "churros" ||
          r.tags.some((t) => ["디저트", "츄러스", "초콜릿", "도넛", "아티즌", "브런치", "카페"].includes(t))
        );
        break;
    }
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
