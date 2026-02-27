import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, count } = await supabase
    .from("comments")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  if (count === 0) return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json({ success: true });
}
