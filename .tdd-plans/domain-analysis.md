# 도메인 분석: Spaingogo - 바르셀로나 맛집 관광 정보 앱

## 개요

Spaingogo는 바르셀로나를 방문하는 여행자를 위한 맛집 및 관광 정보 앱입니다.
기준 호텔(Hotel & SPA Villa Olimpic@Suites)을 중심으로 거리 기반 맛집 탐색,
스페인 음식 카테고리 필터링, AI 추천, 미슐랭 스타 레스토랑 정보 등을 제공합니다.
위치기반 서비스와 일정 관리를 통합하여 바르셀로나 여행 전반을 지원하는 도메인입니다.

---

## 액터 (Actors)

| 액터 | 역할 | 유스케이스 |
|------|------|-----------|
| Traveler (여행자) | 앱의 주 사용자. 맛집 탐색, 일정 관리, 길찾기를 수행 | BrowseRestaurants, FilterByCategory, SearchNearby, CreateItinerary, NavigateToHotel |
| Guest (비로그인 사용자) | 기본 정보 열람만 가능 | ViewRestaurantDetail, BrowseCategories, ViewMap |
| AI Recommender (AI 추천 엔진) | 여행자 선호도 기반 맛집 추천 | RecommendRestaurants, RankByPopularity |
| Location Service (위치 서비스) | GPS 기반 현재 위치 및 거리 계산 | CalculateDistanceFromHotel, FindNearbyRestaurants |
| Navigation Service (길찾기 서비스) | 외부 지도 앱 연동 | NavigateToRestaurant, NavigateBackToHotel |

---

## 유스케이스 목록

### UC-01: BrowseRestaurants (맛집 목록 탐색)
- **액터**: Traveler, Guest
- **선행조건**: 앱 실행 상태
- **주요 흐름**:
  1. 홈 화면 진입 시 인기맛집 섹션 노출
  2. 지역별 랭킹 섹션 노출 (고딕지구, 그라시아, 포블레노우, 바르셀로네타 등)
  3. 미슐랭 스타 레스토랑 섹션 노출
  4. 각 맛집 카드에 별점, 리뷰수, 호텔로부터 거리, 카테고리 이모지 표시
- **예외 흐름**: 네트워크 오류 시 캐시된 데이터 표시

### UC-02: FilterByCategory (카테고리 필터링)
- **액터**: Traveler, Guest
- **선행조건**: 맛집 목록 화면 진입
- **주요 흐름**:
  1. 카테고리 탭 선택 (전체/타파스/파에야/핀초스/츄러스/하몬/상그리아/해산물)
  2. 선택된 카테고리에 해당하는 맛집만 필터링하여 표시
  3. 복수 카테고리 선택 지원
- **예외 흐름**: 해당 카테고리 맛집 없을 시 빈 상태 메시지 표시

### UC-03: SearchNearby (주변 맛집 탐색)
- **액터**: Traveler
- **선행조건**: 위치 권한 허용
- **주요 흐름**:
  1. 현재 GPS 위치 획득
  2. 반경 내 맛집 목록 지도 위에 표시
  3. 호텔로부터의 거리 함께 표시
  4. 거리순/평점순 정렬 선택
- **예외 흐름**: 위치 권한 거부 시 호텔 위치(41.3983, 2.1969) 기준으로 표시

### UC-04: ViewRestaurantDetail (맛집 상세 조회)
- **액터**: Traveler, Guest
- **선행조건**: 맛집 목록에서 카드 선택
- **주요 흐름**:
  1. 맛집 기본 정보 표시 (이름, 주소, 카테고리, 영업시간)
  2. 별점 및 리뷰 목록 표시
  3. 호텔로부터 거리 및 예상 도보 시간 표시
  4. 미슐랭 스타 정보 표시 (해당 시)
  5. 길찾기 버튼 제공
- **예외 흐름**: 없음

### UC-05: NavigateToHotel (호텔로 돌아가기)
- **액터**: Traveler
- **선행조건**: 맛집 상세 또는 지도 화면
- **주요 흐름**:
  1. "호텔로 돌아가기" 버튼 탭
  2. 현재 위치에서 호텔(Carrer de Pallars, 121-125)까지 외부 지도 앱 실행
  3. 도보/택시/대중교통 옵션 선택
