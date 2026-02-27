# Spaingogo — CLAUDE.md

바르셀로나 맛집·관광 정보 PWA (한국인 여행자 대상)

## Dev Server
```bash
npm run dev   # → http://localhost:9020
```

## 배포
- URL: https://spaingogo.vercel.app
- Vercel 자동 배포 (main 브랜치 push)
- OG 캐시 초기화(카카오톡): https://developers.kakao.com/tool/clear/og

## 핵심 컴포넌트 맵

| 컴포넌트 | 파일 | 역할 |
|---|---|---|
| HomeTabView | `src/components/HomeTabView.tsx` | 먹고?/갈래? 탭 스위처 (Client, sticky) |
| DualClock | `src/components/DualClock.tsx` | BCN+서울 실시간 시계 + Open-Meteo 날씨 |
| WeatherWidget | `src/components/WeatherWidget.tsx` | 독립 날씨 위젯 (온도·습도·풍속) |
| EmergencyButton | `src/components/EmergencyButton.tsx` | SOS FAB — layout.tsx 글로벌 배치 |
| PWAInstall | `src/components/PWAInstall.tsx` | PWA 설치 배너 제어 — layout.tsx 글로벌 배치 |
| InstallBanner | `src/components/InstallBanner.tsx` | iOS/Android/인앱 설치 안내 배너 |
| CommentSection | `src/components/CommentSection.tsx` | MWC 멤버 리뷰 작성·조회 |
| RecentReviews | `src/components/RecentReviews.tsx` | 홈 최신 리뷰 미리보기 |

## 데이터 파일
- `src/infrastructure/data/restaurants.json` — 맛집 20개
- `src/infrastructure/data/attractions.json` — 명소 20개
- `src/infrastructure/data/emergency.ts` — 긴급연락처
  - category 타입: `"emergency" | "medical" | "police" | "consulate" | "hotel" | "company"`
  - 새 카테고리 추가 시 반드시 `rg 'c\.category' src/` 로 필터 누락 검수
- `comments.json` (루트) — MWC 멤버 리뷰 (⚠️ Vercel 재배포 시 소멸 — KV 마이그레이션 필요)

## 기준 좌표 (호텔)
- **Hotel & SPA Villa Olimpic@Suites**, Carrer de Pallars 121-125, Barcelona
- 위도: `41.3983`, 경도: `2.1969`
- 이 좌표를 사용하는 곳: `DualClock.tsx`, `WeatherWidget.tsx`, `HotelCoordinate.ts`

## 외부 API
- **Open-Meteo** (날씨): 무료·무인증
  - `https://api.open-meteo.com/v1/forecast?latitude=41.3983&longitude=2.1969&current=temperature_2m,weathercode&timezone=Europe/Madrid`
- **Google Maps**: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (.env.local)
- **Anthropic**: `ANTHROPIC_API_KEY` — AI 추천 P3 기능 (미구현)

## PWA 구조
- `public/manifest.json` + `public/icons/` (192, 512, apple-touch-icon 180px)
- 인앱 감지: `INAPP_RE = /KAKAOTALK|Instagram|NAVER|Line/i`
- `appleWebApp`, `themeColor: #C60B1E`, `openGraph` → `layout.tsx`
- Next.js 15: `viewport`는 `metadata`와 **별도 export** 필수

## FAB 배치 원칙
- SOS FAB (좌하단): `EmergencyButton` — layout.tsx 글로벌
- 호텔 복귀 FAB (우하단): 각 페이지
- PWA 설치 버튼 (우상단 고정): `PWAInstall` — layout.tsx 글로벌

## ⚠️ 알려진 이슈 (다음 세션)
- **P0**: `comments.json` Vercel 재배포 시 소멸 → Vercel KV 마이그레이션
- **P1**: `/bookmarks` storage key 불일치 (`spaingogo_bookmarks` vs `spaingogo_likes_${type}`)
- **P1**: `/nearby` 명소 탭 없음
- **P2**: 홈 카테고리·정렬 URL params 리스트 페이지에서 미처리
