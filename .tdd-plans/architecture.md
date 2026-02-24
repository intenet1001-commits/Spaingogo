# 아키텍처 설계: Spaingogo - 바르셀로나 맛집 관광 앱

## 개요

스페인 바르셀로나 맛집 관광 앱을 Clean Architecture 4레이어로 설계합니다.
Next.js App Router 환경에서 서버 컴포넌트와 클라이언트 컴포넌트를 명확히 분리하고,
의존성은 항상 Domain 방향(안쪽)으로만 흐릅니다.

**핵심 아키텍처 결정사항:**
- Domain/Application 레이어는 Next.js, React에 의존하지 않는 순수 TypeScript
- Infrastructure 레이어에서 Google Maps API, 외부 데이터소스 처리
- Presentation 레이어에서 Server Component(데이터 패칭) + Client Component(인터랙션) 분리
- 호텔 좌표(41.3983, 2.1969)는 Domain Value Object로 정의하여 전역 기준점 역할 수행

---

## 레이어 구조

```
src/
├── domain/                          # 1. Domain Layer (순수 비즈니스 규칙)
│   ├── entities/
│   │   ├── Restaurant.ts            # 맛집 Aggregate Root
│   │   ├── Bookmark.ts              # 북마크 Entity
│   │   ├── VisitSchedule.ts         # 방문 일정 Entity
│   │   └── Ranking.ts               # 랭킹 Entity
│   ├── value-objects/
│   │   ├── Coordinate.ts            # 좌표 (위도/경도)
│   │   ├── HotelCoordinate.ts       # 호텔 기준점 상수
│   │   ├── Distance.ts              # 거리 (미터/킬로미터)
│   │   ├── RestaurantCategory.ts    # 카테고리 열거형
│   │   ├── PriceRange.ts            # 가격대 값 객체
│   │   └── Rating.ts                # 평점 값 객체
│   ├── services/
│   │   ├── DistanceCalculatorService.ts   # 거리 계산 도메인 서비스
│   │   ├── RankingService.ts              # 랭킹 집계 도메인 서비스
│   │   └── RecommendationService.ts       # AI 추천 도메인 서비스 인터페이스
│   └── repositories/               # Repository Port 인터페이스
│       ├── IRestaurantRepository.ts
│       ├── IBookmarkRepository.ts
│       ├── IVisitScheduleRepository.ts
│       └── IRankingRepository.ts
│
├── application/                     # 2. Application Layer (유스케이스 조율)
│   ├── use-cases/
│   │   ├── get-restaurant-list/
│   │   │   ├── GetRestaurantListUseCase.ts
│   │   │   ├── GetRestaurantListInput.ts
│   │   │   └── GetRestaurantListOutput.ts
│   │   ├── get-restaurant-detail/
│   │   │   ├── GetRestaurantDetailUseCase.ts
│   │   │   ├── GetRestaurantDetailInput.ts
│   │   │   └── GetRestaurantDetailOutput.ts
│   │   ├── search-restaurants/
│   │   │   ├── SearchRestaurantsUseCase.ts
│   │   │   ├── SearchRestaurantsInput.ts
│   │   │   └── SearchRestaurantsOutput.ts
│   │   ├── get-nearby-restaurants/
│   │   │   ├── GetNearbyRestaurantsUseCase.ts
│   │   │   ├── GetNearbyRestaurantsInput.ts
│   │   │   └── GetNearbyRestaurantsOutput.ts
│   │   ├── get-hotel-navigation/
│   │   │   ├── GetHotelNavigationUseCase.ts
│   │   │   ├── GetHotelNavigationInput.ts
│   │   │   └── GetHotelNavigationOutput.ts
│   │   ├── get-regional-ranking/
│   │   │   ├── GetRegionalRankingUseCase.ts
│   │   │   ├── GetRegionalRankingInput.ts
│   │   │   └── GetRegionalRankingOutput.ts
│   │   ├── get-ai-recommendation/
│   │   │   ├── GetAiRecommendationUseCase.ts
│   │   │   ├── GetAiRecommendationInput.ts
│   │   │   └── GetAiRecommendationOutput.ts
│   │   ├── toggle-bookmark/
│   │   │   ├── ToggleBookmarkUseCase.ts
│   │   │   ├── ToggleBookmarkInput.ts
│   │   │   └── ToggleBookmarkOutput.ts
│   │   ├── get-bookmarks/
│   │   │   ├── GetBookmarksUseCase.ts
│   │   │   ├── GetBookmarksInput.ts
│   │   │   └── GetBookmarksOutput.ts
│   │   ├── add-visit-schedule/
│   │   │   ├── AddVisitScheduleUseCase.ts
│   │   │   ├── AddVisitScheduleInput.ts
│   │   │   └── AddVisitScheduleOutput.ts
│   │   └── get-visit-schedules/
│   │       ├── GetVisitSchedulesUseCase.ts
│   │       ├── GetVisitSchedulesInput.ts
│   │       └── GetVisitSchedulesOutput.ts
│   └── ports/                       # 외부 시스템 Port (Application 정의)
│       ├── IMapService.ts           # 지도/네비게이션 서비스 포트
│       ├── IAiService.ts            # AI 추천 서비스 포트
│       ├── IGpsService.ts           # GPS 위치 서비스 포트
│       └── ICacheService.ts         # 캐시 서비스 포트
│
├── infrastructure/                  # 3. Infrastructure Layer (외부 시스템 구현)
│   ├── repositories/
│   │   ├── StaticRestaurantRepository.ts   # 정적 JSON 데이터 기반
│   │   ├── LocalStorageBookmarkRepository.ts
│   │   ├── LocalStorageScheduleRepository.ts
│   │   └── StaticRankingRepository.ts
│   ├── adapters/
│   │   ├── GoogleMapsAdapter.ts     # Google Maps API 어댑터
│   │   ├── KakaoMapAdapter.ts       # Kakao Map API 어댑터 (대안)
│   │   ├── OpenAiAdapter.ts         # OpenAI API 어댑터 (AI 추천)
│   │   └── BrowserGpsAdapter.ts     # 브라우저 Geolocation API
│   ├── cache/
│   │   └── InMemoryCacheService.ts  # 인메모리 캐시
│   └── data/
│       └── restaurants.json         # 맛집 정적 데이터
│
└── presentation/                    # 4. Presentation Layer (Next.js UI)
    ├── app/                         # Next.js App Router
    │   ├── layout.tsx
    │   ├── page.tsx                 # 홈 (맛집 목록)
    │   ├── restaurants/
    │   │   └── [id]/
    │   │       └── page.tsx         # 맛집 상세
    │   ├── nearby/
    │   │   └── page.tsx             # 주변 맛집 탐색
    │   ├── ranking/
    │   │   └── page.tsx             # 지역별 랭킹
    │   ├── bookmarks/
    │   │   └── page.tsx             # 즐겨찾기
    │   ├── schedule/
    │   │   └── page.tsx             # 방문 일정
    │   └── api/
    │       ├── restaurants/
    │       │   └── route.ts         # REST API 엔드포인트
    │       ├── restaurants/[id]/
    │       │   └── route.ts
    │       ├── nearby/
    │       │   └── route.ts
    │       ├── ranking/
    │       │   └── route.ts
    │       └── ai-recommendation/
    │           └── route.ts
    ├── components/
    │   ├── restaurant/
    │   │   ├── RestaurantCard.tsx
    │   │   ├── RestaurantList.tsx
    │   │   ├── RestaurantDetail.tsx
    │   │   ├── RestaurantMap.tsx
    │   │   └── CategoryFilter.tsx
    │   ├── navigation/
    │   │   ├── HotelNavigationButton.tsx
    │   │   └── NearbyMap.tsx
    │   ├── ranking/
    │   │   └── RankingList.tsx
    │   ├── bookmark/
    │   │   ├── BookmarkButton.tsx
    │   │   └── BookmarkList.tsx
    │   ├── schedule/
    │   │   ├── ScheduleCard.tsx
    │   │   └── ScheduleCalendar.tsx
    │   └── shared/
    │       ├── SearchBar.tsx
    │       ├── DistanceBadge.tsx
    │       └── LoadingSpinner.tsx
    ├── hooks/
    │   ├── useRestaurants.ts
    │   ├── useNearbyRestaurants.ts
    │   ├── useBookmarks.ts
    │   ├── useVisitSchedule.ts
    │   ├── useGps.ts
    │   └── useHotelNavigation.ts
    ├── context/
    │   ├── BookmarkContext.tsx
    │   └── UserLocationContext.tsx
    └── di/
        └── container.ts             # 의존성 주입 컨테이너
```

---

## Domain Layer

### Value Objects

```typescript
// src/domain/value-objects/Coordinate.ts
export class Coordinate {
  private constructor(
    readonly latitude: number,
    readonly longitude: number
  ) {}

  static create(latitude: number, longitude: number): Coordinate {
    if (latitude < -90 || latitude > 90) {
      throw new Error(`Invalid latitude: ${latitude}`);
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error(`Invalid longitude: ${longitude}`);
    }
    return new Coordinate(latitude, longitude);
  }

  equals(other: Coordinate): boolean {
    return this.latitude === other.latitude && this.longitude === other.longitude;
  }

  toPlainObject(): { latitude: number; longitude: number } {
    return { latitude: this.latitude, longitude: this.longitude };
  }
}
```

