# Spaingogo - 스페인 맛집 관광앱 TDD 구현 플랜

> 참조 앱: https://taiwan-food-nextjs.vercel.app/
> 기준 호텔: Hotel & SPA Villa Olimpic@Suites, Carrer de Pallars, 121, 125, Sant Marti, 08018 Barcelona
> 호텔 좌표: **위도 41.3983, 경도 2.1969**

---

## 빠른 시작 가이드

```bash
cd /Users/gwanli/Documents/GitHub/myproduct_v4/Spaingogo

# 1. Next.js 프로젝트 초기화
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"

# 2. 의존성 설치
npm install @radix-ui/react-slot lucide-react class-variance-authority clsx tailwind-merge
npx shadcn-ui@latest init

# 3. 테스트 환경 설정
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest

# 4. 환경 변수 (.env.local 이미 생성됨)
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 설정 완료

# 5. 개발 서버 실행
npm run dev
```

---

## 앱 개요

| 항목 | 내용 |
|------|------|
| **앱명** | Spaingogo (스페인고고) |
| **목적** | 바르셀로나 맛집 관광 정보 + 호텔 기반 네비게이션 |
| **기술 스택** | Next.js 16+ App Router, TypeScript 5, Tailwind CSS 4, shadcn/ui |
| **특수 기능** | 호텔 기준 거리 표시, 호텔로 돌아가기 내비게이션 |

---

## 핵심 기능 (우선순위)

| 우선순위 | 기능 | 설명 |
|---------|------|------|
| **P0** | 맛집 목록 & 상세 | 카드 UI, 별점, 주소, 미슐랭 정보 |
| **P0** | 호텔 기준 거리 표시 | Haversine 공식, 도보 시간 계산 |
| **P1** | 카테고리 필터 | 타파스/파에야/핀초스/츄러스/하몬/해산물 |
| **P1** | 검색 기능 | 이름/주소/태그 |
| **P1** | 주변 맛집 탐색 | GPS 기반, 권한 거부 시 호텔 좌표 폴백 |
| **P2** | 북마크/즐겨찾기 | LocalStorage 기반 |
| **P2** | 호텔로 돌아가기 | Google Maps 링크 연동 |
| **P3** | AI 추천 | Anthropic Claude API |
| **P3** | 방문 일정 관리 | 캘린더 뷰 |

---

## 디렉토리 구조

```
src/
├── domain/                          # Domain Layer (순수 TypeScript)
│   ├── entities/
│   │   ├── Restaurant.ts
│   │   ├── Bookmark.ts
│   │   └── VisitSchedule.ts
│   ├── value-objects/
│   │   ├── Coordinates.ts           # 위도/경도 유효성 검증
│   │   ├── HotelCoordinate.ts       # 기준 호텔 상수 (41.3983, 2.1969)
│   │   ├── Distance.ts              # 미터/킬로미터, 도보 시간
│   │   ├── RestaurantCategory.ts    # 6개 카테고리
│   │   ├── Rating.ts
│   │   └── SearchQuery.ts
│   ├── services/
│   │   ├── DistanceCalculatorService.ts  # Haversine 공식
│   │   ├── RestaurantSearchService.ts
│   │   └── RankingService.ts
│   └── repositories/                # 포트 인터페이스
│       ├── IRestaurantRepository.ts
│       ├── IBookmarkRepository.ts
│       └── IScheduleRepository.ts
├── application/                     # Application Layer (유스케이스)
│   ├── use-cases/
│   │   ├── GetRestaurantListUseCase.ts
│   │   ├── GetRestaurantDetailUseCase.ts
│   │   ├── GetNearbyRestaurantsUseCase.ts
│   │   ├── GetHotelNavigationUseCase.ts   ← 핵심!
│   │   ├── ToggleBookmarkUseCase.ts
│   │   ├── GetBookmarksUseCase.ts
│   │   ├── GetRegionalRankingUseCase.ts
│   │   └── GetAiRecommendationUseCase.ts  # P3
│   ├── ports/
│   │   ├── IMapService.ts
│   │   ├── IAiService.ts
│   │   └── IGpsService.ts
│   └── dto/
│       ├── RestaurantDTO.ts
│       └── NavigationDTO.ts
├── infrastructure/                  # Infrastructure Layer (구현체)
│   ├── repositories/
│   │   ├── StaticRestaurantRepository.ts  # JSON 데이터
│   │   ├── LocalStorageBookmarkRepository.ts
│   │   └── LocalStorageScheduleRepository.ts
│   ├── adapters/
│   │   ├── GoogleMapsAdapter.ts     # NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 사용
│   │   └── BrowserGpsAdapter.ts
│   ├── data/
│   │   └── restaurants.json         # 바르셀로나 맛집 데이터 (20개+)
│   └── container.ts                 # DI 컨테이너
└── presentation/                    # Presentation Layer (Next.js)
    ├── app/
    │   ├── page.tsx                 # 홈 (인기 맛집, 지역 랭킹)
    │   ├── restaurants/
    │   │   ├── page.tsx             # 목록 페이지
    │   │   └── [id]/page.tsx        # 상세 페이지
    │   ├── nearby/page.tsx          # 주변 맛집
    │   ├── bookmarks/page.tsx       # 북마크
    │   └── schedule/page.tsx        # 일정 (P3)
    ├── components/
    │   ├── RestaurantCard.tsx        # 맛집 카드 + 거리 배지
    │   ├── HotelNavigationButton.tsx ← 핵심!
    │   ├── BookmarkButton.tsx
    │   ├── CategoryFilter.tsx
    │   ├── SearchBar.tsx
    │   └── DistanceBadge.tsx
    └── hooks/
        ├── useRestaurants.ts
        ├── useGps.ts
        ├── useBookmarks.ts
        └── useHotelNavigation.ts
```

