# TDD 전략: 스페인 바르셀로나 맛집 관광 앱 (Spaingogo)

## 개요

Inside-Out(Bottom-Up) 접근법을 사용합니다. 순수 도메인 로직(거리 계산, 필터링)을 먼저 검증하고,
Application 레이어(유스케이스), Presentation 레이어(컴포넌트) 순으로 진행합니다.

Red-Green-Refactor 사이클 원칙:
- 실패하는 테스트를 먼저 작성하고 구현은 없는 상태에서 시작
- 테스트를 통과시키는 최소한의 코드만 작성
- 모든 테스트가 통과한 후 리팩토링 진행

호텔 기준 좌표: `{ lat: 41.3983, lng: 2.1969 }` (바르셀로나 그라시아 지구 기준점)

---

## 테스트 피라미드 분포

| 레이어 | 테스트 수 (예상) | 비율 | 커버리지 목표 |
|--------|----------------|------|-------------|
| Unit 테스트 (도메인/유틸) | 55개 | 65% | 95%+ |
| Integration 테스트 (유스케이스) | 20개 | 24% | 85%+ |
| E2E / Component 테스트 | 10개 | 11% | 70%+ |
| **합계** | **85개** | 100% | — |

**Unit 테스트 실행 시간 목표**: 개별 테스트 < 5ms, 전체 Suite < 3초
**Integration 테스트 실행 시간 목표**: 개별 테스트 < 50ms

---

## Mock/Fake 전략

| 의존성 | 전략 | 이유 |
|--------|------|------|
| `RestaurantRepository` | InMemory Fake | 빠르고 리팩토링에 강함. DB 없이 CRUD 검증 가능 |
| `BookmarkRepository` | InMemory Fake | 저장/삭제 시나리오를 독립적으로 검증 |
| `ScheduleRepository` | InMemory Fake | 일정 CRUD를 격리하여 검증 |
| `GeolocationAPI` (브라우저 GPS) | Mock | 브라우저 API이므로 테스트 환경에서 직접 호출 불가 |
| `AIRecommendationService` | Mock/Stub | 외부 AI API 호출 비용 및 비결정론적 응답 방지 |
| `NavigationService` (경로 안내) | Mock | 외부 지도 API (Google Maps 등) 의존성 격리 |
| `Date` (일정 날짜) | Stub (jest.useFakeTimers) | 시간 의존 로직의 결정론적 테스트 |

**Fake 구현 위치**: `src/__tests__/fakes/`

---

## 테스트 케이스 목록 (TDD 실행 순서)

---

### Phase 1: Value Object 테스트

파일 위치: `src/__tests__/domain/value-objects/`

#### 1-1. Coordinate (좌표) Value Object 테스트

**테스트 1: `Coordinate_validLatLng_createsSuccessfully`**
```
Given: 유효한 위도 41.3983, 경도 2.1969
When:  new Coordinate(41.3983, 2.1969) 호출
Then:  lat === 41.3983, lng === 2.1969 인 Coordinate 객체 반환
```
> 구현 힌트: 불변 객체로 설계. `Object.freeze()` 또는 readonly 필드 사용

**테스트 2: `Coordinate_latitudeOutOfRange_throwsInvalidCoordinateError`**
```
Given: 유효 범위를 벗어난 위도 값 91.0
When:  new Coordinate(91.0, 2.1969) 호출
Then:  InvalidCoordinateError 발생, 메시지: "위도는 -90 ~ 90 사이여야 합니다"
```

**테스트 3: `Coordinate_longitudeOutOfRange_throwsInvalidCoordinateError`**
```
Given: 유효 범위를 벗어난 경도 값 181.0
When:  new Coordinate(41.3983, 181.0) 호출
Then:  InvalidCoordinateError 발생, 메시지: "경도는 -180 ~ 180 사이여야 합니다"
```

**테스트 4: `Coordinate_sameValues_areEqual`**
```
Given: 동일한 좌표값으로 생성된 두 Coordinate 인스턴스 a, b
When:  a.equals(b) 호출
Then:  true 반환
```