```typescript
// src/domain/value-objects/HotelCoordinate.ts
import { Coordinate } from './Coordinate';

// 호텔 기준점: Hotel & SPA Villa Olimpic@Suites, Barcelona
// Carrer de Pallars, 121, 125, Sant Marti, 08018 Barcelona
export const HOTEL_COORDINATE = Coordinate.create(41.3983, 2.1969);
export const HOTEL_NAME = 'Hotel & SPA Villa Olimpic@Suites';
export const HOTEL_ADDRESS = 'Carrer de Pallars, 121, 125, Sant Marti, 08018 Barcelona';
```

```typescript
// src/domain/value-objects/Distance.ts
export class Distance {
  private constructor(readonly meters: number) {}

  static fromMeters(meters: number): Distance {
    if (meters < 0) throw new Error('Distance cannot be negative');
    return new Distance(meters);
  }

  get kilometers(): number {
    return this.meters / 1000;
  }

  get displayText(): string {
    if (this.meters < 1000) {
      return `${Math.round(this.meters)}m`;
    }
    return `${this.kilometers.toFixed(1)}km`;
  }

  isWithin(maxMeters: number): boolean {
    return this.meters <= maxMeters;
  }
}
```

```typescript
// src/domain/value-objects/RestaurantCategory.ts
export enum RestaurantCategory {
  TAPAS = 'TAPAS',
  SEAFOOD = 'SEAFOOD',
  PAELLA = 'PAELLA',
  CATALAN = 'CATALAN',
  ITALIAN = 'ITALIAN',
  ASIAN = 'ASIAN',
  CAFE = 'CAFE',
  BAKERY = 'BAKERY',
  COCKTAIL_BAR = 'COCKTAIL_BAR',
  FINE_DINING = 'FINE_DINING',
}

export const CATEGORY_LABELS: Record<RestaurantCategory, string> = {
  [RestaurantCategory.TAPAS]: '타파스',
  [RestaurantCategory.SEAFOOD]: '해산물',
  [RestaurantCategory.PAELLA]: '빠에야',
  [RestaurantCategory.CATALAN]: '카탈루냐 요리',
  [RestaurantCategory.ITALIAN]: '이탈리안',
  [RestaurantCategory.ASIAN]: '아시안',
  [RestaurantCategory.CAFE]: '카페',
  [RestaurantCategory.BAKERY]: '베이커리',
  [RestaurantCategory.COCKTAIL_BAR]: '칵테일 바',
  [RestaurantCategory.FINE_DINING]: '파인 다이닝',
};
```

```typescript
// src/domain/value-objects/Rating.ts
export class Rating {
  private constructor(readonly value: number) {}

  static create(value: number): Rating {
    if (value < 0 || value > 5) {
      throw new Error(`Rating must be between 0 and 5, got: ${value}`);
    }
    return new Rating(Math.round(value * 10) / 10);
  }

  get stars(): number {
    return Math.round(this.value);
  }

  get displayText(): string {
    return `${this.value.toFixed(1)} / 5.0`;
  }
}
```

```typescript
// src/domain/value-objects/PriceRange.ts
export enum PriceLevel {
  BUDGET = 1,     // €  (10€ 미만)
  MODERATE = 2,   // €€ (10~25€)
  EXPENSIVE = 3,  // €€€ (25~50€)
  LUXURY = 4,     // €€€€ (50€ 이상)
}

export class PriceRange {
  private constructor(readonly level: PriceLevel) {}

  static create(level: PriceLevel): PriceRange {
    return new PriceRange(level);
  }

  get symbol(): string {
    return '€'.repeat(this.level);
  }

  get description(): string {
    const map: Record<PriceLevel, string> = {
      [PriceLevel.BUDGET]: '저렴 (€10 미만)',
      [PriceLevel.MODERATE]: '보통 (€10-25)',
      [PriceLevel.EXPENSIVE]: '비싼 편 (€25-50)',
      [PriceLevel.LUXURY]: '고급 (€50+)',
    };
    return map[this.level];
  }
}
```

---

### Domain Entities

```typescript
// src/domain/entities/Restaurant.ts
import { Coordinate } from '../value-objects/Coordinate';
import { Distance } from '../value-objects/Distance';
import { Rating } from '../value-objects/Rating';
import { PriceRange } from '../value-objects/PriceRange';
import { RestaurantCategory } from '../value-objects/RestaurantCategory';

export interface RestaurantProps {
  id: string;
  name: string;
  nameKorean?: string;         // 한국어 이름 (있는 경우)
  description: string;
  descriptionKorean?: string;  // 한국어 설명
  category: RestaurantCategory;
  coordinate: Coordinate;
  address: string;
  rating: Rating;
  priceRange: PriceRange;
  openingHours: OpeningHours;
  phoneNumber?: string;
  website?: string;
  imageUrls: string[];
  tags: string[];
  distanceFromHotel?: Distance; // 호텔까지 거리 (계산 후 설정)
  mustTryDishes: string[];      // 추천 메뉴
}

export interface OpeningHours {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
}

export class Restaurant {
  private constructor(private readonly props: RestaurantProps) {}

  static create(props: RestaurantProps): Restaurant {
    if (!props.id) throw new Error('Restaurant id is required');
    if (!props.name) throw new Error('Restaurant name is required');
    if (props.imageUrls.length === 0) {
      throw new Error('Restaurant must have at least one image');
    }
    return new Restaurant(props);
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get nameKorean(): string | undefined { return this.props.nameKorean; }
  get description(): string { return this.props.description; }
  get descriptionKorean(): string | undefined { return this.props.descriptionKorean; }
  get category(): RestaurantCategory { return this.props.category; }
  get coordinate(): Coordinate { return this.props.coordinate; }
  get address(): string { return this.props.address; }
  get rating(): Rating { return this.props.rating; }
  get priceRange(): PriceRange { return this.props.priceRange; }
  get openingHours(): OpeningHours { return this.props.openingHours; }
  get phoneNumber(): string | undefined { return this.props.phoneNumber; }
  get website(): string | undefined { return this.props.website; }
  get imageUrls(): string[] { return [...this.props.imageUrls]; }
  get tags(): string[] { return [...this.props.tags]; }
  get distanceFromHotel(): Distance | undefined { return this.props.distanceFromHotel; }
  get mustTryDishes(): string[] { return [...this.props.mustTryDishes]; }

  withDistance(distance: Distance): Restaurant {
    return new Restaurant({ ...this.props, distanceFromHotel: distance });
  }

  isInCategory(category: RestaurantCategory): boolean {
    return this.props.category === category;
  }

  matchesSearch(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return (
      this.props.name.toLowerCase().includes(lowerQuery) ||
      (this.props.nameKorean?.toLowerCase().includes(lowerQuery) ?? false) ||
      this.props.description.toLowerCase().includes(lowerQuery) ||
      this.props.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }
}
```

```typescript
// src/domain/entities/Bookmark.ts
export class Bookmark {
  private constructor(
    readonly id: string,
    readonly restaurantId: string,
    readonly userId: string,
    readonly createdAt: Date,
    readonly note?: string
  ) {}

  static create(restaurantId: string, userId: string, note?: string): Bookmark {
    return new Bookmark(
      `${userId}_${restaurantId}`,
      restaurantId,
      userId,
      new Date(),
      note
    );
  }
}
```

```typescript
// src/domain/entities/VisitSchedule.ts
export class VisitSchedule {
  private constructor(
    readonly id: string,
    readonly restaurantId: string,
    readonly userId: string,
    readonly scheduledDate: Date,
    readonly partySize: number,
    readonly note?: string,
    readonly isVisited: boolean = false
  ) {}

  static create(props: {
    restaurantId: string;
    userId: string;
    scheduledDate: Date;
    partySize: number;
    note?: string;
  }): VisitSchedule {
    if (props.partySize < 1) {
      throw new Error('Party size must be at least 1');
    }
    const id = `schedule_${Date.now()}_${props.restaurantId}`;
    return new VisitSchedule(
      id,
      props.restaurantId,
      props.userId,
      props.scheduledDate,
      props.partySize,
      props.note,
      false
    );
  }

  markAsVisited(): VisitSchedule {
    return new VisitSchedule(
      this.id,
      this.restaurantId,
      this.userId,
      this.scheduledDate,
      this.partySize,
      this.note,
      true
    );
  }
}
```

---

### Domain Services

```typescript
// src/domain/services/DistanceCalculatorService.ts
import { Coordinate } from '../value-objects/Coordinate';
import { Distance } from '../value-objects/Distance';

// Haversine 공식을 사용한 순수 도메인 서비스 (외부 의존성 없음)
export class DistanceCalculatorService {
  private static readonly EARTH_RADIUS_METERS = 6_371_000;

  calculateDistance(from: Coordinate, to: Coordinate): Distance {
    const lat1 = this.toRadians(from.latitude);
    const lat2 = this.toRadians(to.latitude);
    const deltaLat = this.toRadians(to.latitude - from.latitude);
    const deltaLon = this.toRadians(to.longitude - from.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const meters = DistanceCalculatorService.EARTH_RADIUS_METERS * c;

    return Distance.fromMeters(meters);
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

```typescript
// src/domain/services/RankingService.ts
import { Restaurant } from '../entities/Restaurant';