- **예외 흐름**: 위치 권한 없을 시 호텔 주소 텍스트 복사 제공

### UC-06: CreateItinerary (여행 일정 생성)
- **액터**: Traveler
- **선행조건**: 로그인 또는 로컬 저장 허용
- **주요 흐름**:
  1. 방문 날짜 선택
  2. 맛집 상세에서 일정에 추가
  3. 일정 탭에서 날짜별 맛집 목록 확인
  4. 순서 조정 및 삭제
- **예외 흐름**: 동일 시간대 중복 추가 시 경고

### UC-07: GetAIRecommendation (AI 맛집 추천)
- **액터**: Traveler, AI Recommender
- **선행조건**: 앱 사용 이력 또는 선호 카테고리 설정
- **주요 흐름**:
  1. 여행자의 카테고리 선호도, 방문 이력 분석
  2. 현재 위치 및 시간대(아침/점심/저녁) 고려
  3. 상위 5개 맛집 추천 카드 표시
- **예외 흐름**: 이력 부족 시 인기순 기본 추천

### UC-08: ViewMichelinRestaurants (미슐랭 레스토랑 조회)
- **액터**: Traveler, Guest
- **선행조건**: 없음
- **주요 흐름**:
  1. 미슐랭 스타(1/2/3성) 필터 선택
  2. 해당 레스토랑 목록 및 상세 정보 표시
  3. 예약 링크 또는 전화번호 제공
- **예외 흐름**: 없음

---

## 도메인 모델

---

### Aggregate 1: Restaurant (맛집)

**Root Entity: Restaurant**

```typescript
// Value Objects
type RestaurantId = string; // UUID

interface Coordinates {
  readonly latitude: number;   // 위도
  readonly longitude: number;  // 경도
}

interface Address {
  readonly street: string;        // 거리명 (예: "Carrer de la Barceloneta, 1")
  readonly neighborhood: string;  // 지역구 (예: "Barceloneta")
  readonly district: BarcelonaDistrict;
  readonly postalCode: string;    // 우편번호
  readonly coordinates: Coordinates;
}

interface OperatingHours {
  readonly openTime: string;   // "HH:mm"
  readonly closeTime: string;  // "HH:mm"
  readonly daysOpen: DayOfWeek[];
  readonly isOpenNow: () => boolean;
}

interface Rating {
  readonly score: number;       // 0.0 ~ 5.0
  readonly reviewCount: number; // 0 이상
}

interface MichelinInfo {
  readonly stars: 1 | 2 | 3;
  readonly year: number;        // 수상 연도
  readonly guide: string;       // "Michelin Guide Spain"
}

// Enums
enum BarcelonaDistrict {
  GOTHIC_QUARTER = "GOTHIC_QUARTER",    // 고딕지구
  GRACIA = "GRACIA",                    // 그라시아
  POBLENOU = "POBLENOU",                // 포블레노우
  BARCELONETA = "BARCELONETA",          // 바르셀로네타
  EIXAMPLE = "EIXAMPLE",                // 에이샴플레
  EL_BORN = "EL_BORN",                  // 엘 보른
  SANT_MARTI = "SANT_MARTI",            // 산트 마르티 (호텔 위치)
  MONTJUIC = "MONTJUIC",               // 몬주익
}

enum SpanishFoodCategory {
  ALL = "ALL",
  TAPAS = "TAPAS",           // 타파스
  PAELLA = "PAELLA",         // 파에야
  PINTXOS = "PINTXOS",       // 핀초스
  CHURROS = "CHURROS",       // 츄러스
  JAMON = "JAMON",           // 하몬
  SANGRIA = "SANGRIA",       // 상그리아
  SEAFOOD = "SEAFOOD",       // 해산물
  BOCADILLO = "BOCADILLO",   // 보카디요
  CAVA = "CAVA",             // 카바 (스파클링 와인)
}

// Root Entity
class Restaurant {
  readonly id: RestaurantId;
  readonly name: string;
  readonly description: string;
  readonly address: Address;
  readonly categories: SpanishFoodCategory[];
  readonly rating: Rating;
  readonly operatingHours: OperatingHours;
  readonly priceRange: PriceRange; // 1~4 (€ ~ €€€€)
  readonly phoneNumber: string | null;
  readonly reservationUrl: string | null;
  readonly michelinInfo: MichelinInfo | null;
  readonly imageUrls: string[];
  private _reviews: Review[];

  // 불변식 (Invariants)
  // - categories는 최소 1개 이상이어야 한다
  // - rating.score는 0.0 ~ 5.0 범위여야 한다
  // - rating.reviewCount는 0 이상이어야 한다
  // - michelinInfo가 존재할 경우 stars는 1, 2, 3 중 하나여야 한다
  // - imageUrls는 최소 1개 이상이어야 한다

  addReview(review: Review): void {
    // 리뷰 추가 후 rating 재계산
    this._reviews.push(review);
    this.recalculateRating();
    // Domain Event 발행: RestaurantReviewAdded
  }

  private recalculateRating(): void {
    const total = this._reviews.reduce((sum, r) => sum + r.score, 0);
    // rating은 Value Object이므로 새 인스턴스로 교체
  }

  isMichelin(): boolean {
    return this.michelinInfo !== null;
  }
}

// Child Entity
class Review {
  readonly id: string;
  readonly restaurantId: RestaurantId;
  readonly authorName: string;
  readonly score: number;      // 1 ~ 5
  readonly content: string;
  readonly visitDate: Date;
  readonly language: "KO" | "EN" | "ES";
  readonly createdAt: Date;
}

// Value Objects
type PriceRange = 1 | 2 | 3 | 4;
type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
```