**테스트 5: `Coordinate_differentValues_areNotEqual`**
```
Given: 좌표가 다른 두 Coordinate 인스턴스 a (41.3983, 2.1969), b (41.4000, 2.2000)
When:  a.equals(b) 호출
Then:  false 반환
```

---

#### 1-2. Distance (거리) Value Object 테스트

**테스트 6: `Distance_validMeters_createsSuccessfully`**
```
Given: 양수 거리값 500 (미터)
When:  Distance.fromMeters(500) 호출
Then:  meters === 500, kilometers === 0.5 인 Distance 객체 반환
```

**테스트 7: `Distance_negativeValue_throwsInvalidDistanceError`**
```
Given: 음수 거리값 -100
When:  Distance.fromMeters(-100) 호출
Then:  InvalidDistanceError 발생
```

**테스트 8: `Distance_toDisplayString_formatsCorrectly`**
```
Given: Distance.fromMeters(1500)
When:  distance.toDisplayString() 호출
Then:  "1.5 km" 반환
```

**테스트 9: `Distance_underOneKm_displaysInMeters`**
```
Given: Distance.fromMeters(350)
When:  distance.toDisplayString() 호출
Then:  "350 m" 반환
```

---

#### 1-3. Rating (평점) Value Object 테스트

**테스트 10: `Rating_validValue_createsSuccessfully`**
```
Given: 유효한 평점 4.5
When:  new Rating(4.5) 호출
Then:  value === 4.5 인 Rating 객체 반환
```

**테스트 11: `Rating_exceedsMaximum_throwsInvalidRatingError`**
```
Given: 최대값 초과 평점 5.1
When:  new Rating(5.1) 호출
Then:  InvalidRatingError 발생, 메시지: "평점은 0.0 ~ 5.0 사이여야 합니다"
```

**테스트 12: `Rating_belowMinimum_throwsInvalidRatingError`**
```
Given: 최솟값 미만 평점 -0.1
When:  new Rating(-0.1) 호출
Then:  InvalidRatingError 발생
```

---

#### 1-4. Category (카테고리) Value Object 테스트

**테스트 13: `Category_validSpanishFood_createsSuccessfully`**
```
Given: 유효한 카테고리 문자열 "타파스"
When:  Category.from("타파스") 호출
Then:  value === "타파스" 인 Category 객체 반환
```

**테스트 14: `Category_invalidCategory_throwsInvalidCategoryError`**
```
Given: 허용되지 않은 카테고리 "피자"
When:  Category.from("피자") 호출
Then:  InvalidCategoryError 발생, 메시지에 허용 카테고리 목록 포함
```
> 구현 힌트: 허용값 = ["타파스", "파에야", "핀초스", "츄러스", "하몬", "해산물"]

**테스트 15: `Category_allAllowedCategories_createSuccessfully`**
```
Given: 허용된 카테고리 목록 ["타파스", "파에야", "핀초스", "츄러스", "하몬", "해산물"]
When:  각 카테고리로 Category.from() 호출
Then:  모두 예외 없이 생성 성공
```

---

### Phase 2: 도메인 서비스 테스트 (핵심 비즈니스 로직)

파일 위치: `src/__tests__/domain/services/`

#### 2-1. DistanceCalculator (거리 계산 서비스) 테스트

> 알고리즘: Haversine Formula 사용 (구면 삼각법 기반 두 좌표 간 거리 계산)
> 호텔 기준: `{ lat: 41.3983, lng: 2.1969 }`

**테스트 16: `calculateDistance_hotelToSamePoint_returnsZero`**
```
Given: 호텔 좌표 (41.3983, 2.1969)와 동일한 좌표
When:  calculateDistance(hotel, hotel) 호출
Then:  Distance.fromMeters(0) 반환 (또는 오차 범위 1m 이내)
```

**테스트 17: `calculateDistance_hotelToKnownRestaurant_returnsAccurateDistance`**
```
Given: 호텔 (41.3983, 2.1969), 맛집 A (41.4000, 2.2000) — 실제 약 230m 거리
When:  calculateDistance(hotel, restaurantA) 호출
Then:  반환값이 200m ~ 260m 범위 내 (10% 오차 허용)
```
> 구현 힌트: Haversine 공식. R=6371000m 지구 반경 사용