export interface RankedRestaurant {
  restaurant: Restaurant;
  rank: number;
  score: number;
}

export class RankingService {
  // 평점 + 리뷰 수 + 거리 역수를 가중 합산하여 점수 계산
  rankRestaurants(restaurants: Restaurant[]): RankedRestaurant[] {
    const scored = restaurants.map(r => ({
      restaurant: r,
      score: this.calculateScore(r),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  private calculateScore(restaurant: Restaurant): number {
    const ratingScore = restaurant.rating.value * 20; // 0-100
    const distancePenalty = restaurant.distanceFromHotel
      ? Math.min(restaurant.distanceFromHotel.kilometers * 2, 30)
      : 0;
    return ratingScore - distancePenalty;
  }
}
```

---

### Repository Port Interfaces

```typescript
// src/domain/repositories/IRestaurantRepository.ts
import { Restaurant } from '../entities/Restaurant';
import { RestaurantCategory } from '../value-objects/RestaurantCategory';
import { Coordinate } from '../value-objects/Coordinate';

export interface RestaurantFilter {
  category?: RestaurantCategory;
  searchQuery?: string;
  maxDistanceMeters?: number;
  priceLevel?: number;
  minRating?: number;
}

export interface IRestaurantRepository {
  findAll(filter?: RestaurantFilter): Promise<Restaurant[]>;
  findById(id: string): Promise<Restaurant | null>;
  findNearby(center: Coordinate, radiusMeters: number): Promise<Restaurant[]>;
  findByCategory(category: RestaurantCategory): Promise<Restaurant[]>;
  search(query: string): Promise<Restaurant[]>;
}
```

```typescript
// src/domain/repositories/IBookmarkRepository.ts
import { Bookmark } from '../entities/Bookmark';

export interface IBookmarkRepository {
  findByUserId(userId: string): Promise<Bookmark[]>;
  findByRestaurantAndUser(restaurantId: string, userId: string): Promise<Bookmark | null>;
  save(bookmark: Bookmark): Promise<void>;
  delete(bookmarkId: string): Promise<void>;
  existsByRestaurantAndUser(restaurantId: string, userId: string): Promise<boolean>;
}
```

```typescript
// src/domain/repositories/IVisitScheduleRepository.ts
import { VisitSchedule } from '../entities/VisitSchedule';

export interface IVisitScheduleRepository {
  findByUserId(userId: string): Promise<VisitSchedule[]>;
  findById(id: string): Promise<VisitSchedule | null>;
  save(schedule: VisitSchedule): Promise<void>;
  delete(scheduleId: string): Promise<void>;
  findUpcoming(userId: string, fromDate: Date): Promise<VisitSchedule[]>;
}
```

---

## Application Layer

### Application Ports

```typescript
// src/application/ports/IMapService.ts
import { Coordinate } from '../../domain/value-objects/Coordinate';

export interface NavigationUrl {
  googleMapsUrl: string;
  appleMapsUrl?: string;
  wazeUrl?: string;
}

export interface IMapService {
  getNavigationUrl(from: Coordinate, to: Coordinate): NavigationUrl;
  getStaticMapUrl(center: Coordinate, markers: Coordinate[], zoom: number): string;
  getHotelNavigationUrl(from: Coordinate): NavigationUrl;
}
```

```typescript
// src/application/ports/IAiService.ts
import { Restaurant } from '../../domain/entities/Restaurant';
import { RestaurantCategory } from '../../domain/value-objects/RestaurantCategory';

export interface UserPreference {
  preferredCategories: RestaurantCategory[];
  budgetLevel?: number;
  excludeVisited?: boolean;
  groupSize?: number;
}

export interface AiRecommendationResult {
  restaurants: Restaurant[];
  reasoning: string;
  confidence: number;
}

export interface IAiService {
  recommend(
    allRestaurants: Restaurant[],
    userPreference: UserPreference,
    visitedRestaurantIds: string[]
  ): Promise<AiRecommendationResult>;
}
```

```typescript
// src/application/ports/IGpsService.ts
import { Coordinate } from '../../domain/value-objects/Coordinate';

export interface GpsPosition {
  coordinate: Coordinate;
  accuracy: number; // meters
  timestamp: Date;
}

export interface IGpsService {
  getCurrentPosition(): Promise<GpsPosition>;
  watchPosition(callback: (position: GpsPosition) => void): () => void; // returns unsubscribe fn
}
```

```typescript
// src/application/ports/ICacheService.ts
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

---

### Use Cases

```typescript
// src/application/use-cases/get-restaurant-list/GetRestaurantListInput.ts
import { RestaurantCategory } from '../../../domain/value-objects/RestaurantCategory';

export interface GetRestaurantListInput {
  category?: RestaurantCategory;
  searchQuery?: string;
  maxDistanceMeters?: number;
  minRating?: number;
  priceLevel?: number;
  sortBy?: 'distance' | 'rating' | 'name';
  page?: number;
  pageSize?: number;
}
```

```typescript
// src/application/use-cases/get-restaurant-list/GetRestaurantListOutput.ts
import { RestaurantCategory } from '../../../domain/value-objects/RestaurantCategory';
import { PriceLevel } from '../../../domain/value-objects/PriceRange';

export interface RestaurantSummaryDto {
  id: string;
  name: string;
  nameKorean?: string;
  category: RestaurantCategory;
  categoryLabel: string;
  rating: number;
  ratingDisplay: string;
  priceLevel: PriceLevel;
  priceSymbol: string;
  distanceFromHotelMeters?: number;
  distanceDisplay?: string;
  thumbnailUrl: string;
  tags: string[];
  isBookmarked: boolean;
}

export interface GetRestaurantListOutput {
  restaurants: RestaurantSummaryDto[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}
```

```typescript
// src/application/use-cases/get-restaurant-list/GetRestaurantListUseCase.ts
import { IRestaurantRepository } from '../../../domain/repositories/IRestaurantRepository';
import { IBookmarkRepository } from '../../../domain/repositories/IBookmarkRepository';
import { DistanceCalculatorService } from '../../../domain/services/DistanceCalculatorService';
import { HOTEL_COORDINATE } from '../../../domain/value-objects/HotelCoordinate';
import { CATEGORY_LABELS } from '../../../domain/value-objects/RestaurantCategory';
import { GetRestaurantListInput } from './GetRestaurantListInput';
import { GetRestaurantListOutput, RestaurantSummaryDto } from './GetRestaurantListOutput';
import { Restaurant } from '../../../domain/entities/Restaurant';

export class GetRestaurantListUseCase {
  constructor(
    private readonly restaurantRepo: IRestaurantRepository,
    private readonly bookmarkRepo: IBookmarkRepository,
    private readonly distanceCalc: DistanceCalculatorService
  ) {}

  async execute(
    input: GetRestaurantListInput,
    userId: string
  ): Promise<GetRestaurantListOutput> {
    // 1. 맛집 목록 조회 (필터 적용)
    const restaurants = await this.restaurantRepo.findAll({
      category: input.category,
      searchQuery: input.searchQuery,
      maxDistanceMeters: input.maxDistanceMeters,
      minRating: input.minRating,
      priceLevel: input.priceLevel,
    });

    // 2. 호텔까지 거리 계산 적용
    const withDistance = restaurants.map(r =>
      r.withDistance(this.distanceCalc.calculateDistance(r.coordinate, HOTEL_COORDINATE))
    );

    // 3. 정렬
    const sorted = this.sortRestaurants(withDistance, input.sortBy ?? 'distance');

    // 4. 북마크 상태 조회
    const bookmarks = await this.bookmarkRepo.findByUserId(userId);
    const bookmarkedIds = new Set(bookmarks.map(b => b.restaurantId));

    // 5. 페이지네이션
    const page = input.page ?? 1;
    const pageSize = input.pageSize ?? 20;
    const startIndex = (page - 1) * pageSize;
    const paginated = sorted.slice(startIndex, startIndex + pageSize);

    // 6. DTO 변환
    return {
      restaurants: paginated.map(r => this.toDto(r, bookmarkedIds.has(r.id))),
      total: sorted.length,
      page,
      pageSize,
      hasNextPage: startIndex + pageSize < sorted.length,
    };
  }

  private sortRestaurants(
    restaurants: Restaurant[],
    sortBy: 'distance' | 'rating' | 'name'
  ): Restaurant[] {
    return [...restaurants].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distanceFromHotel?.meters ?? Infinity) -
                 (b.distanceFromHotel?.meters ?? Infinity);
        case 'rating':
          return b.rating.value - a.rating.value;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  private toDto(restaurant: Restaurant, isBookmarked: boolean): RestaurantSummaryDto {
    return {
      id: restaurant.id,
      name: restaurant.name,
      nameKorean: restaurant.nameKorean,
      category: restaurant.category,
      categoryLabel: CATEGORY_LABELS[restaurant.category],
      rating: restaurant.rating.value,
      ratingDisplay: restaurant.rating.displayText,
      priceLevel: restaurant.priceRange.level,
      priceSymbol: restaurant.priceRange.symbol,
      distanceFromHotelMeters: restaurant.distanceFromHotel?.meters,
      distanceDisplay: restaurant.distanceFromHotel?.displayText,
      thumbnailUrl: restaurant.imageUrls[0],
      tags: restaurant.tags,
      isBookmarked,
    };
  }
}
```

```typescript
// src/application/use-cases/get-restaurant-detail/GetRestaurantDetailInput.ts
export interface GetRestaurantDetailInput {
  restaurantId: string;
}
```

```typescript
// src/application/use-cases/get-restaurant-detail/GetRestaurantDetailOutput.ts
import { RestaurantCategory } from '../../../domain/value-objects/RestaurantCategory';
import { PriceLevel } from '../../../domain/value-objects/PriceRange';
import { OpeningHours } from '../../../domain/entities/Restaurant';
import { NavigationUrl } from '../../ports/IMapService';

export interface RestaurantDetailDto {
  id: string;
  name: string;
  nameKorean?: string;
  description: string;
  descriptionKorean?: string;
  category: RestaurantCategory;
  categoryLabel: string;
  coordinate: { latitude: number; longitude: number };
  address: string;
  rating: number;
  ratingDisplay: string;
  priceLevel: PriceLevel;
  priceSymbol: string;
  priceDescription: string;
  openingHours: OpeningHours;
  phoneNumber?: string;
  website?: string;
  imageUrls: string[];
  tags: string[];
  mustTryDishes: string[];
  distanceFromHotelMeters?: number;
  distanceDisplay?: string;
  navigationToHotel: NavigationUrl;
  isBookmarked: boolean;
  staticMapUrl: string;
}

export type GetRestaurantDetailOutput =
  | { found: true; restaurant: RestaurantDetailDto }
  | { found: false };
```

```typescript
// src/application/use-cases/get-restaurant-detail/GetRestaurantDetailUseCase.ts
import { IRestaurantRepository } from '../../../domain/repositories/IRestaurantRepository';
import { IBookmarkRepository } from '../../../domain/repositories/IBookmarkRepository';
import { IMapService } from '../../ports/IMapService';
import { DistanceCalculatorService } from '../../../domain/services/DistanceCalculatorService';
import { HOTEL_COORDINATE } from '../../../domain/value-objects/HotelCoordinate';
import { CATEGORY_LABELS } from '../../../domain/value-objects/RestaurantCategory';
import { GetRestaurantDetailInput } from './GetRestaurantDetailInput';
import { GetRestaurantDetailOutput } from './GetRestaurantDetailOutput';

export class GetRestaurantDetailUseCase {
  constructor(
    private readonly restaurantRepo: IRestaurantRepository,
    private readonly bookmarkRepo: IBookmarkRepository,
    private readonly mapService: IMapService,
    private readonly distanceCalc: DistanceCalculatorService
  ) {}

  async execute(
    input: GetRestaurantDetailInput,
    userId: string
  ): Promise<GetRestaurantDetailOutput> {
    // 1. 맛집 조회
    const restaurant = await this.restaurantRepo.findById(input.restaurantId);
    if (!restaurant) return { found: false };

    // 2. 거리 계산
    const distance = this.distanceCalc.calculateDistance(
      restaurant.coordinate,
      HOTEL_COORDINATE
    );
    const restaurantWithDistance = restaurant.withDistance(distance);

    // 3. 북마크 상태 조회
    const isBookmarked = await this.bookmarkRepo.existsByRestaurantAndUser(
      restaurant.id,
      userId
    );

    // 4. 호텔 네비게이션 URL 생성
    const navigationToHotel = this.mapService.getHotelNavigationUrl(
      restaurant.coordinate
    );

    // 5. 정적 지도 URL 생성
    const staticMapUrl = this.mapService.getStaticMapUrl(
      restaurant.coordinate,
      [restaurant.coordinate, HOTEL_COORDINATE],
      15
    );

    return {
      found: true,
      restaurant: {
        id: restaurantWithDistance.id,
        name: restaurantWithDistance.name,
        nameKorean: restaurantWithDistance.nameKorean,
        description: restaurantWithDistance.description,
        descriptionKorean: restaurantWithDistance.descriptionKorean,
        category: restaurantWithDistance.category,
        categoryLabel: CATEGORY_LABELS[restaurantWithDistance.category],
        coordinate: restaurantWithDistance.coordinate.toPlainObject(),
        address: restaurantWithDistance.address,
        rating: restaurantWithDistance.rating.value,
        ratingDisplay: restaurantWithDistance.rating.displayText,
        priceLevel: restaurantWithDistance.priceRange.level,
        priceSymbol: restaurantWithDistance.priceRange.symbol,
        priceDescription: restaurantWithDistance.priceRange.description,
        openingHours: restaurantWithDistance.openingHours,
        phoneNumber: restaurantWithDistance.phoneNumber,
        website: restaurantWithDistance.website,
        imageUrls: restaurantWithDistance.imageUrls,
        tags: restaurantWithDistance.tags,
        mustTryDishes: restaurantWithDistance.mustTryDishes,
        distanceFromHotelMeters: restaurantWithDistance.distanceFromHotel?.meters,
        distanceDisplay: restaurantWithDistance.distanceFromHotel?.displayText,
        navigationToHotel,
        isBookmarked,
        staticMapUrl,
      },
    };
  }
}
```

```typescript
// src/application/use-cases/get-nearby-restaurants/GetNearbyRestaurantsInput.ts
export interface GetNearbyRestaurantsInput {
  userLatitude: number;
  userLongitude: number;
  radiusMeters?: number; // 기본값: 1000m
}
```

```typescript
// src/application/use-cases/get-nearby-restaurants/GetNearbyRestaurantsOutput.ts
import { RestaurantSummaryDto } from '../get-restaurant-list/GetRestaurantListOutput';

export interface NearbyRestaurantDto extends RestaurantSummaryDto {
  distanceFromUserMeters: number;
  distanceFromUserDisplay: string;
}

export interface GetNearbyRestaurantsOutput {
  restaurants: NearbyRestaurantDto[];
  userLocation: { latitude: number; longitude: number };
  radiusMeters: number;
}
```

```typescript
// src/application/use-cases/get-nearby-restaurants/GetNearbyRestaurantsUseCase.ts
import { IRestaurantRepository } from '../../../domain/repositories/IRestaurantRepository';
import { IBookmarkRepository } from '../../../domain/repositories/IBookmarkRepository';
import { DistanceCalculatorService } from '../../../domain/services/DistanceCalculatorService';
import { Coordinate } from '../../../domain/value-objects/Coordinate';
import { HOTEL_COORDINATE } from '../../../domain/value-objects/HotelCoordinate';
import { CATEGORY_LABELS } from '../../../domain/value-objects/RestaurantCategory';
import { GetNearbyRestaurantsInput } from './GetNearbyRestaurantsInput';
import { GetNearbyRestaurantsOutput, NearbyRestaurantDto } from './GetNearbyRestaurantsOutput';

export class GetNearbyRestaurantsUseCase {
  private static readonly DEFAULT_RADIUS_METERS = 1000;

  constructor(
    private readonly restaurantRepo: IRestaurantRepository,
    private readonly bookmarkRepo: IBookmarkRepository,
    private readonly distanceCalc: DistanceCalculatorService
  ) {}

  async execute(
    input: GetNearbyRestaurantsInput,
    userId: string
  ): Promise<GetNearbyRestaurantsOutput> {
    const userCoordinate = Coordinate.create(input.userLatitude, input.userLongitude);
    const radius = input.radiusMeters ?? GetNearbyRestaurantsUseCase.DEFAULT_RADIUS_METERS;

    // 1. 반경 내 맛집 조회
    const nearbyRestaurants = await this.restaurantRepo.findNearby(userCoordinate, radius);

    // 2. 사용자 거리 + 호텔 거리 계산
    const withDistances = nearbyRestaurants.map(r => ({
      restaurant: r.withDistance(
        this.distanceCalc.calculateDistance(r.coordinate, HOTEL_COORDINATE)
      ),
      distanceFromUser: this.distanceCalc.calculateDistance(r.coordinate, userCoordinate),
    }));

    // 3. 사용자로부터 가까운 순 정렬
    withDistances.sort((a, b) => a.distanceFromUser.meters - b.distanceFromUser.meters);

    // 4. 북마크 상태
    const bookmarks = await this.bookmarkRepo.findByUserId(userId);
    const bookmarkedIds = new Set(bookmarks.map(b => b.restaurantId));

    // 5. DTO 변환
    const restaurants: NearbyRestaurantDto[] = withDistances.map(({ restaurant, distanceFromUser }) => ({
      id: restaurant.id,
      name: restaurant.name,
      nameKorean: restaurant.nameKorean,
      category: restaurant.category,
      categoryLabel: CATEGORY_LABELS[restaurant.category],
      rating: restaurant.rating.value,
      ratingDisplay: restaurant.rating.displayText,
      priceLevel: restaurant.priceRange.level,
      priceSymbol: restaurant.priceRange.symbol,
      distanceFromHotelMeters: restaurant.distanceFromHotel?.meters,
      distanceDisplay: restaurant.distanceFromHotel?.displayText,
      thumbnailUrl: restaurant.imageUrls[0],
      tags: restaurant.tags,
      isBookmarked: bookmarkedIds.has(restaurant.id),
      distanceFromUserMeters: distanceFromUser.meters,
      distanceFromUserDisplay: distanceFromUser.displayText,
    }));

    return {
      restaurants,
      userLocation: userCoordinate.toPlainObject(),
      radiusMeters: radius,
    };
  }
}
```

```typescript
// src/application/use-cases/get-hotel-navigation/GetHotelNavigationInput.ts
export interface GetHotelNavigationInput {
  fromLatitude: number;
  fromLongitude: number;
}
```

```typescript
// src/application/use-cases/get-hotel-navigation/GetHotelNavigationOutput.ts
import { NavigationUrl } from '../../ports/IMapService';

export interface GetHotelNavigationOutput {
  hotelName: string;
  hotelAddress: string;
  hotelCoordinate: { latitude: number; longitude: number };
  navigationUrls: NavigationUrl;
  distanceFromCurrentLocation: string;
  estimatedWalkingMinutes: number;
}
```

```typescript
// src/application/use-cases/get-hotel-navigation/GetHotelNavigationUseCase.ts
import { IMapService } from '../../ports/IMapService';
import { DistanceCalculatorService } from '../../../domain/services/DistanceCalculatorService';
import { Coordinate } from '../../../domain/value-objects/Coordinate';
import {
  HOTEL_COORDINATE,
  HOTEL_NAME,
  HOTEL_ADDRESS
} from '../../../domain/value-objects/HotelCoordinate';
import { GetHotelNavigationInput } from './GetHotelNavigationInput';
import { GetHotelNavigationOutput } from './GetHotelNavigationOutput';

export class GetHotelNavigationUseCase {
  private static readonly WALKING_SPEED_METERS_PER_MINUTE = 80;

  constructor(
    private readonly mapService: IMapService,
    private readonly distanceCalc: DistanceCalculatorService
  ) {}

  execute(input: GetHotelNavigationInput): GetHotelNavigationOutput {
    const currentCoordinate = Coordinate.create(input.fromLatitude, input.fromLongitude);
    const distance = this.distanceCalc.calculateDistance(currentCoordinate, HOTEL_COORDINATE);
    const navigationUrls = this.mapService.getHotelNavigationUrl(currentCoordinate);

    const estimatedWalkingMinutes = Math.ceil(
      distance.meters / GetHotelNavigationUseCase.WALKING_SPEED_METERS_PER_MINUTE
    );

    return {
      hotelName: HOTEL_NAME,
      hotelAddress: HOTEL_ADDRESS,
      hotelCoordinate: HOTEL_COORDINATE.toPlainObject(),
      navigationUrls,
      distanceFromCurrentLocation: distance.displayText,
      estimatedWalkingMinutes,
    };
  }
}
```

```typescript
// src/application/use-cases/toggle-bookmark/ToggleBookmarkInput.ts
export interface ToggleBookmarkInput {
  restaurantId: string;
  userId: string;
  note?: string;
}
```

```typescript
// src/application/use-cases/toggle-bookmark/ToggleBookmarkOutput.ts
export interface ToggleBookmarkOutput {
  isBookmarked: boolean;
  restaurantId: string;
}
```

```typescript
// src/application/use-cases/toggle-bookmark/ToggleBookmarkUseCase.ts
import { IBookmarkRepository } from '../../../domain/repositories/IBookmarkRepository';
import { Bookmark } from '../../../domain/entities/Bookmark';
import { ToggleBookmarkInput } from './ToggleBookmarkInput';
import { ToggleBookmarkOutput } from './ToggleBookmarkOutput';

export class ToggleBookmarkUseCase {
  constructor(private readonly bookmarkRepo: IBookmarkRepository) {}

  async execute(input: ToggleBookmarkInput): Promise<ToggleBookmarkOutput> {
    const existing = await this.bookmarkRepo.findByRestaurantAndUser(
      input.restaurantId,
      input.userId
    );

    if (existing) {
      // 이미 북마크 → 제거
      await this.bookmarkRepo.delete(existing.id);
      return { isBookmarked: false, restaurantId: input.restaurantId };
    } else {
      // 북마크 추가
      const bookmark = Bookmark.create(input.restaurantId, input.userId, input.note);
      await this.bookmarkRepo.save(bookmark);
      return { isBookmarked: true, restaurantId: input.restaurantId };
    }
  }
}
```

```typescript
// src/application/use-cases/add-visit-schedule/AddVisitScheduleInput.ts
export interface AddVisitScheduleInput {
  restaurantId: string;
  userId: string;
  scheduledDate: string; // ISO 8601 형식
  partySize: number;
  note?: string;
}
```

```typescript
// src/application/use-cases/add-visit-schedule/AddVisitScheduleOutput.ts
export interface AddVisitScheduleOutput {
  scheduleId: string;
  restaurantId: string;
  scheduledDate: string;
  partySize: number;
  note?: string;
}
```

```typescript
// src/application/use-cases/add-visit-schedule/AddVisitScheduleUseCase.ts
import { IVisitScheduleRepository } from '../../../domain/repositories/IVisitScheduleRepository';
import { IRestaurantRepository } from '../../../domain/repositories/IRestaurantRepository';
import { VisitSchedule } from '../../../domain/entities/VisitSchedule';
import { AddVisitScheduleInput } from './AddVisitScheduleInput';
import { AddVisitScheduleOutput } from './AddVisitScheduleOutput';

export class AddVisitScheduleUseCase {
  constructor(
    private readonly scheduleRepo: IVisitScheduleRepository,
    private readonly restaurantRepo: IRestaurantRepository
  ) {}

  async execute(input: AddVisitScheduleInput): Promise<AddVisitScheduleOutput> {
    // 1. 맛집 존재 확인
    const restaurant = await this.restaurantRepo.findById(input.restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurant not found: ${input.restaurantId}`);
    }

    // 2. 일정 생성 (도메인 유효성 검증 포함)
    const schedule = VisitSchedule.create({
      restaurantId: input.restaurantId,
      userId: input.userId,
      scheduledDate: new Date(input.scheduledDate),
      partySize: input.partySize,
      note: input.note,
    });

    // 3. 저장
    await this.scheduleRepo.save(schedule);

    return {
      scheduleId: schedule.id,
      restaurantId: schedule.restaurantId,
      scheduledDate: schedule.scheduledDate.toISOString(),
      partySize: schedule.partySize,
      note: schedule.note,
    };
  }
}
```

---

### Use Case 요약표

| 유스케이스 | Input DTO | Output DTO | 사용 Repository | 사용 Port |
|-----------|-----------|-----------|----------------|----------|
| GetRestaurantList | GetRestaurantListInput | GetRestaurantListOutput | IRestaurantRepository, IBookmarkRepository | - |
| GetRestaurantDetail | GetRestaurantDetailInput | GetRestaurantDetailOutput | IRestaurantRepository, IBookmarkRepository | IMapService |
| SearchRestaurants | SearchRestaurantsInput | GetRestaurantListOutput | IRestaurantRepository | - |
| GetNearbyRestaurants | GetNearbyRestaurantsInput | GetNearbyRestaurantsOutput | IRestaurantRepository, IBookmarkRepository | - |
| GetHotelNavigation | GetHotelNavigationInput | GetHotelNavigationOutput | - | IMapService |
| GetRegionalRanking | GetRegionalRankingInput | GetRegionalRankingOutput | IRestaurantRepository, IRankingRepository | - |
| GetAiRecommendation | GetAiRecommendationInput | GetAiRecommendationOutput | IRestaurantRepository, IBookmarkRepository | IAiService |
| ToggleBookmark | ToggleBookmarkInput | ToggleBookmarkOutput | IBookmarkRepository | - |
| GetBookmarks | GetBookmarksInput | GetBookmarksOutput | IBookmarkRepository, IRestaurantRepository | - |
| AddVisitSchedule | AddVisitScheduleInput | AddVisitScheduleOutput | IVisitScheduleRepository, IRestaurantRepository | - |
| GetVisitSchedules | GetVisitSchedulesInput | GetVisitSchedulesOutput | IVisitScheduleRepository, IRestaurantRepository | - |

---

## Infrastructure Layer

### Repository Implementations

```typescript
// src/infrastructure/repositories/StaticRestaurantRepository.ts
import { IRestaurantRepository, RestaurantFilter } from '../../domain/repositories/IRestaurantRepository';
import { Restaurant } from '../../domain/entities/Restaurant';
import { RestaurantCategory } from '../../domain/value-objects/RestaurantCategory';
import { Coordinate } from '../../domain/value-objects/Coordinate';
import { Rating } from '../../domain/value-objects/Rating';
import { PriceRange, PriceLevel } from '../../domain/value-objects/PriceRange';
import { DistanceCalculatorService } from '../../domain/services/DistanceCalculatorService';
import restaurantData from '../data/restaurants.json';