**Domain Events**
- `RestaurantReviewAdded`: 새 리뷰 추가 시 발행. 페이로드: `{ restaurantId, reviewId, newRating }`
- `RestaurantInfoUpdated`: 맛집 정보 변경 시 발행. 페이로드: `{ restaurantId, changedFields }`
- `MichelinStarAwarded`: 미슐랭 스타 획득/변경 시 발행. 페이로드: `{ restaurantId, stars, year }`

**Repository Interface**
```typescript
interface RestaurantRepository {
  findById(id: RestaurantId): Promise<Restaurant | null>;
  findAll(filter?: RestaurantFilter): Promise<Restaurant[]>;
  findByDistrict(district: BarcelonaDistrict): Promise<Restaurant[]>;
  findByCategories(categories: SpanishFoodCategory[]): Promise<Restaurant[]>;
  findNearby(center: Coordinates, radiusKm: number): Promise<Restaurant[]>;
  findMichelin(stars?: 1 | 2 | 3): Promise<Restaurant[]>;
  findTopRated(limit: number): Promise<Restaurant[]>;
  save(restaurant: Restaurant): Promise<void>;
}

interface RestaurantFilter {
  categories?: SpanishFoodCategory[];
  district?: BarcelonaDistrict;
  minRating?: number;
  maxPriceRange?: PriceRange;
  isMichelin?: boolean;
  isOpenNow?: boolean;
}
```

---

### Aggregate 2: Itinerary (여행 일정)

**Root Entity: Itinerary**

```typescript
type ItineraryId = string;
type TravelerId = string;

// Value Objects
interface TimeSlot {
  readonly date: Date;
  readonly startTime: string; // "HH:mm"
  readonly endTime: string;   // "HH:mm"

  // 불변식: startTime < endTime
  overlaps(other: TimeSlot): boolean;
}

interface ItineraryItem {
  readonly id: string;
  readonly restaurantId: RestaurantId;
  readonly restaurantName: string;      // 스냅샷 (변경 방지)
  readonly restaurantAddress: Address;  // 스냅샷
  readonly timeSlot: TimeSlot;
  readonly memo: string;
  readonly order: number; // 하루 내 방문 순서
}

// Root Entity
class Itinerary {
  readonly id: ItineraryId;
  readonly travelerId: TravelerId;
  readonly title: string;           // 예: "바르셀로나 3박 4일"
  readonly startDate: Date;
  readonly endDate: Date;
  private _items: ItineraryItem[];

  // 불변식
  // - startDate <= endDate
  // - 동일 날짜의 items에 TimeSlot 겹침이 없어야 한다
  // - items 내 같은 restaurantId가 같은 날짜에 중복될 수 없다

  addItem(item: ItineraryItem): void {
    if (this.hasTimeConflict(item.timeSlot, item.timeSlot.date)) {
      throw new DomainError("TIME_CONFLICT", "해당 시간대에 이미 일정이 있습니다.");
    }
    this._items.push(item);
    // Domain Event 발행: ItineraryItemAdded
  }

  removeItem(itemId: string): void {
    this._items = this._items.filter(i => i.id !== itemId);
    // Domain Event 발행: ItineraryItemRemoved
  }

  getItemsByDate(date: Date): ItineraryItem[] {
    return this._items
      .filter(i => isSameDay(i.timeSlot.date, date))
      .sort((a, b) => a.order - b.order);
  }

  private hasTimeConflict(slot: TimeSlot, date: Date): boolean {
    return this._items
      .filter(i => isSameDay(i.timeSlot.date, date))
      .some(i => i.timeSlot.overlaps(slot));
  }
}
```

