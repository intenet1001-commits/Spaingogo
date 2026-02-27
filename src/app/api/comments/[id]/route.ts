import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const COMMENTS_FILE = path.join(process.cwd(), "comments.json");

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = JSON.parse(fs.readFileSync(COMMENTS_FILE, "utf-8"));
    const comments = data.comments || [];
    const updated = comments.filter((c: { id: string }) => c.id !== id);

    if (updated.length === comments.length) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    fs.writeFileSync(COMMENTS_FILE, JSON.stringify({ comments: updated }, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