export class StaticRestaurantRepository implements IRestaurantRepository {
  private restaurants: Restaurant[];
  private readonly distanceCalc = new DistanceCalculatorService();

  constructor() {
    // JSON 데이터를 Domain Entity로 변환
    this.restaurants = restaurantData.map(data =>
      Restaurant.create({
        id: data.id,
        name: data.name,
        nameKorean: data.nameKorean,
        description: data.description,
        descriptionKorean: data.descriptionKorean,
        category: data.category as RestaurantCategory,
        coordinate: Coordinate.create(data.latitude, data.longitude),
        address: data.address,
        rating: Rating.create(data.rating),
        priceRange: PriceRange.create(data.priceLevel as PriceLevel),
        openingHours: data.openingHours,
        phoneNumber: data.phoneNumber,
        website: data.website,
        imageUrls: data.imageUrls,
        tags: data.tags,
        mustTryDishes: data.mustTryDishes,
      })
    );
  }

  async findAll(filter?: RestaurantFilter): Promise<Restaurant[]> {
    let result = [...this.restaurants];

    if (filter?.category) {
      result = result.filter(r => r.isInCategory(filter.category!));
    }
    if (filter?.searchQuery) {
      result = result.filter(r => r.matchesSearch(filter.searchQuery!));
    }
    if (filter?.minRating) {
      result = result.filter(r => r.rating.value >= filter.minRating!);
    }
    if (filter?.priceLevel) {
      result = result.filter(r => r.priceRange.level === filter.priceLevel);
    }

    return result;
  }