**Domain Events**
- `ItineraryCreated`: 일정 생성 시 발행. 페이로드: `{ itineraryId, travelerId, startDate, endDate }`
- `ItineraryItemAdded`: 맛집 일정 추가 시 발행. 페이로드: `{ itineraryId, restaurantId, timeSlot }`
- `ItineraryItemRemoved`: 맛집 일정 삭제 시 발행. 페이로드: `{ itineraryId, itemId }`

**Repository Interface**
```typescript
interface ItineraryRepository {
  findById(id: ItineraryId): Promise<Itinerary | null>;
  findByTravelerId(travelerId: TravelerId): Promise<Itinerary[]>;
  save(itinerary: Itinerary): Promise<void>;
  delete(id: ItineraryId): Promise<void>;
}
```

---

### Aggregate 3: Traveler (여행자)

**Root Entity: Traveler**

```typescript
type TravelerId = string;

// Value Objects
interface FoodPreference {
  readonly favoriteCategories: SpanishFoodCategory[];
  readonly excludedCategories: SpanishFoodCategory[];
  readonly maxPriceRange: PriceRange;
  readonly prefersMichelin: boolean;
}

interface LocationPermission {
  readonly granted: boolean;
  readonly lastUpdated: Date;
}

// Root Entity
class Traveler {
  readonly id: TravelerId;
  readonly deviceId: string;           // 익명 사용자 식별용
  readonly nickname: string | null;
  readonly foodPreference: FoodPreference;
  readonly locationPermission: LocationPermission;
  private _visitedRestaurantIds: RestaurantId[];
  private _bookmarkedRestaurantIds: RestaurantId[];

  // 불변식
  // - favoriteCategories와 excludedCategories는 겹치면 안 된다
  // - visitedRestaurantIds는 중복될 수 없다

  bookmarkRestaurant(restaurantId: RestaurantId): void {
    if (!this._bookmarkedRestaurantIds.includes(restaurantId)) {
      this._bookmarkedRestaurantIds.push(restaurantId);
      // Domain Event 발행: RestaurantBookmarked
    }
  }

  markAsVisited(restaurantId: RestaurantId): void {
    if (!this._visitedRestaurantIds.includes(restaurantId)) {
      this._visitedRestaurantIds.push(restaurantId);
      // Domain Event 발행: RestaurantVisited
    }
  }

  updatePreference(preference: FoodPreference): void {
    // 새 FoodPreference Value Object로 교체
    // Domain Event 발행: TravelerPreferenceUpdated
  }
}
```

**Domain Events**
- `RestaurantBookmarked`: 맛집 즐겨찾기 추가 시. 페이로드: `{ travelerId, restaurantId }`
- `RestaurantVisited`: 맛집 방문 기록 시. 페이로드: `{ travelerId, restaurantId, visitedAt }`
- `TravelerPreferenceUpdated`: 선호도 변경 시. 페이로드: `{ travelerId, newPreference }`

**Repository Interface**
```typescript
interface TravelerRepository {
  findById(id: TravelerId): Promise<Traveler | null>;
  findByDeviceId(deviceId: string): Promise<Traveler | null>;
  save(traveler: Traveler): Promise<void>;
}
```

---

### Aggregate 4: HotelReference (기준 호텔)

> 호텔은 변경되지 않는 단일 기준점으로, 거리 계산 및 네비게이션의 앵커 역할을 합니다.

