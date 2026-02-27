import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const KV_KEY = "spaingogo:comments";

interface Comment {
  id: string;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const comments = (await kv.get<Comment[]>(KV_KEY)) ?? [];
    const updated = comments.filter((c) => c.id !== id);

    if (updated.length === comments.length) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    await kv.set(KV_KEY, updated);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