**테스트 18: `calculateDistance_symmetry_sameResultBothDirections`**
```
Given: 두 좌표 A (41.3983, 2.1969), B (41.4100, 2.2100)
When:  calculateDistance(A, B), calculateDistance(B, A) 각각 호출
Then:  두 결과값이 동일 (거리의 대칭성)
```

**테스트 19: `calculateDistances_multipleRestaurants_sortedByDistanceAscending`**
```
Given: 호텔 좌표, 거리가 다른 맛집 3개 [500m, 200m, 800m 위치에 있는 맛집]
When:  calculateAndSortByDistance(hotel, restaurants) 호출
Then:  [200m 맛집, 500m 맛집, 800m 맛집] 순서로 정렬된 배열 반환
```

---

#### 2-2. RestaurantFilter (맛집 필터링 서비스) 테스트

**테스트 20: `filterByCategory_tapasCategorySelected_returnsOnlyTapasRestaurants`**
```
Given: 카테고리가 각각 타파스/파에야/핀초스인 맛집 3개
When:  filterByCategory(restaurants, Category.from("타파스")) 호출
Then:  타파스 맛집 1개만 포함된 배열 반환
```

**테스트 21: `filterByCategory_noMatchingCategory_returnsEmptyArray`**
```
Given: 타파스/파에야 맛집만 있는 목록
When:  filterByCategory(restaurants, Category.from("츄러스")) 호출
Then:  빈 배열 [] 반환
```

**테스트 22: `filterByMinRating_ratingThreshold4point5_returnsHighRatedOnly`**
```
Given: 평점이 각각 3.0 / 4.0 / 4.5 / 5.0 인 맛집 4개
When:  filterByMinRating(restaurants, new Rating(4.5)) 호출
Then:  평점 4.5, 5.0 인 맛집 2개만 반환
```

**테스트 23: `filterByMaxDistance_500mRadius_returnsNearbyOnly`**
```
Given: 호텔로부터 200m / 450m / 600m / 1200m 거리의 맛집 4개
When:  filterByMaxDistance(restaurants, Distance.fromMeters(500)) 호출
Then:  200m, 450m 맛집 2개만 반환
```

**테스트 24: `filterCombined_categoryAndRatingAndDistance_appliesAllFilters`**
```
Given: 다양한 카테고리/평점/거리의 맛집 10개
When:  filter({ category: "타파스", minRating: 4.0, maxDistance: 500 }) 호출
Then:  세 조건을 모두 만족하는 맛집만 반환
```

**테스트 25: `filterByCategory_multipleCategories_returnsAllMatching`**
```
Given: 타파스/파에야/핀초스/츄러스 맛집 각 2개씩 총 8개
When:  filterByCategories(restaurants, ["타파스", "파에야"]) 호출
Then:  타파스 2개 + 파에야 2개 = 4개 반환
```

---

#### 2-3. BookmarkService (북마크 서비스) 테스트

**테스트 26: `addBookmark_newRestaurant_savesSuccessfully`**
```
Given: InMemory BookmarkRepository (비어있음), 맛집 ID "rest-001"
When:  bookmarkService.add("user-1", "rest-001") 호출
Then:  repository에 북마크 1개 저장, isBookmarked("user-1", "rest-001") === true
```

**테스트 27: `addBookmark_alreadyBookmarked_throwsDuplicateBookmarkError`**
```
Given: 이미 "rest-001"을 북마크한 사용자 "user-1"
When:  bookmarkService.add("user-1", "rest-001") 재호출
Then:  DuplicateBookmarkError 발생
```

**테스트 28: `removeBookmark_existingBookmark_removesSuccessfully`**
```
Given: "rest-001"을 북마크한 사용자 "user-1"
When:  bookmarkService.remove("user-1", "rest-001") 호출
Then:  repository에서 해당 북마크 삭제, isBookmarked("user-1", "rest-001") === false
```

