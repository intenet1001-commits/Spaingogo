import Link from "next/link";
import { Phone, MapPin, Clock, ChevronLeft, Shield, AlertTriangle } from "lucide-react";
import { EMERGENCY_CONTACTS } from "@/infrastructure/data/emergency";
import type { EmergencyContact } from "@/infrastructure/data/emergency";
import HotelNavigationButton from "@/components/HotelNavigationButton";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";

const HOTEL_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Hotel+%26+SPA+Villa+Olimpic%40Suites+Barcelona";

const SAFETY_TIPS = [
  {
    icon: "🎒",
    title: "소매치기 주의",
    tips: [
      "라 보케리아(La Boqueria) 시장, 람블라스 거리, 고딕 지구는 소매치기 다발 지역입니다.",
      "가방은 앞으로 메고, 휴대폰·지갑은 앞주머니에 보관하세요.",
      "누군가 다가와 말을 걸거나 뭔가를 건네면 주의하세요.",
    ],
  },
  {
    icon: "📄",
    title: "여권 관리",
    tips: [
      "여권 사본(또는 사진)을 휴대폰에 저장해 두세요.",
      "원본 여권은 호텔 금고에 보관하는 것을 권장합니다.",
      "분실 시 즉시 국가경찰(091)에 신고 후 영사관에 연락하세요.",
    ],
  },
  {
    icon: "🏥",
    title: "여행자 보험",
    tips: [
      "여행자보험 긴급연락처와 증권번호를 메모해 두세요.",
      "병원 방문 시 영수증·진단서를 반드시 챙기세요.",
      "응급실(urgencias)은 112 또는 061로 연락하세요.",
    ],
  },
  {
    icon: "🗣️",
    title: "언어 소통",
    tips: [
      "Google 번역 앱 스페인어(Español) 모드를 미리 다운로드해 두세요.",
      "긴급 상황 시 112는 영어 통역 서비스를 제공합니다.",
      "호텔 프런트는 24시간 한국어·영어 지원이 가능합니다.",
    ],
  },
  {
    icon: "📍",
    title: "호텔 주소 저장",
    tips: [
      "호텔 명함을 프런트에서 받아 항상 지참하세요.",
      "주소: Carrer de Pallars, 121-125, Sant Martí, 08018 Barcelona",
      "택시 이용 시 명함을 보여주면 의사소통이 편리합니다.",
    ],
  },
];

function ContactRow({ contact }: { contact: EmergencyContact }) {
  const isEmergency =
    contact.category === "emergency" || contact.category === "medical";

  return (
    <a
      href={`tel:${contact.phone}`}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98]",
        isEmergency
          ? "bg-[#C60B1E]/8 border-[#C60B1E]/30 hover:bg-[#C60B1E]/12"
          : "bg-white dark:bg-[#2A2018] border-[#E8DDD0] dark:border-[#3A2E24] hover:border-[#C60B1E]/30"
      )}
    >
      <span className="text-3xl flex-shrink-0">{contact.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-sm text-[#1A1209] dark:text-[#F5F0E8]">
            {contact.nameKo}
          </p>
          {isEmergency && (
            <span className="text-[10px] font-bold bg-[#C60B1E] text-white px-1.5 py-0.5 rounded-full">
              긴급
            </span>
          )}
        </div>
        <p className="text-xs text-[#8A7A6A] mt-0.5">{contact.description}</p>
        {contact.address && (
          <div className="flex items-start gap-1 mt-1">
            <MapPin size={10} className="text-[#8A7A6A] mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-[#8A7A6A] leading-tight">
              {contact.address}
            </p>
          </div>
        )}
        {contact.hours && (
          <div className="flex items-center gap-1 mt-0.5">
            <Clock size={10} className="text-[#6B7C3E] flex-shrink-0" />
            <p className="text-[10px] text-[#6B7C3E]">{contact.hours}</p>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <span
          className={cn(
            "font-bold text-lg",
            isEmergency
              ? "text-[#C60B1E]"
              : "text-[#1A1209] dark:text-[#F5F0E8]"
          )}
        >
          {contact.phone}
        </span>
        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center",
            isEmergency ? "bg-[#C60B1E]" : "bg-[#6B7C3E]"
          )}
        >
          <Phone size={16} className="text-white" />
        </div>
      </div>
    </a>
  );
}

