import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import restaurantsData from "@/infrastructure/data/restaurants.json";
import attractionsData from "@/infrastructure/data/attractions.json";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const placeNameMap: Record<string, { name: string; emoji: string }> = {};
for (const r of restaurantsData) {
  placeNameMap[`restaurant:${r.id}`] = { name: r.name, emoji: r.categoryEmoji };
}
for (const a of attractionsData) {
  placeNameMap[`attraction:${a.id}`] = { name: a.name, emoji: a.categoryEmoji };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const placeId = searchParams.get("id");
  const limit = parseInt(searchParams.get("limit") || "0", 10);
  const enrich = searchParams.get("enrich") === "true";

  let query = supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  if (type) query = query.eq("type", type);
  if (placeId) query = query.eq("place_id", placeId);
  if (limit > 0) query = query.limit(limit);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });

  const comments = (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    placeId: row.place_id,
    nickname: row.nickname,
    content: row.content,
    rating: row.rating,
    createdAt: row.created_at,
  }));

  if (enrich) {
    const enriched = comments.map((c) => {
      const info = placeNameMap[`${c.type}:${c.placeId}`];
      return { ...c, placeName: info?.name ?? c.placeId, placeEmoji: info?.emoji ?? "📍" };
    });
    return NextResponse.json({ comments: enriched });
  }

  return NextResponse.json({ comments });
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

  const newComment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    place_id: placeId,
    nickname: nickname.trim(),
    content: content.trim(),
    rating: rating ? Number(rating) : null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("comments").insert(newComment).select().single();
  if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });

  return NextResponse.json({
    comment: {
      id: data.id,
      type: data.type,
      placeId: data.place_id,
      nickname: data.nickname,
      content: data.content,
      rating: data.rating,
      createdAt: data.created_at,
    },
  }, { status: 201 });
}