**테스트 29: `removeBookmark_nonExistentBookmark_throwsBookmarkNotFoundError`**
```
Given: 북마크가 없는 빈 repository
When:  bookmarkService.remove("user-1", "rest-999") 호출
Then:  BookmarkNotFoundError 발생
```

**테스트 30: `getBookmarks_userWithMultipleBookmarks_returnsAllBookmarks`**
```
Given: "user-1"이 "rest-001", "rest-002", "rest-003" 북마크
When:  bookmarkService.getAll("user-1") 호출
Then:  3개의 북마크 정보 배열 반환
```

---

#### 2-4. ScheduleService (일정 관리 서비스) 테스트

**테스트 31: `addSchedule_validDateAndRestaurant_createsSchedule`**
```
Given: 미래 날짜 "2026-03-15T12:00:00Z", 맛집 ID "rest-001"
When:  scheduleService.add({ restaurantId: "rest-001", visitDate: "2026-03-15T12:00:00Z", memo: "점심" }) 호출
Then:  고유 ID를 가진 Schedule 엔티티 생성, repository에 저장
```

**테스트 32: `addSchedule_pastDate_throwsPastDateError`**
```
Given: 현재 시각 2026-02-25T10:00:00Z (jest.useFakeTimers로 고정),
       과거 날짜 "2026-02-20T12:00:00Z"
When:  scheduleService.add({ visitDate: "2026-02-20T12:00:00Z", ... }) 호출
Then:  PastDateError 발생, 메시지: "과거 날짜에는 일정을 추가할 수 없습니다"
```

**테스트 33: `updateSchedule_existingSchedule_updatesSuccessfully`**
```
Given: 기존 일정 ID "sched-001" (방문일: 2026-03-15)
When:  scheduleService.update("sched-001", { memo: "저녁으로 변경" }) 호출
Then:  메모가 업데이트된 Schedule 반환, 원본 visitDate는 유지
```

**테스트 34: `deleteSchedule_existingSchedule_removesSuccessfully`**
```
Given: 일정 ID "sched-001"이 repository에 존재
When:  scheduleService.delete("sched-001") 호출
Then:  repository에서 해당 일정 삭제, getById("sched-001") → null 반환
```

**테스트 35: `getSchedulesSortedByDate_multipleSchedules_returnsSortedAscending`**
```
Given: 방문일이 각각 3월20일, 3월10일, 3월15일인 일정 3개
When:  scheduleService.getAllSorted() 호출
Then:  3월10일 → 3월15일 → 3월20일 오름차순 정렬 반환
```

---

### Phase 3: Application 레이어 테스트 (Integration Tests)

파일 위치: `src/__tests__/application/`

> 이 레이어는 InMemory Fake Repository + 외부 서비스 Mock 조합 사용

#### 3-1. SearchRestaurantsUseCase 테스트

**테스트 36: `searchRestaurants_noFilters_returnsAllRestaurantsSortedByDistance`**
```
Given: InMemory Fake에 5개 맛집 데이터, 호텔 좌표 (41.3983, 2.1969)
When:  searchRestaurants({ filters: {} }) 호출
Then:  5개 맛집이 호텔로부터 거리 오름차순 정렬로 반환
       각 맛집에 distance 필드 포함
```

**테스트 37: `searchRestaurants_withCategoryFilter_returnsFilteredAndSortedResults`**
```
Given: 타파스 3개, 파에야 2개 맛집 (다양한 거리)
When:  searchRestaurants({ filters: { category: "타파스" } }) 호출
Then:  타파스 3개만 거리 오름차순으로 반환
```

**테스트 38: `searchRestaurants_emptyRepository_returnsEmptyArray`**
```
Given: 아무 데이터도 없는 InMemory Fake
When:  searchRestaurants({}) 호출
Then:  빈 배열 [] 반환, 에러 없음
```

---

#### 3-2. GetNearbyRestaurantsUseCase (GPS 기반) 테스트