export default function EmergencyPage() {
  const companyContacts = EMERGENCY_CONTACTS.filter(
    (c) => c.category === "company"
  );
  const emergencyContacts = EMERGENCY_CONTACTS.filter((c) =>
    ["emergency", "medical"].includes(c.category)
  );
  const policeContacts = EMERGENCY_CONTACTS.filter(
    (c) => c.category === "police"
  );
  const supportContacts = EMERGENCY_CONTACTS.filter((c) =>
    ["consulate", "hotel"].includes(c.category)
  );

  return (
    <div className="pb-24">
      {/* 헤더 */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#8B0000] via-[#C60B1E] to-[#A00818] px-5 pt-14 pb-10 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-6 text-8xl select-none">🆘</div>
        </div>
        <div className="relative">
          <Link
            href="/"
            className="flex items-center gap-1 text-white/70 text-sm mb-4 hover:text-white transition-colors w-fit"
          >
            <ChevronLeft size={16} />
            홈으로
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={18} className="text-white/80" />
            <span className="text-xs text-white/70 font-medium uppercase tracking-wider">
              Emergency Guide
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold leading-tight mb-2">
            긴급 연락처
          </h1>
          <p className="text-sm text-white/75 leading-relaxed">
            바르셀로나 긴급 연락처 및 안전 가이드
          </p>
          <div className="mt-4 flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
            <AlertTriangle size={14} className="text-[#FFC400] flex-shrink-0" />
            <p className="text-xs text-white/90">
              전화번호를 탭하면 즉시 전화연결됩니다
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-6 space-y-6">
        {/* 회사 연락처 섹션 */}
        <section>
          <h2 className="text-xs font-bold text-[#5A6E9E] uppercase tracking-wider mb-3">
            🏢 회사 연락처
          </h2>
          <div className="space-y-2">
            {companyContacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </div>
        </section>

        {/* 긴급 섹션 */}
        <section>
          <h2 className="text-xs font-bold text-[#C60B1E] uppercase tracking-wider mb-3">
            🚨 긴급 (즉시 연결)
          </h2>
          <div className="space-y-2">
            {emergencyContacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </div>
        </section>

        {/* 경찰 섹션 */}
        <section>
          <h2 className="text-xs font-bold text-[#6B5E4E] uppercase tracking-wider mb-3">
            👮 경찰
          </h2>
          <div className="space-y-2">
            {policeContacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </div>
        </section>

        {/* 영사관 & 호텔 섹션 */}
        <section>
          <h2 className="text-xs font-bold text-[#6B7C3E] uppercase tracking-wider mb-3">
            🇰🇷 영사관 & 호텔
          </h2>
          <div className="space-y-2">
            {supportContacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </div>
        </section>

        {/* 호텔 지도 */}
        <section>
          <a
            href={HOTEL_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-2xl bg-[#F5F0E8] dark:bg-[#2A2018] border border-[#E8DDD0] dark:border-[#3A2E24] hover:border-[#C60B1E]/30 transition-all active:scale-[0.98]"
          >
            <span className="text-3xl flex-shrink-0">🗺️</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[#1A1209] dark:text-[#F5F0E8]">
                호텔 위치 지도 보기
              </p>
              <p className="text-xs text-[#8A7A6A] mt-0.5">
                Google Maps에서 열기
              </p>
              <p className="text-[10px] text-[#6B5E4E] dark:text-[#B8A898] mt-0.5">
                Carrer de Pallars, 121-125, 08018 Barcelona
              </p>
            </div>
            <MapPin size={20} className="text-[#C60B1E] flex-shrink-0" />
          </a>
        </section>

        {/* 호텔로 돌아가기 */}
        <section>
          <HotelNavigationButton variant="inline" />
        </section>

        {/* 안전 팁 */}
        <section>
          <h2 className="font-serif text-xl font-bold text-[#1A1209] dark:text-[#F5F0E8] mb-4">
            🛡️ 바르셀로나 안전 가이드
          </h2>
          <div className="space-y-3">
            {SAFETY_TIPS.map((tip) => (
              <div
                key={tip.title}
                className="p-4 rounded-2xl bg-white dark:bg-[#2A2018] border border-[#E8DDD0] dark:border-[#3A2E24]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{tip.icon}</span>
                  <h3 className="font-bold text-sm text-[#1A1209] dark:text-[#F5F0E8]">
                    {tip.title}
                  </h3>
                </div>
                <ul className="space-y-1.5">
                  {tip.tips.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C60B1E] mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-[#6B5E4E] dark:text-[#B8A898] leading-relaxed">
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 하단 안내 */}
        <div className="p-4 rounded-2xl bg-[#6B7C3E]/10 border border-[#6B7C3E]/30">
          <p className="text-xs text-[#6B7C3E] font-medium text-center leading-relaxed">
            이 페이지를 스크린샷으로 저장해두면<br />
            인터넷 없이도 긴급연락처를 확인할 수 있습니다
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
