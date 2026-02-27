import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
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
  contactUrl?: string;
  imageUrl: string;
  district: string;
  michelin: boolean;
  hidden?: boolean;
  distanceMeters?: number;
  distanceText?: string;
  walkingMinutes?: number;
}

const COMMENTS_FILE = path.join(process.cwd(), "comments.json");

function getCommentCountMap(type: string): Record<string, number> {
  try {
    if (!fs.existsSync(COMMENTS_FILE)) return {};
    const data = JSON.parse(fs.readFileSync(COMMENTS_FILE, "utf-8"));
    const counts: Record<string, number> = {};
    for (const c of data.comments || []) {
      if (c.type === type) counts[c.placeId] = (counts[c.placeId] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const situation = searchParams.get("situation");
  const free = searchParams.get("free");
  const defaultSort = situation === "near" ? "distance" : "rating";
  const sort = searchParams.get("sort") || defaultSort;

  let results = attractionsData.map((a) => {
    const meters = distanceFromHotel({ lat: a.lat, lng: a.lng });
    return {
      ...a,
      distanceMeters: Math.round(meters),
      distanceText: formatDistance(meters),
      walkingMinutes: walkingMinutes(meters),
    };
  }) as Attraction[];

  if (situation) {
    switch (situation) {
      case "photo":
        results = results.filter((a) =>
          a.tags.some((t) => ["사진명소", "전망", "야경", "가우디", "모자이크"].includes(t))
        );
        break;
      case "walk":
        results = results.filter((a) =>
          a.category === "beach" ||
          a.tags.some((t) => ["산책", "가로수길", "공원", "골목"].includes(t))
        );
        break;
      case "church":
        results = results.filter((a) =>
          a.tags.some((t) => ["한인교회", "교회", "예배"].includes(t))
        );
        break;
      case "free":
        results = results.filter((a) => a.entryFee === "무료");
        break;
      case "night":
        results = results.filter((a) =>
          a.category === "nightview" ||
          a.tags.some((t) => ["야경", "야간", "일몰", "썬셋"].includes(t))
        );
        break;
      case "history":
        results = results.filter((a) =>
          a.tags.some((t) => ["역사", "유네스코", "유적", "로마유적", "중세건물"].includes(t))
        );
        break;
      case "beach":
        results = results.filter((a) =>
          a.category === "beach" ||
          a.tags.some((t) => ["해변", "지중해", "해산물", "지중해뷰"].includes(t))
        );
        break;
      case "indoor":
        results = results.filter((a) =>
          a.category === "museum" ||
          a.tags.some((t) => ["실내", "미술관", "박물관"].includes(t))
        );
        break;
      case "shopping":
        results = results.filter((a) =>
          a.category === "shopping" ||
          a.tags.some((t) => ["쇼핑", "시장", "명품"].includes(t))
        );
        break;
      case "near":
        results = results.filter((a) => (a.distanceMeters ?? 0) < 2500);
        break;
      case "halfday":
        results = results.filter((a) => a.duration >= 60 && a.duration <= 120);
        break;
      case "art":
        results = results.filter((a) =>
          a.category === "museum" ||
          a.tags.some((t) => ["미술관", "가우디", "건축", "모더니즘", "유네스코", "예술"].includes(t))
        );
        break;
    }
  }

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

  // hidden 항목 제거 (church 상황일 때는 포함)
  if (situation !== "church") {
    results = results.filter((a) => !a.hidden);
  }

  if (sort === "distance") {
    results.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  } else if (sort === "memberReviews") {
    const countMap = getCommentCountMap("attraction");
    results.sort((a, b) => (countMap[b.id] ?? 0) - (countMap[a.id] ?? 0));
  } else {
    results.sort((a, b) => b.rating - a.rating);
  }

  return NextResponse.json({ attractions: results, total: results.length });
}