**테스트 39: `getNearbyRestaurants_gpsAvailable_returnsRestaurantsWithinRadius`**
```
Given: GeolocationAPI Mock → 현재 위치 (41.3990, 2.1975) 반환
       Fake Repository에 반경 300m 내 3개, 반경 밖 2개 맛집
When:  getNearbyRestaurants({ radiusMeters: 300 }) 호출
Then:  반경 내 3개 맛집 반환, 현재 위치 기준 거리 포함
```

**테스트 40: `getNearbyRestaurants_gpsUnavailable_throwsGeolocationUnavailableError`**
```
Given: GeolocationAPI Mock → GeolocationPositionError 발생 (권한 거부)
When:  getNearbyRestaurants({ radiusMeters: 500 }) 호출
Then:  GeolocationUnavailableError 발생, 메시지: "위치 권한이 필요합니다"
```

**테스트 41: `getNearbyRestaurants_gpsTimeout_throwsGeolocationTimeoutError`**
```
Given: GeolocationAPI Mock → 타임아웃 발생
When:  getNearbyRestaurants({ radiusMeters: 500, timeoutMs: 5000 }) 호출
Then:  GeolocationTimeoutError 발생
```

---

#### 3-3. GetAIRecommendationsUseCase 테스트

**테스트 42: `getAIRecommendations_validPreferences_returnsRecommendedRestaurants`**
```
Given: 사용자 취향 { favoriteCategories: ["타파스", "해산물"], minRating: 4.0 }
       AIRecommendationService Mock → ["rest-001", "rest-003"] 반환
       Fake Repository에 해당 맛집 데이터 존재
When:  getAIRecommendations(preferences) 호출
Then:  추천 맛집 2개 반환, 각 맛집에 추천 이유(reason) 필드 포함
```

**테스트 43: `getAIRecommendations_aiServiceFails_throwsAIServiceError`**
```
Given: AIRecommendationService Mock → 네트워크 오류 발생
When:  getAIRecommendations(preferences) 호출
Then:  AIServiceError 발생, 사용자 친화적 메시지 포함
```

**테스트 44: `getAIRecommendations_noMatchingRestaurants_returnsEmptyWithMessage`**
```
Given: AIRecommendationService Mock → 빈 배열 반환
When:  getAIRecommendations(preferences) 호출
Then:  빈 배열 반환, 에러는 발생하지 않음
```

---

#### 3-4. ManageBookmarkUseCase 테스트

**테스트 45: `toggleBookmark_unbookmarked_addsBookmarkAndReturnsTrue`**
```
Given: 북마크 없는 상태, 사용자 "user-1", 맛집 "rest-001"
When:  toggleBookmark("user-1", "rest-001") 호출
Then:  북마크 추가, isBookmarked: true 반환
```

**테스트 46: `toggleBookmark_alreadyBookmarked_removesBookmarkAndReturnsFalse`**
```
Given: "user-1"이 "rest-001" 북마크한 상태
When:  toggleBookmark("user-1", "rest-001") 호출
Then:  북마크 제거, isBookmarked: false 반환
```

---

#### 3-5. GetHotelNavigationUseCase 테스트

**테스트 47: `getHotelNavigation_validCurrentLocation_returnsRouteToHotel`**
```
Given: 현재 위치 (41.4100, 2.2200), 호텔 고정 좌표 (41.3983, 2.1969)
       NavigationService Mock → { duration: "15분", distance: "1.2km", steps: [...] } 반환
When:  getHotelNavigation(currentLocation) 호출
Then:  호텔까지의 경로 정보 반환, destination이 호텔 좌표인지 확인
```

**테스트 48: `getHotelNavigation_alreadyAtHotel_returnsZeroDistance`**
```
Given: 현재 위치 = 호텔 좌표 (41.3983, 2.1969) (오차 10m 이내)
When:  getHotelNavigation(hotelCoordinate) 호출
Then:  "이미 호텔 근처입니다" 메시지 반환, distance: "0m"
```

---

#### 3-6. ManageScheduleUseCase 테스트

**테스트 49: `createSchedule_restaurantExists_createsAndSavesSchedule`**
```
Given: Fake Repository에 "rest-001" 존재, 미래 날짜 "2026-03-20T19:00:00Z"
When:  createSchedule({ restaurantId: "rest-001", visitDate: "2026-03-20T19:00:00Z" }) 호출
Then:  Schedule 저장, 생성된 schedule.id가 non-null string
```