**Root Entity: HotelReference**

```typescript
// Value Objects
interface HotelInfo {
  readonly name: string;
  readonly address: Address;
  readonly coordinates: Coordinates;
  readonly phoneNumber: string;
  readonly checkInTime: string;   // "HH:mm"
  readonly checkOutTime: string;  // "HH:mm"
}

// 앱 전역 싱글톤 상수 (Aggregate이지만 불변)
const REFERENCE_HOTEL: HotelInfo = {
  name: "Hotel & SPA Villa Olimpic@Suites",
  address: {
    street: "Carrer de Pallars, 121, 125",
    neighborhood: "Sant Marti",
    district: BarcelonaDistrict.SANT_MARTI,
    postalCode: "08018",
    coordinates: { latitude: 41.3983, longitude: 2.1969 },
  },
  coordinates: { latitude: 41.3983, longitude: 2.1969 },
  phoneNumber: "+34 93 221 10 00",
  checkInTime: "15:00",
  checkOutTime: "11:00",
};
```

---

## 도메인 서비스

### DistanceCalculationService (거리 계산 서비스)
```typescript
interface DistanceCalculationService {
  // Haversine 공식을 사용한 두 지점 간 거리 계산
  calculateDistance(from: Coordinates, to: Coordinates): DistanceResult;

  // 호텔로부터 맛집까지의 거리 계산
  calculateDistanceFromHotel(restaurant: Restaurant): DistanceResult;

  // 도보 예상 시간 계산 (평균 속도 4km/h 기준)
  estimateWalkingTime(distanceKm: number): number; // 분 단위
}

interface DistanceResult {
  readonly distanceKm: number;
  readonly distanceText: string;  // "1.2km", "850m"
  readonly walkingMinutes: number;
}
```

**책임**: 두 Aggregate(HotelReference, Restaurant)에 걸친 거리 계산 로직을 분리.
단일 Entity에 속하지 않으므로 Domain Service로 정의.

### AIRecommendationService (AI 추천 서비스)
```typescript
interface AIRecommendationService {
  // 여행자 선호도 및 방문 이력 기반 맛집 추천
  recommend(
    traveler: Traveler,
    context: RecommendationContext
  ): Promise<Restaurant[]>;
}

interface RecommendationContext {
  readonly currentTime: Date;
  readonly mealTime: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
  readonly currentLocation: Coordinates | null;
  readonly limit: number;
}
```

**책임**: Traveler의 선호도 + Restaurant 데이터를 결합한 추천 로직.
여러 Aggregate를 조율하므로 Domain Service로 정의.

### NavigationService (내비게이션 서비스)
```typescript
interface NavigationService {
  // 현재 위치에서 목적지까지 외부 지도 앱 실행 URL 생성
  buildNavigationUrl(
    destination: Coordinates,
    transportMode: "WALKING" | "TRANSIT" | "DRIVING"
  ): string;

  // 호텔로 돌아가기 URL 생성
  buildReturnToHotelUrl(
    currentLocation: Coordinates,
    transportMode: "WALKING" | "TRANSIT" | "DRIVING"
  ): string;
}
```

---

## Bounded Context

### Context 1: Restaurant Discovery (맛집 탐색 컨텍스트)
- **포함 범위**: Restaurant Aggregate, DistanceCalculationService, AIRecommendationService
- **책임**: 맛집 목록 조회, 카테고리 필터링, 위치 기반 탐색, AI 추천, 미슐랭 정보
- **핵심 유비쿼터스 언어**: Restaurant, Category, District, Rating, MichelinStar, Distance

### Context 2: Itinerary Planning (일정 계획 컨텍스트)
- **포함 범위**: Itinerary Aggregate, ItineraryItem
- **책임**: 여행 일정 CRUD, 날짜별 맛집 스케줄링, 시간 충돌 방지
- **핵심 유비쿼터스 언어**: Itinerary, ItineraryItem, TimeSlot, Schedule

### Context 3: Traveler Profile (여행자 프로파일 컨텍스트)
- **포함 범위**: Traveler Aggregate
- **책임**: 여행자 식별, 선호도 관리, 즐겨찾기, 방문 이력
- **핵심 유비쿼터스 언어**: Traveler, Preference, Bookmark, VisitHistory