  async findById(id: string): Promise<Restaurant | null> {
    return this.restaurants.find(r => r.id === id) ?? null;
  }

  async findNearby(center: Coordinate, radiusMeters: number): Promise<Restaurant[]> {
    return this.restaurants.filter(r => {
      const distance = this.distanceCalc.calculateDistance(r.coordinate, center);
      return distance.isWithin(radiusMeters);
    });
  }

  async findByCategory(category: RestaurantCategory): Promise<Restaurant[]> {
    return this.restaurants.filter(r => r.isInCategory(category));
  }

  async search(query: string): Promise<Restaurant[]> {
    return this.restaurants.filter(r => r.matchesSearch(query));
  }
}
```

```typescript
// src/infrastructure/repositories/LocalStorageBookmarkRepository.ts
import { IBookmarkRepository } from '../../domain/repositories/IBookmarkRepository';
import { Bookmark } from '../../domain/entities/Bookmark';

interface BookmarkRecord {
  id: string;
  restaurantId: string;
  userId: string;
  createdAt: string;
  note?: string;
}

export class LocalStorageBookmarkRepository implements IBookmarkRepository {
  private readonly STORAGE_KEY = 'spaingogo_bookmarks';

  private getAll(): BookmarkRecord[] {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BookmarkRecord[]) : [];
  }

  private saveAll(records: BookmarkRecord[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
  }

  private recordToEntity(record: BookmarkRecord): Bookmark {
    return Bookmark.create(record.restaurantId, record.userId, record.note);
  }

  async findByUserId(userId: string): Promise<Bookmark[]> {
    return this.getAll()
      .filter(r => r.userId === userId)
      .map(r => this.recordToEntity(r));
  }

  async findByRestaurantAndUser(
    restaurantId: string,
    userId: string
  ): Promise<Bookmark | null> {
    const record = this.getAll().find(
      r => r.restaurantId === restaurantId && r.userId === userId
    );
    return record ? this.recordToEntity(record) : null;
  }

  async save(bookmark: Bookmark): Promise<void> {
    const records = this.getAll();
    const record: BookmarkRecord = {
      id: bookmark.id,
      restaurantId: bookmark.restaurantId,
      userId: bookmark.userId,
      createdAt: bookmark.createdAt.toISOString(),
      note: bookmark.note,
    };
    records.push(record);
    this.saveAll(records);
  }

  async delete(bookmarkId: string): Promise<void> {
    const records = this.getAll().filter(r => r.id !== bookmarkId);
    this.saveAll(records);
  }

  async existsByRestaurantAndUser(restaurantId: string, userId: string): Promise<boolean> {
    return this.getAll().some(
      r => r.restaurantId === restaurantId && r.userId === userId
    );
  }
}
```

---

### External API Adapters

```typescript
// src/infrastructure/adapters/GoogleMapsAdapter.ts
import { IMapService, NavigationUrl } from '../../application/ports/IMapService';
import { Coordinate } from '../../domain/value-objects/Coordinate';
import { HOTEL_COORDINATE, HOTEL_NAME } from '../../domain/value-objects/HotelCoordinate';