**테스트 50: `createSchedule_restaurantNotFound_throwsRestaurantNotFoundError`**
```
Given: Fake Repository가 비어있음 (맛집 없음)
When:  createSchedule({ restaurantId: "rest-999", visitDate: "2026-03-20" }) 호출
Then:  RestaurantNotFoundError 발생
```

---

### Phase 4: Presentation 레이어 테스트 (Component Tests)

파일 위치: `src/__tests__/components/`

> React Testing Library 사용. 사용자 관점의 행동(behavior) 중심 테스트

#### 4-1. RestaurantCard 컴포넌트 테스트

**테스트 51: `RestaurantCard_renders_displaysRestaurantInfo`**
```
Given: Restaurant 데이터 { name: "바르셀로나 타파스", category: "타파스", rating: 4.5, distance: 350 }
When:  <RestaurantCard restaurant={...} /> 렌더링
Then:  "바르셀로나 타파스" 텍스트 표시
       "타파스" 카테고리 배지 표시
       "4.5 ★" 평점 표시
       "350 m" 거리 표시
```

**테스트 52: `RestaurantCard_bookmarkButton_togglesOnClick`**
```
Given: 북마크 안된 상태의 RestaurantCard 렌더링
When:  사용자가 북마크 버튼 클릭
Then:  onBookmarkToggle 콜백 호출됨 (restaurantId 파라미터 포함)
       버튼 아이콘/스타일이 북마크된 상태로 변경
```

**테스트 53: `RestaurantCard_distanceOver1km_displaysInKilometers`**
```
Given: distance: 1500 (미터) 인 맛집 데이터
When:  <RestaurantCard restaurant={...} /> 렌더링
Then:  "1.5 km" 형식으로 표시 (미터 단위 표시 안됨)
```

---

#### 4-2. FilterPanel 컴포넌트 테스트

**테스트 54: `FilterPanel_renders_showsAllCategories`**
```
Given: FilterPanel 컴포넌트 렌더링
When:  초기 렌더링
Then:  "타파스", "파에야", "핀초스", "츄러스", "하몬", "해산물" 6개 카테고리 버튼 표시
```

**테스트 55: `FilterPanel_categorySelected_callsOnFilterChange`**
```
Given: FilterPanel 렌더링, onFilterChange 콜백 Mock
When:  사용자가 "파에야" 버튼 클릭
Then:  onFilterChange({ category: "파에야" }) 호출
       "파에야" 버튼이 선택된 상태(활성화 스타일)로 변경
```

**테스트 56: `FilterPanel_ratingSliderChanged_callsOnFilterChange`**
```
Given: FilterPanel 렌더링, 평점 슬라이더 존재
When:  사용자가 평점 슬라이더를 4.0으로 변경
Then:  onFilterChange({ minRating: 4.0 }) 호출
```

---

#### 4-3. ScheduleList 컴포넌트 테스트

**테스트 57: `ScheduleList_withSchedules_displaysAllItems`**
```
Given: 일정 3개 데이터 배열
When:  <ScheduleList schedules={[...]} /> 렌더링
Then:  3개의 일정 아이템 표시, 각 맛집명과 방문 날짜 텍스트 확인
```

**테스트 58: `ScheduleList_deleteButton_callsOnDelete`**
```
Given: 일정 1개가 있는 ScheduleList, onDelete 콜백 Mock
When:  삭제 버튼 클릭
Then:  onDelete("sched-001") 호출
```

**테스트 59: `ScheduleList_empty_displaysEmptyMessage`**
```
Given: 빈 배열 schedules={[]}
When:  <ScheduleList schedules={[]} /> 렌더링
Then:  "아직 추가한 일정이 없습니다" 또는 유사한 안내 텍스트 표시
```

---

#### 4-4. HotelNavigationButton 컴포넌트 테스트