### Context 4: Location & Navigation (위치 및 내비게이션 컨텍스트)
- **포함 범위**: HotelReference, DistanceCalculationService, NavigationService
- **책임**: GPS 위치 획득, 호텔 기준 거리 계산, 외부 지도 앱 연동, 호텔 귀환 내비게이션
- **핵심 유비쿼터스 언어**: HotelReference, Distance, WalkingTime, NavigationUrl

### 컨텍스트 간 관계

```
Restaurant Discovery Context
      |
      | Customer-Supplier (Restaurant 정보 제공)
      v
Itinerary Planning Context
      |
      | Customer-Supplier (Traveler ID 참조)
      v
Traveler Profile Context

Location & Navigation Context
      |
      | Shared Kernel (Coordinates Value Object 공유)
      |--- Restaurant Discovery Context
      |--- Itinerary Planning Context
```

- **Restaurant Discovery ↔ Itinerary Planning**: Customer-Supplier 관계. Itinerary는 Restaurant 정보의 스냅샷을 ItineraryItem에 포함하여 Restaurant 변경으로부터 독립성 보장.
- **Traveler Profile ↔ Restaurant Discovery**: Customer-Supplier 관계. AI 추천을 위해 Traveler 선호도 데이터를 Discovery 컨텍스트에서 소비.
- **Location & Navigation ↔ 전체 컨텍스트**: Shared Kernel. `Coordinates` Value Object는 모든 컨텍스트에서 공유.

---

## Application Services (유스케이스 구현)

```typescript
// Restaurant Discovery Context
class BrowseRestaurantsUseCase {
  constructor(
    private restaurantRepo: RestaurantRepository,
    private distanceService: DistanceCalculationService,
  ) {}

  async execute(query: BrowseRestaurantsQuery): Promise<RestaurantCardDto[]> {
    const restaurants = await this.restaurantRepo.findAll({
      categories: query.categories,
      district: query.district,
      isOpenNow: query.isOpenNow,
    });

    return restaurants.map(r => ({
      id: r.id,
      name: r.name,
      categories: r.categories,
      rating: r.rating,
      distance: this.distanceService.calculateDistanceFromHotel(r),
      isMichelin: r.isMichelin(),
      michelinStars: r.michelinInfo?.stars,
      imageUrl: r.imageUrls[0],
    }));
  }
}

// Location & Navigation Context
class NavigateToHotelUseCase {
  constructor(private navigationService: NavigationService) {}

  execute(
    currentLocation: Coordinates,
    transportMode: "WALKING" | "TRANSIT" | "DRIVING"
  ): string {
    return this.navigationService.buildReturnToHotelUrl(
      currentLocation,
      transportMode
    );
  }
}

// Itinerary Planning Context
class AddRestaurantToItineraryUseCase {
  constructor(
    private itineraryRepo: ItineraryRepository,
    private restaurantRepo: RestaurantRepository,
  ) {}

  async execute(command: AddToItineraryCommand): Promise<void> {
    const [itinerary, restaurant] = await Promise.all([
      this.itineraryRepo.findById(command.itineraryId),
      this.restaurantRepo.findById(command.restaurantId),
    ]);

    if (!itinerary) throw new NotFoundError("Itinerary not found");
    if (!restaurant) throw new NotFoundError("Restaurant not found");

    const item: ItineraryItem = {
      id: generateId(),
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,      // 스냅샷
      restaurantAddress: restaurant.address, // 스냅샷
      timeSlot: command.timeSlot,
      memo: command.memo ?? "",
      order: command.order,
    };

    itinerary.addItem(item);
    await this.itineraryRepo.save(itinerary);
  }
}

// AI Recommendation Context
class GetAIRecommendationsUseCase {
  constructor(
    private travelerRepo: TravelerRepository,
    private recommendationService: AIRecommendationService,
  ) {}

  async execute(command: GetRecommendationsCommand): Promise<Restaurant[]> {
    const traveler = await this.travelerRepo.findById(command.travelerId);
    if (!traveler) throw new NotFoundError("Traveler not found");

    return this.recommendationService.recommend(traveler, {
      currentTime: new Date(),
      mealTime: command.mealTime,
      currentLocation: command.currentLocation,
      limit: 5,
    });
  }
}
```