export class GoogleMapsAdapter implements IMapService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getNavigationUrl(from: Coordinate, to: Coordinate): NavigationUrl {
    const googleUrl = `https://www.google.com/maps/dir/${from.latitude},${from.longitude}/${to.latitude},${to.longitude}`;
    const appleUrl = `maps://maps.apple.com/?saddr=${from.latitude},${from.longitude}&daddr=${to.latitude},${to.longitude}`;
    const wazeUrl = `https://waze.com/ul?ll=${to.latitude},${to.longitude}&navigate=yes`;

    return {
      googleMapsUrl: googleUrl,
      appleMapsUrl: appleUrl,
      wazeUrl,
    };
  }

  getHotelNavigationUrl(from: Coordinate): NavigationUrl {
    return this.getNavigationUrl(from, HOTEL_COORDINATE);
  }

  getStaticMapUrl(center: Coordinate, markers: Coordinate[], zoom: number): string {
    const markerParams = markers
      .map(m => `markers=${m.latitude},${m.longitude}`)
      .join('&');

    return (
      `https://maps.googleapis.com/maps/api/staticmap` +
      `?center=${center.latitude},${center.longitude}` +
      `&zoom=${zoom}` +
      `&size=600x300` +
      `&${markerParams}` +
      `&key=${this.apiKey}`
    );
  }
}
```

```typescript
// src/infrastructure/adapters/BrowserGpsAdapter.ts
import { IGpsService, GpsPosition } from '../../application/ports/IGpsService';
import { Coordinate } from '../../domain/value-objects/Coordinate';

export class BrowserGpsAdapter implements IGpsService {
  async getCurrentPosition(): Promise<GpsPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          resolve({
            coordinate: Coordinate.create(
              position.coords.latitude,
              position.coords.longitude
            ),
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp),
          });
        },
        error => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    });
  }

  watchPosition(callback: (position: GpsPosition) => void): () => void {
    const watchId = navigator.geolocation.watchPosition(
      position => {
        callback({
          coordinate: Coordinate.create(
            position.coords.latitude,
            position.coords.longitude
          ),
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp),
        });
      },
      error => console.error('GPS watch error:', error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }
}
```

```typescript
// src/infrastructure/adapters/OpenAiAdapter.ts
import { IAiService, UserPreference, AiRecommendationResult } from '../../application/ports/IAiService';
import { Restaurant } from '../../domain/entities/Restaurant';
import { CATEGORY_LABELS } from '../../domain/value-objects/RestaurantCategory';

export class OpenAiAdapter implements IAiService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async recommend(
    allRestaurants: Restaurant[],
    userPreference: UserPreference,
    visitedRestaurantIds: string[]
  ): Promise<AiRecommendationResult> {
    const restaurantSummaries = allRestaurants
      .filter(r => !visitedRestaurantIds.includes(r.id))
      .map(r => ({
        id: r.id,
        name: r.name,
        category: CATEGORY_LABELS[r.category],
        rating: r.rating.value,
        priceLevel: r.priceRange.level,
        distanceKm: r.distanceFromHotel?.kilometers,
        tags: r.tags,
      }));

    const prompt = this.buildPrompt(restaurantSummaries, userPreference);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    const recommendedRestaurants = result.restaurantIds
      .map((id: string) => allRestaurants.find(r => r.id === id))
      .filter(Boolean) as Restaurant[];

    return {
      restaurants: recommendedRestaurants,
      reasoning: result.reasoning,
      confidence: result.confidence,
    };
  }

  private buildPrompt(
    restaurants: object[],
    preference: UserPreference
  ): string {
    return `
당신은 바르셀로나 맛집 추천 전문가입니다.
다음 맛집 목록에서 사용자 선호도에 맞는 상위 5개를 추천해주세요.

사용자 선호도:
- 선호 카테고리: ${preference.preferredCategories.join(', ')}
- 예산 수준: ${preference.budgetLevel ?? '무관'}
- 그룹 크기: ${preference.groupSize ?? 1}명

맛집 목록:
${JSON.stringify(restaurants, null, 2)}

응답 형식 (JSON):
{
  "restaurantIds": ["id1", "id2", ...],
  "reasoning": "추천 이유 설명",
  "confidence": 0.85
}
    `.trim();
  }
}
```

```typescript
// src/infrastructure/cache/InMemoryCacheService.ts
import { ICacheService } from '../../application/ports/ICacheService';

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