---

## TDD 구현 순서 (Inside-Out)

### Phase 1: Domain Layer - Value Objects
```
Coordinates → Distance → RestaurantCategory → Rating → SearchQuery
```

### Phase 2: Domain Layer - Entities & Services
```
Restaurant Entity → DistanceCalculatorService (Haversine) → RestaurantSearchService
```

### Phase 3: Application Layer - Use Cases
```
GetRestaurantList → GetNearbyRestaurants → GetHotelNavigation → ToggleBookmark
```

### Phase 4: Infrastructure Layer
```
restaurants.json (데이터) → StaticRestaurantRepository → LocalStorageBookmarkRepository → GoogleMapsAdapter
```

### Phase 5: Presentation Layer
```
RestaurantCard → HotelNavigationButton → CategoryFilter → 페이지 조립
```

---

## 호텔 기반 핵심 기능 구현

### 거리 계산 (Haversine 공식)
```typescript
// src/domain/value-objects/HotelCoordinate.ts
export const HOTEL_COORDINATES = {
  lat: 41.3983,
  lng: 2.1969,
  name: 'Hotel & SPA Villa Olimpic@Suites',
  address: 'Carrer de Pallars, 121, 125, Sant Marti, 08018 Barcelona'
} as const;
```

### 호텔로 돌아가기 URL
```typescript
// Google Maps 도보 네비게이션
`https://www.google.com/maps/dir/?api=1&destination=41.3983,2.1969&travelmode=walking`
```

---

## 테스트 전략 요약

| 레이어 | 수량 | 커버리지 목표 |
|--------|------|-------------|
| Unit (Value Objects + Domain Services) | 35개 | 95%+ |
| Integration (Use Cases) | 20개 | 85%+ |
| Component (React) | 10개 | 70%+ |
| **합계** | **65개** | - |

---

## 환경 변수

| 변수명 | 설명 | 파일 |
|--------|------|------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API | `.env.local` ✅ |
| `ANTHROPIC_API_KEY` | AI 추천 기능 (P3) | `.env.local` (추후 추가) |

> ⚠️ `.env.local`은 `.gitignore`에 포함됨. 절대 커밋 금지.
> 팀 공유용 템플릿: `.env.example` 참조

---

## 스페인 테마 디자인

- **주색상**: 스페인 국기 빨강 `#C60B1E`
- **보조색상**: 스페인 국기 노랑 `#FFC400`
- **배경**: 따뜻한 화이트 `#FAFAF8`
- **폰트**: 세리프 계열 (Playfair Display 또는 Cormorant Garamond)

---

## 세부 플랜 파일

| 파일 | 내용 |
|------|------|
| `domain-analysis.md` | DDD 도메인 분석 (Bounded Context, Aggregate, Domain Events) |
| `architecture.md` | Clean Architecture 4레이어 설계 + 인터페이스 코드 |
| `tdd-strategy.md` | Red-Green-Refactor 사이클 + Given/When/Then 테스트 케이스 85개 |
| `implementation-checklist.md` | Phase별 체크박스 180개+ |

---

*Generated by TDD Clean Planner - 2026-02-25*