---

## 유비쿼터스 언어 용어집

| 용어 | 의미 |
|------|------|
| Restaurant | 바르셀로나 내 음식점. 카테고리, 위치, 평점, 영업시간을 가짐 |
| HotelReference | 기준 호텔(Villa Olimpic@Suites). 거리 계산의 앵커 포인트 |
| BarcelonaDistrict | 바르셀로나 지역구. 고딕지구, 그라시아, 포블레노우 등 |
| SpanishFoodCategory | 스페인 음식 분류. 타파스, 파에야, 핀초스 등 |
| MichelinStar | 미슐랭 가이드 별점 (1~3성) |
| Distance | 호텔로부터의 직선 거리 (km/m) |
| WalkingTime | 도보 예상 소요 시간 (분) |
| Itinerary | 여행 일정. 날짜 범위와 ItineraryItem 목록으로 구성 |
| ItineraryItem | 일정의 단일 항목. 특정 날짜/시간의 맛집 방문 계획 |
| TimeSlot | 방문 시작~종료 시간 범위 |
| Traveler | 앱 사용자(여행자). 선호도, 즐겨찾기, 방문 이력 보유 |
| FoodPreference | 여행자의 음식 카테고리 선호도 및 가격대 설정 |
| NavigateToHotel | 호텔로 돌아가기. 현재 위치 기준 호텔까지의 길찾기 실행 |
| Bookmark | 나중에 방문하기 위해 저장한 맛집 |
| VisitHistory | 여행자가 실제 방문한 맛집 기록 |
| NearbyRestaurant | 현재 위치(또는 호텔) 반경 내 맛집 |
| PriceRange | 가격대. € (저가) ~ €€€€ (고가) 4단계 |
| AIRecommendation | 여행자 선호도와 현재 상황을 반영한 맛집 추천 |

---

## 도메인 이벤트 전체 목록

| 이벤트명 | 발생 Aggregate | 발생 시점 | 주요 페이로드 |
|---------|--------------|----------|-------------|
| `RestaurantReviewAdded` | Restaurant | 리뷰 추가 시 | restaurantId, reviewId, newRating |
| `RestaurantInfoUpdated` | Restaurant | 맛집 정보 수정 시 | restaurantId, changedFields |
| `MichelinStarAwarded` | Restaurant | 미슐랭 스타 획득/변경 시 | restaurantId, stars, year |
| `ItineraryCreated` | Itinerary | 여행 일정 생성 시 | itineraryId, travelerId, startDate |
| `ItineraryItemAdded` | Itinerary | 일정에 맛집 추가 시 | itineraryId, restaurantId, timeSlot |
| `ItineraryItemRemoved` | Itinerary | 일정에서 맛집 삭제 시 | itineraryId, itemId |
| `RestaurantBookmarked` | Traveler | 즐겨찾기 추가 시 | travelerId, restaurantId |
| `RestaurantVisited` | Traveler | 방문 기록 시 | travelerId, restaurantId, visitedAt |
| `TravelerPreferenceUpdated` | Traveler | 선호도 변경 시 | travelerId, newPreference |

---

## 요약

| 항목 | 수량 | 목록 |
|------|------|------|
| Bounded Context | 4 | Restaurant Discovery, Itinerary Planning, Traveler Profile, Location & Navigation |
| Aggregate | 4 | Restaurant, Itinerary, Traveler, HotelReference |
| Entity | 5 | Restaurant, Review, Itinerary, ItineraryItem, Traveler |
| Value Object | 9 | Coordinates, Address, OperatingHours, Rating, MichelinInfo, TimeSlot, FoodPreference, DistanceResult, HotelInfo |
| Domain Event | 9 | 위 표 참조 |
| Domain Service | 3 | DistanceCalculationService, AIRecommendationService, NavigationService |
| Repository Interface | 4 | RestaurantRepository, ItineraryRepository, TravelerRepository, (HotelReference는 상수) |
| Use Case | 8 | BrowseRestaurants, FilterByCategory, SearchNearby, ViewRestaurantDetail, NavigateToHotel, CreateItinerary, GetAIRecommendation, ViewMichelinRestaurants |
| Actor | 5 | Traveler, Guest, AI Recommender, Location Service, Navigation Service |