export class InMemoryCacheService implements ICacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
```

---

## Presentation Layer

### Dependency Injection Container

```typescript
// src/presentation/di/container.ts
import { GetRestaurantListUseCase } from '../../application/use-cases/get-restaurant-list/GetRestaurantListUseCase';
import { GetRestaurantDetailUseCase } from '../../application/use-cases/get-restaurant-detail/GetRestaurantDetailUseCase';
import { GetNearbyRestaurantsUseCase } from '../../application/use-cases/get-nearby-restaurants/GetNearbyRestaurantsUseCase';
import { GetHotelNavigationUseCase } from '../../application/use-cases/get-hotel-navigation/GetHotelNavigationUseCase';
import { ToggleBookmarkUseCase } from '../../application/use-cases/toggle-bookmark/ToggleBookmarkUseCase';
import { AddVisitScheduleUseCase } from '../../application/use-cases/add-visit-schedule/AddVisitScheduleUseCase';
import { GetAiRecommendationUseCase } from '../../application/use-cases/get-ai-recommendation/GetAiRecommendationUseCase';

import { StaticRestaurantRepository } from '../../infrastructure/repositories/StaticRestaurantRepository';
import { LocalStorageBookmarkRepository } from '../../infrastructure/repositories/LocalStorageBookmarkRepository';
import { LocalStorageScheduleRepository } from '../../infrastructure/repositories/LocalStorageScheduleRepository';
import { GoogleMapsAdapter } from '../../infrastructure/adapters/GoogleMapsAdapter';
import { BrowserGpsAdapter } from '../../infrastructure/adapters/BrowserGpsAdapter';
import { OpenAiAdapter } from '../../infrastructure/adapters/OpenAiAdapter';
import { DistanceCalculatorService } from '../../domain/services/DistanceCalculatorService';

// Infrastructure 인스턴스 (싱글톤)
const restaurantRepo = new StaticRestaurantRepository();
const bookmarkRepo = new LocalStorageBookmarkRepository();
const scheduleRepo = new LocalStorageScheduleRepository();
const mapService = new GoogleMapsAdapter(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!);
const aiService = new OpenAiAdapter(process.env.OPENAI_API_KEY!);
const distanceCalc = new DistanceCalculatorService();

// Use Case 인스턴스 (의존성 주입)
export const getRestaurantListUseCase = new GetRestaurantListUseCase(
  restaurantRepo,
  bookmarkRepo,
  distanceCalc
);

export const getRestaurantDetailUseCase = new GetRestaurantDetailUseCase(
  restaurantRepo,
  bookmarkRepo,
  mapService,
  distanceCalc
);

export const getNearbyRestaurantsUseCase = new GetNearbyRestaurantsUseCase(
  restaurantRepo,
  bookmarkRepo,
  distanceCalc
);

export const getHotelNavigationUseCase = new GetHotelNavigationUseCase(
  mapService,
  distanceCalc
);

export const toggleBookmarkUseCase = new ToggleBookmarkUseCase(bookmarkRepo);

export const addVisitScheduleUseCase = new AddVisitScheduleUseCase(
  scheduleRepo,
  restaurantRepo
);

export const getAiRecommendationUseCase = new GetAiRecommendationUseCase(
  restaurantRepo,
  bookmarkRepo,
  aiService,
  distanceCalc
);

export const gpsService = new BrowserGpsAdapter();
```

---

### Next.js API Routes (Interface Adapters)

```typescript
// src/presentation/app/api/restaurants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantListUseCase } from '../../../di/container';
import { RestaurantCategory } from '../../../../domain/value-objects/RestaurantCategory';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = request.headers.get('x-user-id') ?? 'anonymous';

    const output = await getRestaurantListUseCase.execute(
      {
        category: searchParams.get('category') as RestaurantCategory | undefined,
        searchQuery: searchParams.get('q') ?? undefined,
        maxDistanceMeters: searchParams.get('maxDistance')
          ? Number(searchParams.get('maxDistance'))
          : undefined,
        minRating: searchParams.get('minRating')
          ? Number(searchParams.get('minRating'))
          : undefined,
        sortBy: (searchParams.get('sortBy') as 'distance' | 'rating' | 'name') ?? 'distance',
        page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        pageSize: searchParams.get('pageSize')
          ? Number(searchParams.get('pageSize'))
          : 20,
      },
      userId
    );

    return NextResponse.json(output);
  } catch (error) {
    console.error('GET /api/restaurants error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

```typescript
// src/presentation/app/api/restaurants/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRestaurantDetailUseCase } from '../../../../di/container';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id') ?? 'anonymous';
    const output = await getRestaurantDetailUseCase.execute(
      { restaurantId: params.id },
      userId
    );

    if (!output.found) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    return NextResponse.json(output.restaurant);
  } catch (error) {
    console.error(`GET /api/restaurants/${params.id} error:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

---

### React Hooks (Presentation Layer)

```typescript
// src/presentation/hooks/useRestaurants.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { GetRestaurantListInput } from '../../application/use-cases/get-restaurant-list/GetRestaurantListInput';
import { GetRestaurantListOutput } from '../../application/use-cases/get-restaurant-list/GetRestaurantListOutput';

export function useRestaurants(filter: GetRestaurantListInput) {
  const [data, setData] = useState<GetRestaurantListOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter.category) params.set('category', filter.category);
      if (filter.searchQuery) params.set('q', filter.searchQuery);
      if (filter.sortBy) params.set('sortBy', filter.sortBy);
      if (filter.page) params.set('page', String(filter.page));

      const response = await fetch(`/api/restaurants?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      const result: GetRestaurantListOutput = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filter.category, filter.searchQuery, filter.sortBy, filter.page]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  return { data, loading, error, refetch: fetchRestaurants };
}
```

```typescript
// src/presentation/hooks/useGps.ts
'use client';

import { useState, useEffect } from 'react';
import { BrowserGpsAdapter } from '../../infrastructure/adapters/BrowserGpsAdapter';
import { GpsPosition } from '../../application/ports/IGpsService';

const gpsAdapter = new BrowserGpsAdapter();

export function useGps() {
  const [position, setPosition] = useState<GpsPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPosition = async () => {
    setLoading(true);
    setError(null);
    try {
      const pos = await gpsAdapter.getCurrentPosition();
      setPosition(pos);
    } catch (err) {
      setError('위치 정보를 가져올 수 없습니다. 위치 권한을 허용해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return { position, loading, error, requestPosition };
}
```

```typescript
// src/presentation/hooks/useBookmarks.ts
'use client';

import { useState, useCallback } from 'react';

export function useBookmarks() {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const toggleBookmark = useCallback(async (restaurantId: string) => {
    setPendingIds(prev => new Set(prev).add(restaurantId));
    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId }),
      });
      if (!response.ok) throw new Error('Failed to toggle bookmark');
      return await response.json();
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(restaurantId);
        return next;
      });
    }
  }, []);

  return { toggleBookmark, pendingIds };
}
```

---

### Next.js Pages (Server Components)

```typescript
// src/presentation/app/page.tsx
import { Suspense } from 'react';
import { RestaurantList } from '../components/restaurant/RestaurantList';
import { CategoryFilter } from '../components/restaurant/CategoryFilter';
import { SearchBar } from '../components/shared/SearchBar';

export default function HomePage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; sort?: string };
}) {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          바르셀로나 맛집 가이드
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Hotel Villa Olimpic 기준 거리 표시
        </p>
        <SearchBar defaultValue={searchParams.q} />
        <CategoryFilter selectedCategory={searchParams.category} />
        <Suspense fallback={<div>맛집 목록 로딩 중...</div>}>
          <RestaurantList
            category={searchParams.category}
            searchQuery={searchParams.q}
            sortBy={searchParams.sort as 'distance' | 'rating' | 'name'}
          />
        </Suspense>
      </div>
    </main>
  );
}
```

```typescript
// src/presentation/app/restaurants/[id]/page.tsx
import { notFound } from 'next/navigation';
import { getRestaurantDetailUseCase } from '../../../di/container';
import { RestaurantDetail } from '../../../components/restaurant/RestaurantDetail';

interface Props {
  params: { id: string };
}

export default async function RestaurantDetailPage({ params }: Props) {
  const output = await getRestaurantDetailUseCase.execute(
    { restaurantId: params.id },
    'anonymous' // 실제 구현 시 세션/쿠키에서 userId 추출
  );

  if (!output.found) notFound();

  return <RestaurantDetail restaurant={output.restaurant} />;
}
```

---

### React Components

```typescript
// src/presentation/components/restaurant/RestaurantCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import { RestaurantSummaryDto } from '../../../application/use-cases/get-restaurant-list/GetRestaurantListOutput';
import { BookmarkButton } from '../bookmark/BookmarkButton';
import { DistanceBadge } from '../shared/DistanceBadge';

interface RestaurantCardProps {
  restaurant: RestaurantSummaryDto;
  onBookmarkToggle?: (restaurantId: string) => void;
}