**테스트 60: `HotelNavigationButton_clicked_callsNavigationHandler`**
```
Given: onNavigate 콜백 Mock, HotelNavigationButton 렌더링
When:  "호텔로 돌아가기" 버튼 클릭
Then:  onNavigate() 콜백 호출
```

---

## 엣지 케이스 목록

| 케이스 | 설명 | 예상 동작 |
|--------|------|---------|
| 극좌표 근처 좌표 | 위도 90.0, 경도 180.0 경계값 | 유효한 Coordinate로 생성 (경계 포함) |
| 동일 위치 거리 | 호텔 좌표와 동일한 맛집 | Distance.fromMeters(0) 반환, "0 m" 표시 |
| 필터 결과 없음 | 모든 조건 적용 시 매칭 맛집 0개 | 빈 배열 반환, "검색 결과가 없습니다" UI 표시 |
| GPS 권한 거부 | 사용자가 위치 권한 거부 | 호텔 좌표 기준으로 폴백(fallback) 탐색 |
| AI 서비스 지연 | AI 응답 5초 초과 | 타임아웃 처리, 로딩 UI → 오류 메시지 전환 |
| 북마크 한도 초과 | 50개 이상 북마크 시도 (비즈니스 규칙 있다면) | BookmarkLimitExceededError 발생 |
| 일정 날짜 당일 | 오늘 날짜로 일정 등록 시도 | 허용(오늘은 미래로 간주) 또는 명시적 정책 정의 필요 |
| 맛집 데이터 null 필드 | name이 null인 맛집 데이터 | 렌더링 오류 없이 "이름 없음" 폴백 표시 |
| 네트워크 오프라인 | API 요청 실패 | 캐시된 데이터 표시 또는 오프라인 안내 |
| 평점 소수점 | 평점 4.55555 입력 | 소수점 1자리로 반올림 처리 (4.6) |

---

## 테스트 데이터 전략

| 타입 | 유효한 예시 | 유효하지 않은 예시 |
|------|-----------|----------------|
| 위도(Latitude) | `41.3983`, `0.0`, `-90.0`, `90.0` | `90.1`, `-90.1`, `NaN`, `null` |
| 경도(Longitude) | `2.1969`, `0.0`, `-180.0`, `180.0` | `180.1`, `-180.1`, `undefined` |
| 평점(Rating) | `4.5`, `0.0`, `5.0`, `3.7` | `5.1`, `-0.1`, `"4.5"(문자열)` |
| 카테고리 | `"타파스"`, `"파에야"`, `"해산물"` | `"피자"`, `""`, `"TAPAS"(영문)` |
| 거리(Distance) | `0`, `350`, `1500`, `10000` | `-1`, `-100` |
| 방문 날짜 | `"2026-03-15T12:00:00Z"` (미래) | `"2026-02-20T12:00:00Z"` (과거), `"invalid-date"` |
| 맛집 ID | `"rest-001"`, `"uuid-v4-format"` | `""`, `null` |

---

## 파일 구조 가이드

