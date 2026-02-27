import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import restaurantsData from "@/infrastructure/data/restaurants.json";
import attractionsData from "@/infrastructure/data/attractions.json";

const placeNameMap: Record<string, { name: string; emoji: string }> = {};
for (const r of restaurantsData) {
  placeNameMap[`restaurant:${r.id}`] = { name: r.name, emoji: r.categoryEmoji };
}
for (const a of attractionsData) {
  placeNameMap[`attraction:${a.id}`] = { name: a.name, emoji: a.categoryEmoji };
}

const COMMENTS_FILE = path.join(process.cwd(), "comments.json");

interface Comment {
  id: string;
  type: "restaurant" | "attraction";
  placeId: string;
  nickname: string;
  content: string;
  rating?: number;
  createdAt: string;
}

function readComments(): Comment[] {
  try {
    if (!fs.existsSync(COMMENTS_FILE)) {
      fs.writeFileSync(COMMENTS_FILE, JSON.stringify({ comments: [] }), "utf-8");
    }
    const data = JSON.parse(fs.readFileSync(COMMENTS_FILE, "utf-8"));
    return data.comments || [];
  } catch {
    return [];
  }
}

function writeComments(comments: Comment[]): void {
  fs.writeFileSync(COMMENTS_FILE, JSON.stringify({ comments }, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const placeId = searchParams.get("id");
  const limit = parseInt(searchParams.get("limit") || "0", 10);
  const enrich = searchParams.get("enrich") === "true";

  const comments = readComments();
  let filtered = comments
    .filter((c) => (!type || c.type === type) && (!placeId || c.placeId === placeId))
    .reverse();

  if (limit > 0) filtered = filtered.slice(0, limit);

  if (enrich) {
    const enriched = filtered.map((c) => {
      const info = placeNameMap[`${c.type}:${c.placeId}`];
      return { ...c, placeName: info?.name ?? c.placeId, placeEmoji: info?.emoji ?? "📍" };
    });
    return NextResponse.json({ comments: enriched });
  }

  return NextResponse.json({ comments: filtered });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, placeId, nickname, content, rating } = body;

  if (!type || !placeId || !nickname?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "닉네임과 내용을 입력해주세요." }, { status: 400 });
  }
  if (nickname.trim().length > 20) {
    return NextResponse.json({ error: "닉네임은 20자 이하로 입력해주세요." }, { status: 400 });
  }
  if (content.trim().length > 300) {
    return NextResponse.json({ error: "댓글은 300자 이하로 입력해주세요." }, { status: 400 });
  }

  const comments = readComments();
  const newComment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    placeId,
    nickname: nickname.trim(),
    content: content.trim(),
    rating: rating ? Number(rating) : undefined,
    createdAt: new Date().toISOString(),
  };

  comments.push(newComment);
  writeComments(comments);

  return NextResponse.json({ comment: newComment }, { status: 201 });
}