export function RestaurantCard({ restaurant, onBookmarkToggle }: RestaurantCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/restaurants/${restaurant.id}`}>
        <div className="relative h-48">
          <Image
            src={restaurant.thumbnailUrl}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
          <span className="absolute top-2 left-2 bg-white/90 text-xs font-medium px-2 py-1 rounded-full">
            {restaurant.categoryLabel}
          </span>
          <span className="absolute top-2 right-2 bg-white/90 text-xs font-medium px-2 py-1 rounded-full text-amber-600">
            {restaurant.priceSymbol}
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
              {restaurant.nameKorean && (
                <p className="text-sm text-gray-500">{restaurant.nameKorean}</p>
              )}
            </div>
            <BookmarkButton
              restaurantId={restaurant.id}
              isBookmarked={restaurant.isBookmarked}
              onToggle={onBookmarkToggle}
            />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium">{restaurant.rating.toFixed(1)}</span>
            </div>
            {restaurant.distanceDisplay && (
              <DistanceBadge distance={restaurant.distanceDisplay} />
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
```

```typescript
// src/presentation/components/navigation/HotelNavigationButton.tsx
'use client';

import { useState } from 'react';
import { Navigation } from 'lucide-react';
import { useGps } from '../../hooks/useGps';
import { GetHotelNavigationOutput } from '../../../application/use-cases/get-hotel-navigation/GetHotelNavigationOutput';

export function HotelNavigationButton() {
  const { position, loading: gpsLoading, requestPosition } = useGps();
  const [navData, setNavData] = useState<GetHotelNavigationOutput | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleNavigate = async () => {
    let currentPosition = position;
    if (!currentPosition) {
      await requestPosition();
      return;
    }

    const response = await fetch(
      `/api/hotel-navigation?lat=${currentPosition.coordinate.latitude}&lng=${currentPosition.coordinate.longitude}`
    );
    const data: GetHotelNavigationOutput = await response.json();
    setNavData(data);
    setShowModal(true);
  };

  return (
    <>
      <button
        onClick={handleNavigate}
        disabled={gpsLoading}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-4 py-3 flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <Navigation className="w-5 h-5" />
        <span className="text-sm font-medium">호텔로 돌아가기</span>
      </button>

      {showModal && navData && (
        <NavigationModal data={navData} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

function NavigationModal({
  data,
  onClose,
}: {
  data: GetHotelNavigationOutput;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold">{data.hotelName}</h3>
        <p className="text-sm text-gray-500 mt-1">{data.hotelAddress}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
          <span>거리: {data.distanceFromCurrentLocation}</span>
          <span>도보 약 {data.estimatedWalkingMinutes}분</span>
        </div>
        <div className="flex gap-3 mt-4">
          <a
            href={data.navigationUrls.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 text-white text-center py-3 rounded-lg text-sm font-medium"
          >
            Google Maps
          </a>
          {data.navigationUrls.wazeUrl && (
            <a
              href={data.navigationUrls.wazeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-cyan-500 text-white text-center py-3 rounded-lg text-sm font-medium"
            >
              Waze
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/presentation/components/shared/DistanceBadge.tsx
import { MapPin } from 'lucide-react';

interface DistanceBadgeProps {
  distance: string;
  className?: string;
}

export function DistanceBadge({ distance, className }: DistanceBadgeProps) {
  return (
    <div className={`flex items-center gap-1 text-gray-500 ${className ?? ''}`}>
      <MapPin className="w-3 h-3" />
      <span className="text-xs">{distance}</span>
    </div>
  );
}
```

---

## Infrastructure Layer - API Route 상세

| 엔드포인트 | HTTP 메서드 | Use Case | 요청 파라미터 | 응답 형식 |
|-----------|-----------|---------|------------|---------|
| `/api/restaurants` | GET | GetRestaurantListUseCase | category, q, maxDistance, minRating, sortBy, page, pageSize | GetRestaurantListOutput |
| `/api/restaurants/[id]` | GET | GetRestaurantDetailUseCase | id (path) | RestaurantDetailDto |
| `/api/nearby` | GET | GetNearbyRestaurantsUseCase | lat, lng, radius | GetNearbyRestaurantsOutput |
| `/api/hotel-navigation` | GET | GetHotelNavigationUseCase | lat, lng | GetHotelNavigationOutput |
| `/api/ranking` | GET | GetRegionalRankingUseCase | region, limit | GetRegionalRankingOutput |
| `/api/ai-recommendation` | POST | GetAiRecommendationUseCase | { preferences } | AiRecommendationResult |
| `/api/bookmarks` | GET | GetBookmarksUseCase | - | GetBookmarksOutput |
| `/api/bookmarks` | POST | ToggleBookmarkUseCase | { restaurantId } | ToggleBookmarkOutput |
| `/api/schedules` | GET | GetVisitSchedulesUseCase | - | GetVisitSchedulesOutput |
| `/api/schedules` | POST | AddVisitScheduleUseCase | { restaurantId, date, partySize } | AddVisitScheduleOutput |

---

## 의존성 방향 검증

```
[Presentation Layer]           [Infrastructure Layer]
  Next.js Pages       ──────→  StaticRestaurantRepository
  React Components    ──────→  LocalStorageBookmarkRepository
  Hooks               ──────→  GoogleMapsAdapter
  API Routes          ──────→  BrowserGpsAdapter
         │                     OpenAiAdapter
         │                           │
         ↓                           │
[Application Layer]                  │
  Use Case Interactors ←─────────────┘ (implements)
  Input/Output DTOs
  Port Interfaces (IMapService, IAiService, ...)
         │
         ↓
[Domain Layer]
  Restaurant Entity
  Bookmark Entity
  VisitSchedule Entity
  Value Objects (Coordinate, Distance, Rating, ...)
  Repository Interfaces (IRestaurantRepository, ...)
  Domain Services (DistanceCalculatorService, RankingService)

의존성 방향: Presentation → Application → Domain ← Infrastructure
                                         ↑
                       Infrastructure implements Domain interfaces
```

---

## 아키텍처 결정사항 (ADR)

| 결정 | 선택 | 이유 |
|------|------|------|
| 맛집 데이터 저장소 | 정적 JSON (StaticRestaurantRepository) | 바르셀로나 맛집 목록은 변경 빈도 낮음, DB 없이 배포 간소화 |
| 북마크/일정 저장소 | LocalStorage | 서버 인증 없이 사용자 데이터 유지, SSR 주의 필요 |
| 거리 계산 | Haversine 공식 (도메인 서비스) | 외부 API 의존 없이 순수 계산, 오프라인 지원 |
| 지도 서비스 | Google Maps (교체 가능 어댑터) | Kakao Map으로 교체 가능하도록 IMapService 인터페이스 추상화 |
| AI 추천 | OpenAI API (교체 가능 어댑터) | IAiService 포트로 추상화하여 다른 LLM으로 교체 가능 |
| userId 관리 | 익명 사용자 (anonymous) | 초기 버전 로그인 없음, 향후 확장 시 세션 추가 |
| 캐시 전략 | InMemory Cache (선택적) | 맛집 목록 반복 요청 최적화, TTL 기반 무효화 |
| 호텔 좌표 | Domain Value Object 상수 | 앱 전체의 기준점으로 Domain Layer에 위치, 변경 시 한 곳만 수정 |

---

## SOLID 체크리스트

- [x] **SRP**: 각 Use Case 클래스는 하나의 유스케이스만 담당 (GetRestaurantListUseCase는 목록 조회만, ToggleBookmarkUseCase는 북마크 토글만)
- [x] **OCP**: 새 카테고리/기능 추가 시 RestaurantCategory enum 확장, 새 Use Case 클래스 추가로 기존 코드 미수정
- [x] **LSP**: GoogleMapsAdapter와 KakaoMapAdapter 모두 IMapService 계약 준수, 런타임에 교체 가능
- [x] **ISP**: IRestaurantRepository(읽기), IBookmarkRepository(북마크), IVisitScheduleRepository(일정)로 책임 분리된 별도 인터페이스
- [x] **DIP**: GetRestaurantDetailUseCase는 IMapService(추상화)에 의존, GoogleMapsAdapter(구현)을 직접 import하지 않음

---

## 환경 변수

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
OPENAI_API_KEY=your_openai_api_key

# 호텔 좌표 (참고용 - 코드에서는 HotelCoordinate.ts Value Object 사용)
# HOTEL_LATITUDE=41.3983
# HOTEL_LONGITUDE=2.1969
```

---

## 데이터 스키마 (restaurants.json 예시)

```json
[
  {
    "id": "restaurant_001",
    "name": "La Barceloneta",
    "nameKorean": "라 바르셀로네타",
    "description": "Fresh seafood in the heart of Barceloneta beach district",
    "descriptionKorean": "바르셀로네타 해변가의 신선한 해산물 레스토랑",
    "category": "SEAFOOD",
    "latitude": 41.3781,
    "longitude": 2.1891,
    "address": "Carrer de la Maquinista, 4, Barcelona",
    "rating": 4.5,
    "priceLevel": 2,
    "openingHours": {
      "monday": "12:00-23:00",
      "tuesday": "12:00-23:00",
      "wednesday": "12:00-23:00",
      "thursday": "12:00-23:00",
      "friday": "12:00-00:00",
      "saturday": "11:00-00:00",
      "sunday": "11:00-23:00"
    },
    "phoneNumber": "+34 93 221 2111",
    "website": "https://example.com",
    "imageUrls": ["/images/restaurants/la-barceloneta-1.jpg"],
    "tags": ["해산물", "해변", "파에야", "분위기 좋음"],
    "mustTryDishes": ["Paella de Mariscos", "Gambas al Ajillo", "Croquetas de Bacalao"]
  }
]
```
