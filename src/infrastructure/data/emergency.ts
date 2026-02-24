export interface EmergencyContact {
  id: string;
  name: string;
  nameKo: string;
  phone: string;
  description: string;
  category: "emergency" | "police" | "consulate" | "hotel" | "medical" | "company";
  icon: string; // emoji
  address?: string;
  hours?: string;
  priority: number; // 1=highest
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: "sos",
    name: "Emergency",
    nameKo: "긴급전화 (경찰/소방/구급)",
    phone: "112",
    description: "유럽 통합 긴급번호. 모든 긴급상황에 발신 가능",
    category: "emergency",
    icon: "🆘",
    priority: 1,
  },
  {
    id: "ambulance",
    name: "Ambulance",
    nameKo: "구급대",
    phone: "061",
    description: "의료 응급상황",
    category: "medical",
    icon: "🚑",
    priority: 2,
  },
  {
    id: "police-national",
    name: "Policía Nacional",
    nameKo: "국가경찰",
    phone: "091",
    description: "범죄 신고, 여권 분실 신고",
    category: "police",
    icon: "👮",
    priority: 3,
  },
  {
    id: "police-local",
    name: "Guardia Urbana",
    nameKo: "바르셀로나 시경",
    phone: "092",
    description: "교통사고, 분실물, 치안 문제",
    category: "police",
    icon: "🚔",
    address: "Carrer de la Pallars, 259, Sant Martí",
    priority: 4,
  },
  {
    id: "fire",
    name: "Bomberos",
    nameKo: "소방",
    phone: "080",
    description: "화재 신고",
    category: "emergency",
    icon: "🚒",
    priority: 5,
  },
  {
    id: "consulate",
    name: "Korean Consulate",
    nameKo: "주바르셀로나 한국총영사관",
    phone: "+34934880600",
    description: "여권 분실, 긴급여행증명서, 사건사고 영사 지원",
    category: "consulate",
    icon: "🇰🇷",
    address: "Carrer de Pau Claris, 91, 08009 Barcelona",
    hours: "월~금 09:00-13:00, 14:00-18:00",
    priority: 6,
  },
  {
    id: "hotel",
    name: "Hotel Desk",
    nameKo: "호텔 프런트 데스크",
    phone: "+34932212610",
    description: "호텔 & SPA Villa Olimpic@Suites 프런트. 24시간 운영",
    category: "hotel",
    icon: "🏨",
    address: "Carrer de Pallars, 121, 125, Sant Marti, 08018 Barcelona",
    hours: "24시간",
    priority: 7,
  },
  {
    id: "ceo",
    name: "CEO",
    nameKo: "대표님",
    phone: "+821062981902",
    description: "긴급 시 연락",
    category: "company",
    icon: "👔",
    priority: 8,
  },
  {
    id: "director",
    name: "Director",
    nameKo: "상무님",
    phone: "+821038320212",
    description: "긴급 시 연락",
    category: "company",
    icon: "💼",
    priority: 9,
  },
];
