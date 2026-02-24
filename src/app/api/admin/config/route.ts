import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "admin-config.json");

function isAuthenticated(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token")?.value;
  return !!token && token.startsWith(Buffer.from("admin:").toString("base64").slice(0, 8));
}

async function readConfig(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeConfig(config: Record<string, string>): Promise<void> {
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const config = await readConfig();

  // 키 값을 마스킹하여 반환
  const masked: Record<string, string> = {};
  for (const [key, value] of Object.entries(config)) {
    if (typeof value === "string" && value.length > 8) {
      masked[key] = value.slice(0, 4) + "****" + value.slice(-4);
    } else {
      masked[key] = value ? "****" : "";
    }
  }

  return NextResponse.json({
    config: masked,
    hasGoogleMaps: !!config.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    hasAnthropic: !!config.ANTHROPIC_API_KEY || !!process.env.ANTHROPIC_API_KEY,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await req.json();
  const config = await readConfig();

  if (body.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    config.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = body.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  }
  if (body.ANTHROPIC_API_KEY) {
    config.ANTHROPIC_API_KEY = body.ANTHROPIC_API_KEY;
  }

  await writeConfig(config);

  return NextResponse.json({ success: true, message: "API 키가 저장되었습니다." });
}