```
src/
├── domain/
│   ├── value-objects/
│   │   ├── Coordinate.ts
│   │   ├── Distance.ts
│   │   ├── Rating.ts
│   │   └── Category.ts
│   ├── entities/
│   │   ├── Restaurant.ts
│   │   ├── Bookmark.ts
│   │   └── Schedule.ts
│   ├── services/
│   │   ├── DistanceCalculator.ts
│   │   ├── RestaurantFilter.ts
│   │   ├── BookmarkService.ts
│   │   └── ScheduleService.ts
│   └── errors/
│       ├── InvalidCoordinateError.ts
│       ├── InvalidRatingError.ts
│       ├── InvalidCategoryError.ts
│       ├── DuplicateBookmarkError.ts
│       ├── BookmarkNotFoundError.ts
│       ├── PastDateError.ts
│       └── RestaurantNotFoundError.ts
├── application/
│   ├── SearchRestaurantsUseCase.ts
│   ├── GetNearbyRestaurantsUseCase.ts
│   ├── GetAIRecommendationsUseCase.ts
│   ├── ManageBookmarkUseCase.ts
│   ├── ManageScheduleUseCase.ts
│   └── GetHotelNavigationUseCase.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── IRestaurantRepository.ts
│   │   ├── IBookmarkRepository.ts
│   │   └── IScheduleRepository.ts
│   └── services/
│       ├── IAIRecommendationService.ts
│       ├── IGeolocationService.ts
│       └── INavigationService.ts
└── __tests__/
    ├── fakes/
    │   ├── InMemoryRestaurantRepository.ts
    │   ├── InMemoryBookmarkRepository.ts
    │   └── InMemoryScheduleRepository.ts
    ├── domain/
    │   ├── value-objects/
    │   │   ├── Coordinate.test.ts       (테스트 1~5)
    │   │   ├── Distance.test.ts         (테스트 6~9)
    │   │   ├── Rating.test.ts           (테스트 10~12)
    │   │   └── Category.test.ts         (테스트 13~15)
    │   └── services/
    │       ├── DistanceCalculator.test.ts  (테스트 16~19)
    │       ├── RestaurantFilter.test.ts    (테스트 20~25)
    │       ├── BookmarkService.test.ts     (테스트 26~30)
    │       └── ScheduleService.test.ts     (테스트 31~35)
    ├── application/
    │   ├── SearchRestaurantsUseCase.test.ts     (테스트 36~38)
    │   ├── GetNearbyRestaurantsUseCase.test.ts  (테스트 39~41)
    │   ├── GetAIRecommendationsUseCase.test.ts  (테스트 42~44)
    │   ├── ManageBookmarkUseCase.test.ts        (테스트 45~46)
    │   ├── GetHotelNavigationUseCase.test.ts    (테스트 47~48)
    │   └── ManageScheduleUseCase.test.ts        (테스트 49~50)
    └── components/
        ├── RestaurantCard.test.tsx    (테스트 51~53)
        ├── FilterPanel.test.tsx       (테스트 54~56)
        ├── ScheduleList.test.tsx      (테스트 57~59)
        └── HotelNavigationButton.test.tsx (테스트 60)
```

---

## TDD 실행 순서 요약 (Inside-Out)

```
RED → GREEN → REFACTOR

Week 1: Phase 1 (Value Objects)
  Day 1: Coordinate + Distance (테스트 1~9)
  Day 2: Rating + Category (테스트 10~15)

Week 1: Phase 2 (Domain Services)
  Day 3: DistanceCalculator (테스트 16~19)
  Day 4: RestaurantFilter (테스트 20~25)
  Day 5: BookmarkService + ScheduleService (테스트 26~35)

Week 2: Phase 3 (Application / Use Cases)
  Day 6: SearchRestaurants + GetNearby (테스트 36~41)
  Day 7: AIRecommendations + Bookmark (테스트 42~46)
  Day 8: Navigation + Schedule (테스트 47~50)

Week 2: Phase 4 (Components)
  Day 9: RestaurantCard + FilterPanel (테스트 51~56)
  Day 10: ScheduleList + NavigationButton (테스트 57~60)
```

---

## Jest 설정 참고

```json
// jest.config.ts
{
  "testEnvironment": "jsdom",
  "setupFilesAfterFramework": ["@testing-library/jest-dom"],
  "testPathPattern": [
    "src/__tests__/domain/**/*.test.ts",
    "src/__tests__/application/**/*.test.ts",
    "src/__tests__/components/**/*.test.tsx"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 85,
      "functions": 90,
      "lines": 90,
      "statements": 90
    }
  }
}
```

```typescript
// src/__tests__/fakes/InMemoryRestaurantRepository.ts 예시
export class InMemoryRestaurantRepository implements IRestaurantRepository {
  private store = new Map<string, Restaurant>();

  async findById(id: string): Promise<Restaurant | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Restaurant[]> {
    return Array.from(this.store.values());
  }

  async save(restaurant: Restaurant): Promise<void> {
    this.store.set(restaurant.id, restaurant);
  }

  // 테스트 헬퍼: 초기 데이터 시딩
  seed(restaurants: Restaurant[]): void {
    restaurants.forEach(r => this.store.set(r.id, r));
  }

  clear(): void {
    this.store.clear();
  }
}
```
