"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Save, LogOut, Key, Shield, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = "login" | "dashboard";

interface ConfigStatus {
  hasGoogleMaps: boolean;
  hasAnthropic: boolean;
  config: Record<string, string>;
}

export default function AdminPage() {
  const [stage, setStage] = useState<Stage>("login");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const [googleMapsKey, setGoogleMapsKey] = useState("");
  const [anthropicKey, setAnthropicKey] = useState("");
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [showAnthropicKey, setShowAnthropicKey] = useState(false);
  const [configStatus, setConfigStatus] = useState<ConfigStatus | null>(null);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setStage("dashboard");
        loadConfig();
      } else {
        const data = await res.json();
        setLoginError(data.error || "로그인 실패");
      }
    } catch {
      setLoginError("서버 연결 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/admin/config");
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
      }
    } catch {
      // ignore
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveMessage(null);

    const body: Record<string, string> = {};
    if (googleMapsKey) body.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = googleMapsKey;
    if (anthropicKey) body.ANTHROPIC_API_KEY = anthropicKey;

    if (!Object.keys(body).length) {
      setSaveMessage({ type: "error", text: "저장할 키를 입력해주세요." });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setSaveMessage({ type: "success", text: data.message });
        setGoogleMapsKey("");
        setAnthropicKey("");
        loadConfig();
      } else {
        setSaveMessage({ type: "error", text: data.error });
      }
    } catch {
      setSaveMessage({ type: "error", text: "저장 중 오류가 발생했습니다." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setStage("login");
    setPassword("");
    setConfigStatus(null);
  };

  if (stage === "login") {
    return (
      <div className="min-h-dvh flex items-center justify-center p-6 bg-gradient-to-br from-[#1A1209] to-[#2A1810]">
        <div className="w-full max-w-sm">
          {/* 로고 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C60B1E] to-[#FFC400] flex items-center justify-center mx-auto mb-4 shadow-warm-lg">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-white">관리자 로그인</h1>
            <p className="text-sm text-white/50 mt-1">Spaingogo 관리 대시보드</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/40 pr-12 focus:outline-none focus:border-[#FFC400] focus:bg-white/15 transition-all"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-xl px-3 py-2.5">
                <XCircle size={16} />
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className={cn(
                "w-full py-3.5 rounded-xl font-semibold text-sm transition-all",
                "bg-gradient-to-r from-[#C60B1E] to-[#A00818] text-white",
                "hover:shadow-warm-lg active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? "확인 중..." : "로그인"}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            관리자 전용 페이지입니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#FAFAF8] dark:bg-[#1A1410]">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-[#1E1810]/90 backdrop-blur border-b border-[#E8DDD0] dark:border-[#3A2E24] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C60B1E] to-[#FFC400] flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-[#1A1209] dark:text-[#F5F0E8]">관리자 대시보드</h1>
            <p className="text-xs text-[#8A7A6A]">Spaingogo</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-[#8A7A6A] hover:text-[#C60B1E] transition-colors"
        >
          <LogOut size={14} />
          로그아웃
        </button>
      </header>

      <div className="p-5 space-y-5">
        {/* 현재 상태 */}
        {configStatus && (
          <section className="card-warm p-5">
            <h2 className="font-semibold text-sm text-[#1A1209] dark:text-[#F5F0E8] mb-3 flex items-center gap-2">
              <Key size={16} className="text-[#C60B1E]" />
              API 키 현황
            </h2>
            <div className="space-y-2.5">
              <StatusRow
                label="Google Maps API"
                description="거리 계산 및 지도 서비스"
                active={configStatus.hasGoogleMaps}
                masked={configStatus.config.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              />
              <StatusRow
                label="Anthropic API"
                description="AI 맛집 추천 기능 (P3)"
                active={configStatus.hasAnthropic}
                masked={configStatus.config.ANTHROPIC_API_KEY}
              />
            </div>
          </section>
        )}

        {/* API 키 설정 */}
        <section className="card-warm p-5">
          <h2 className="font-semibold text-sm text-[#1A1209] dark:text-[#F5F0E8] mb-4 flex items-center gap-2">
            <Key size={16} className="text-[#C60B1E]" />
            API 키 업데이트
          </h2>

          <div className="space-y-3">
            {/* Google Maps Key */}
            <div>
              <label className="text-xs font-medium text-[#6B5E4E] dark:text-[#B8A898] mb-1.5 block">
                🗺️ Google Maps API Key
              </label>
              <div className="relative">
                <input
                  type={showGoogleKey ? "text" : "password"}
                  value={googleMapsKey}
                  onChange={(e) => setGoogleMapsKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full border border-[#E8DDD0] dark:border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#1A1209] dark:text-[#F5F0E8] bg-[#F5F0E8] dark:bg-[#2A2018] pr-10 focus:outline-none focus:border-[#C60B1E] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowGoogleKey(!showGoogleKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7A6A] hover:text-[#C60B1E]"
                >
                  {showGoogleKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Anthropic Key */}
            <div>
              <label className="text-xs font-medium text-[#6B5E4E] dark:text-[#B8A898] mb-1.5 block">
                🤖 Anthropic API Key (AI 추천)
              </label>
              <div className="relative">
                <input
                  type={showAnthropicKey ? "text" : "password"}
                  value={anthropicKey}
                  onChange={(e) => setAnthropicKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full border border-[#E8DDD0] dark:border-[#3A2E24] rounded-xl px-4 py-3 text-sm text-[#1A1209] dark:text-[#F5F0E8] bg-[#F5F0E8] dark:bg-[#2A2018] pr-10 focus:outline-none focus:border-[#C60B1E] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowAnthropicKey(!showAnthropicKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7A6A] hover:text-[#C60B1E]"
                >
                  {showAnthropicKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {saveMessage && (
              <div className={cn(
                "flex items-center gap-2 text-sm rounded-xl px-3 py-2.5 border",
                saveMessage.type === "success"
                  ? "text-green-700 bg-green-50 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                  : "text-red-700 bg-red-50 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
              )}>
                {saveMessage.type === "success"
                  ? <CheckCircle2 size={16} />
                  : <XCircle size={16} />
                }
                {saveMessage.text}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={loading || (!googleMapsKey && !anthropicKey)}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
                "bg-gradient-to-r from-[#C60B1E] to-[#A00818] text-white",
                "hover:shadow-warm active:scale-95",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <Save size={16} />
              {loading ? "저장 중..." : "변경사항 저장"}
            </button>
          </div>
        </section>

        {/* 보안 안내 */}
        <div className="flex items-start gap-2 text-xs text-[#8A7A6A] p-3 bg-[#F5F0E8] dark:bg-[#2A2018] rounded-xl">
          <Shield size={14} className="mt-0.5 flex-shrink-0 text-[#6B7C3E]" />
          <span>API 키는 서버에 암호화 저장됩니다. 이 페이지는 관리자만 접근 가능합니다.</span>
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  description,
  active,
  masked,
}: {
  label: string;
  description: string;
  active: boolean;
  masked?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#E8DDD0] dark:border-[#3A2E24] last:border-0">
      <div>
        <p className="text-sm font-medium text-[#1A1209] dark:text-[#F5F0E8]">{label}</p>
        <p className="text-xs text-[#8A7A6A]">{description}</p>
        {masked && (
          <p className="text-xs font-mono text-[#6B5E4E] dark:text-[#B8A898] mt-0.5">{masked}</p>
        )}
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full",
        active
          ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
          : "bg-[#F5F0E8] dark:bg-[#2A2018] text-[#8A7A6A]"
      )}>
        {active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
        {active ? "설정됨" : "미설정"}
      </div>
    </div>
  );
}
