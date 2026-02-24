# 구현 체크리스트: Spaingogo (스페인고고)

> 바르셀로나 맛집 관광 앱 - TDD + Clean Architecture 기반 구현 순서
> 기준 호텔: Hotel & SPA Villa Olimpic@Suites (41.3983, 2.1969)
> 작성일: 2026-02-25

---

## Phase 0: 프로젝트 초기 설정

### 0-1. 프로젝트 초기화

- [ ] Next.js 16+ 프로젝트 생성
  ```bash
  npx create-next-app@latest spaingogo --typescript --tailwind --app --src-dir --import-alias "@/*"
  ```
- [ ] 테스트 프레임워크 설치
  ```bash
  npm install -D jest @types/jest ts-jest jest-environment-jsdom
  npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
  ```
- [ ] shadcn/ui 초기화
  ```bash
  npx shadcn-ui@latest init
  ```
- [ ] 추가 의존성 설치
  ```bash
  npm install @anthropic-ai/sdk
  npm install -D @types/node
  ```

### 0-2. 폴더 구조 생성

```bash
mkdir -p src/domain/{entities,value-objects,repositories,services}
mkdir -p src/domain/value-objects/__tests__
mkdir -p src/domain/entities/__tests__
mkdir -p src/domain/services/__tests__
mkdir -p src/application/{use-cases,ports,dtos}
mkdir -p src/application/use-cases/__tests__
mkdir -p src/adapters/{repositories,services}
mkdir -p src/adapters/repositories/__tests__
mkdir -p src/infrastructure/{config,di,data}
mkdir -p src/components/{ui,restaurant,hotel,bookmark,search,filter}
mkdir -p src/__tests__/integration
```

### 0-3. Jest 설정

- [ ] `jest.config.ts` 생성
  ```typescript
  // jest.config.ts
  import type { Config } from 'jest'

  const config: Config = {
    testEnvironment: 'node',
    transform: { '^.+\\.tsx?$': 'ts-jest' },
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
    testPathPattern: '__tests__',
    collectCoverageFrom: [
      'src/domain/**/*.ts',
      'src/application/**/*.ts',
      '!**/__tests__/**',
    ],
    coverageThreshold: {
      global: { branches: 90, functions: 90, lines: 90, statements: 90 },
    },
  }
  export default config
  ```

- [ ] `jest.setup.ts` 생성 (DOM 테스트용)
  ```typescript
  import '@testing-library/jest-dom'
  ```

- [ ] `package.json` 스크립트 추가
  ```json
  {
    "scripts": {
      "test": "jest",
      "test:watch": "jest --watch",
      "test:coverage": "jest --coverage",
      "test:domain": "jest src/domain",
      "test:app": "jest src/application",
      "test:integration": "jest src/__tests__/integration"
    }
  }
  ```

### 0-4. TypeScript 경로 설정 확인

- [ ] `tsconfig.json` paths 확인
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "paths": { "@/*": ["./src/*"] }
    }
  }
  ```

---

## Phase 1: Domain Layer - Value Objects

> 외부 의존성 없음. 가장 먼저 구현하여 즉시 테스트 가능.

---

### 1-1. Coordinates (좌표)

**파일**: `src/domain/value-objects/Coordinates.ts`
**테스트**: `src/domain/value-objects/__tests__/Coordinates.test.ts`

**[유효한 좌표 생성]**
- [ ] RED: `Coordinates_validLatLng_createsInstance` 테스트 작성
  ```typescript
  it('유효한 위경도로 Coordinates 인스턴스를 생성한다', () => {
    const coords = new Coordinates(41.3983, 2.1969)
    expect(coords.latitude).toBe(41.3983)
    expect(coords.longitude).toBe(2.1969)
  })
  ```
- [ ] GREEN: `Coordinates` 클래스 생성, 위경도 저장
- [ ] RFCT: readonly 필드, Object.freeze 적용

**[위도 범위 검증]**
- [ ] RED: `Coordinates_latitudeOutOfRange_throwsError` 테스트 작성
  ```typescript
  it('위도가 -90~90 범위를 벗어나면 에러를 던진다', () => {
    expect(() => new Coordinates(91, 2.1969)).toThrow('Invalid latitude')
    expect(() => new Coordinates(-91, 2.1969)).toThrow('Invalid latitude')
  })
  ```
- [ ] GREEN: 위도 범위 검증 추가
- [ ] RFCT: 에러 메시지 상수화

**[경도 범위 검증]**
- [ ] RED: `Coordinates_longitudeOutOfRange_throwsError` 테스트 작성
  ```typescript
  it('경도가 -180~180 범위를 벗어나면 에러를 던진다', () => {
    expect(() => new Coordinates(41.3983, 181)).toThrow('Invalid longitude')
    expect(() => new Coordinates(41.3983, -181)).toThrow('Invalid longitude')
  })
  ```
- [ ] GREEN: 경도 범위 검증 추가
- [ ] RFCT: 검증 메서드 분리

**[동등성 비교]**
- [ ] RED: `Coordinates_sameLatLng_areEqual` 테스트 작성
  ```typescript
  it('같은 위경도의 Coordinates는 동등하다', () => {
    const a = new Coordinates(41.3983, 2.1969)
    const b = new Coordinates(41.3983, 2.1969)
    expect(a.equals(b)).toBe(true)
  })
  ```
- [ ] GREEN: `equals()` 메서드 구현
- [ ] RFCT: 부동소수점 비교 허용 오차 확인

**[호텔 좌표 상수]**
- [ ] RED: `HOTEL_COORDINATES_hasCorrectValues` 테스트 작성
- [ ] GREEN: `HOTEL_COORDINATES` 상수 정의 `(41.3983, 2.1969)`
- [ ] RFCT: 상수를 별도 파일 `src/domain/constants/hotel.ts`로 분리

**Coordinates 완료 기준**
- [ ] 위경도 범위 검증 모두 통과
- [ ] 동등성 비교 테스트 통과
- [ ] 호텔 상수 정의 완료

---

### 1-2. Distance (거리)

**파일**: `src/domain/value-objects/Distance.ts`
**테스트**: `src/domain/value-objects/__tests__/Distance.test.ts`

**[거리 단위 변환]**
- [ ] RED: `Distance_inMeters_returnsCorrectValue` 테스트 작성
  ```typescript
  it('미터 단위로 거리를 반환한다', () => {
    const d = Distance.fromMeters(500)
    expect(d.meters).toBe(500)
    expect(d.kilometers).toBe(0.5)
  })
  ```
- [ ] GREEN: `Distance` 클래스, `fromMeters()` 팩토리 메서드
- [ ] RFCT: 음수 거리 방지 검증 추가

**[도보 시간 계산]**
- [ ] RED: `Distance_walkingTime_calculatesCorrectly` 테스트 작성
  ```typescript
  it('평균 도보 속도(4km/h)로 소요 시간을 계산한다', () => {
    const d = Distance.fromMeters(400)
    expect(d.walkingMinutes).toBe(6) // 400m / (4000m/60min) = 6분
  })
  ```
- [ ] GREEN: `walkingMinutes` getter 구현
- [ ] RFCT: 도보 속도를 상수로 추출

**[거리 표시 포맷]**
- [ ] RED: `Distance_format_returns500m_or1_2km` 테스트 작성
  ```typescript
  it('1km 미만은 미터로, 이상은 km로 표시한다', () => {
    expect(Distance.fromMeters(500).format()).toBe('500m')
    expect(Distance.fromMeters(1200).format()).toBe('1.2km')
  })
  ```
- [ ] GREEN: `format()` 메서드 구현
- [ ] RFCT: 소수점 자리 정리

**Distance 완료 기준**
- [ ] 단위 변환 테스트 통과
- [ ] 도보 시간 계산 테스트 통과
- [ ] 포맷 표시 테스트 통과

---

### 1-3. RestaurantCategory (카테고리)

**파일**: `src/domain/value-objects/RestaurantCategory.ts`
**테스트**: `src/domain/value-objects/__tests__/RestaurantCategory.test.ts`

**[유효한 카테고리]**
- [ ] RED: `RestaurantCategory_validCategory_creates` 테스트 작성
  ```typescript
  it('유효한 카테고리로 인스턴스를 생성한다', () => {
    const category = new RestaurantCategory('tapas')
    expect(category.value).toBe('tapas')
  })
  ```
- [ ] GREEN: `RestaurantCategory` 클래스, 허용 목록: `tapas | paella | pintxos | churros | jamon | seafood`
- [ ] RFCT: Union 타입 별도 정의

**[무효한 카테고리]**
- [ ] RED: `RestaurantCategory_invalidCategory_throwsError` 테스트 작성
- [ ] GREEN: 허용 목록 검증 추가
- [ ] RFCT: 에러 메시지에 허용 카테고리 목록 포함

**[카테고리 한국어 라벨]**
- [ ] RED: `RestaurantCategory_koreanLabel_returnsCorrect` 테스트 작성
  ```typescript
  it('각 카테고리의 한국어 라벨을 반환한다', () => {
    expect(new RestaurantCategory('tapas').label).toBe('타파스')
    expect(new RestaurantCategory('paella').label).toBe('파에야')
    expect(new RestaurantCategory('pintxos').label).toBe('핀초스')
    expect(new RestaurantCategory('churros').label).toBe('츄러스')
    expect(new RestaurantCategory('jamon').label).toBe('하몬')
    expect(new RestaurantCategory('seafood').label).toBe('해산물')
  })
  ```
- [ ] GREEN: `label` getter 구현, 매핑 객체
- [ ] RFCT: 매핑을 상수 파일로 분리

**RestaurantCategory 완료 기준**
- [ ] 6개 카테고리 모두 유효성 통과
- [ ] 한국어 라벨 매핑 완료

---

### 1-4. SearchQuery (검색어)

**파일**: `src/domain/value-objects/SearchQuery.ts`
**테스트**: `src/domain/value-objects/__tests__/SearchQuery.test.ts`

**[유효한 검색어]**
- [ ] RED: `SearchQuery_nonEmpty_creates` 테스트 작성
- [ ] GREEN: `SearchQuery` 클래스, 빈 문자열 검증
- [ ] RFCT: trim 처리 추가

**[최소/최대 길이]**
- [ ] RED: `SearchQuery_tooShort_throwsError` / `SearchQuery_tooLong_throwsError` 테스트 작성
  - 최소: 1자, 최대: 100자
- [ ] GREEN: 길이 검증 추가
- [ ] RFCT: 에러 메시지 구체화

**[검색어 정규화]**
- [ ] RED: `SearchQuery_normalizes_lowercaseAndTrim` 테스트 작성
  ```typescript
  it('검색어를 소문자로 변환하고 앞뒤 공백을 제거한다', () => {
    const q = new SearchQuery('  바르셀로나  ')
    expect(q.normalized).toBe('바르셀로나')
  })
  ```
- [ ] GREEN: `normalized` getter 구현
- [ ] RFCT: 정리

**SearchQuery 완료 기준**
- [ ] 빈 문자열 거부 테스트 통과
- [ ] 길이 제한 테스트 통과
- [ ] 정규화 테스트 통과

---

## Phase 2: Domain Layer - Entities & Aggregates

---

### 2-1. Restaurant (핵심 엔티티)

**파일**: `src/domain/entities/Restaurant.ts`
**테스트**: `src/domain/entities/__tests__/Restaurant.test.ts`

**[레스토랑 생성]**
- [ ] RED: `Restaurant_withRequiredFields_creates` 테스트 작성
  ```typescript
  it('필수 필드로 Restaurant를 생성한다', () => {
    const restaurant = Restaurant.create({
      id: 'rest-001',
      name: 'Bar El Xampanyet',
      address: 'Carrer de la Montcada, 22, 08003 Barcelona',
      coordinates: new Coordinates(41.3843, 2.1812),
      categories: [new RestaurantCategory('tapas')],
      tags: ['전통', '와인', '현지인맛집'],
    })
    expect(restaurant.id).toBe('rest-001')
    expect(restaurant.name).toBe('Bar El Xampanyet')
  })
  ```
- [ ] GREEN: `Restaurant` 클래스, `create()` 팩토리 메서드
- [ ] RFCT: 빌더 패턴 검토

**[이름 유효성]**
- [ ] RED: `Restaurant_emptyName_throwsError` 테스트 작성
- [ ] GREEN: 이름 빈값 검증
- [ ] RFCT: 최대 길이(200자) 제한 추가

**[카테고리 필수]**
- [ ] RED: `Restaurant_noCategory_throwsError` 테스트 작성
- [ ] GREEN: 카테고리 1개 이상 필수 검증
- [ ] RFCT: 정리

**[평점 범위]**
- [ ] RED: `Restaurant_ratingOutOfRange_throwsError` 테스트 작성
  - 평점: 0.0 ~ 5.0 (선택적 필드)
- [ ] GREEN: 평점 범위 검증
- [ ] RFCT: 평점을 별도 Value Object로 추출 고려

**[검색 매칭]**
- [ ] RED: `Restaurant_matchesQuery_byNameOrAddressOrTag` 테스트 작성
  ```typescript
  it('이름, 주소, 태그로 검색 쿼리와 매칭된다', () => {
    const restaurant = Restaurant.create({ name: 'Bar El Xampanyet', tags: ['와인'] ...})
    expect(restaurant.matches(new SearchQuery('xampanyet'))).toBe(true)
    expect(restaurant.matches(new SearchQuery('와인'))).toBe(true)
    expect(restaurant.matches(new SearchQuery('피자'))).toBe(false)
  })
  ```
- [ ] GREEN: `matches()` 메서드, 대소문자 무시 검색
- [ ] RFCT: 검색 로직 최적화

**[카테고리 필터 매칭]**
- [ ] RED: `Restaurant_hasCategory_returnsCorrectBoolean` 테스트 작성
  ```typescript
  it('지정 카테고리를 가지고 있는지 확인한다', () => {
    const restaurant = Restaurant.create({ categories: [new RestaurantCategory('tapas')] ...})
    expect(restaurant.hasCategory(new RestaurantCategory('tapas'))).toBe(true)
    expect(restaurant.hasCategory(new RestaurantCategory('paella'))).toBe(false)
  })
  ```
- [ ] GREEN: `hasCategory()` 메서드 구현
- [ ] RFCT: 정리

**Restaurant 완료 기준**
- [ ] 생성 유효성 모든 케이스 통과
- [ ] 검색 매칭 (이름/주소/태그) 테스트 통과
- [ ] 카테고리 필터 테스트 통과

---

### 2-2. Bookmark (북마크 엔티티)

**파일**: `src/domain/entities/Bookmark.ts`
**테스트**: `src/domain/entities/__tests__/Bookmark.test.ts`

**[북마크 생성]**
- [ ] RED: `Bookmark_withRestaurantId_creates` 테스트 작성
  ```typescript
  it('레스토랑 ID와 저장 시각으로 Bookmark를 생성한다', () => {
    const bookmark = Bookmark.create({ restaurantId: 'rest-001' })
    expect(bookmark.restaurantId).toBe('rest-001')
    expect(bookmark.savedAt).toBeInstanceOf(Date)
  })
  ```
- [ ] GREEN: `Bookmark` 클래스 구현
- [ ] RFCT: ID 생성 로직 분리

**[중복 방지]**
- [ ] RED: `Bookmark_sameRestaurantId_isEqual` 테스트 작성
- [ ] GREEN: `equals()` 메서드 구현
- [ ] RFCT: 정리

**Bookmark 완료 기준**
- [ ] 생성 테스트 통과
- [ ] 동등성 비교 테스트 통과

---

## Phase 3: Domain Layer - Services

---

### 3-1. DistanceCalculatorService (Haversine 거리 계산)

**파일**: `src/domain/services/DistanceCalculatorService.ts`
**테스트**: `src/domain/services/__tests__/DistanceCalculatorService.test.ts`

**[Haversine 공식 - 기본 계산]**
- [ ] RED: `calculate_hotelToRestaurant_returnsCorrectDistance` 테스트 작성
  ```typescript
  it('호텔에서 사그라다 파밀리아까지 거리를 계산한다', () => {
    const hotel = new Coordinates(41.3983, 2.1969)
    const sagradaFamilia = new Coordinates(41.4036, 2.1744)
    const distance = DistanceCalculatorService.calculate(hotel, sagradaFamilia)
    // 실제 거리 약 1.8km
    expect(distance.kilometers).toBeCloseTo(1.8, 1)
  })
  ```
- [ ] GREEN: Haversine 공식 구현
  ```typescript
  // Haversine formula
  // d = 2R * arcsin(sqrt(sin²(Δlat/2) + cos(lat1)*cos(lat2)*sin²(Δlng/2)))
  ```
- [ ] RFCT: 지구 반지름 상수화 (R = 6371km)

**[동일 좌표 거리]**
- [ ] RED: `calculate_sameCoordinates_returnsZero` 테스트 작성
  ```typescript
  it('같은 좌표 간 거리는 0이다', () => {
    const coords = new Coordinates(41.3983, 2.1969)
    const distance = DistanceCalculatorService.calculate(coords, coords)
    expect(distance.meters).toBe(0)
  })
  ```
- [ ] GREEN: 동일 좌표 처리
- [ ] RFCT: 부동소수점 오차 처리

**[호텔 기준 거리]**
- [ ] RED: `calculateFromHotel_givenCoords_returnsDistance` 테스트 작성
  ```typescript
  it('호텔 좌표를 자동으로 사용하여 거리를 계산한다', () => {
    const restaurant = new Coordinates(41.3843, 2.1812)
    const distance = DistanceCalculatorService.calculateFromHotel(restaurant)
    expect(distance.kilometers).toBeGreaterThan(0)
  })
  ```
- [ ] GREEN: `calculateFromHotel()` 편의 메서드, `HOTEL_COORDINATES` 상수 사용
- [ ] RFCT: 정리

**DistanceCalculatorService 완료 기준**
- [ ] Haversine 공식 정확도 검증 (실제 거리와 오차 5% 이내)
- [ ] 동일 좌표 처리 테스트 통과
- [ ] 호텔 기준 계산 편의 메서드 통과

---

### 3-2. RestaurantSearchService (검색 서비스)

**파일**: `src/domain/services/RestaurantSearchService.ts`
**테스트**: `src/domain/services/__tests__/RestaurantSearchService.test.ts`

**[이름/태그 검색]**
- [ ] RED: `search_byQuery_returnsMatchingRestaurants` 테스트 작성
  ```typescript
  it('검색어와 일치하는 레스토랑 목록을 반환한다', () => {
    const restaurants = [tapasBar, paellaRestaurant, churreriaBar]
    const results = RestaurantSearchService.search(restaurants, new SearchQuery('타파스'))
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe(tapasBar.name)
  })
  ```
- [ ] GREEN: 검색 로직 구현 (Restaurant.matches() 활용)
- [ ] RFCT: 정렬 기준 추가 (관련도 순)

**[카테고리 필터]**
- [ ] RED: `filterByCategory_returnsOnlyMatchingCategory` 테스트 작성
  ```typescript
  it('카테고리로 필터링된 레스토랑만 반환한다', () => {
    const results = RestaurantSearchService.filterByCategory(
      restaurants,
      new RestaurantCategory('tapas')
    )
    expect(results.every(r => r.hasCategory(new RestaurantCategory('tapas')))).toBe(true)
  })
  ```
- [ ] GREEN: `filterByCategory()` 구현
- [ ] RFCT: 복수 카테고리 필터 지원

**[반경 검색]**
- [ ] RED: `filterByRadius_returnsRestaurantsWithinRange` 테스트 작성
  ```typescript
  it('지정 반경 내 레스토랑만 반환한다', () => {
    const userLocation = new Coordinates(41.3983, 2.1969)
    const results = RestaurantSearchService.filterByRadius(
      restaurants,
      userLocation,
      Distance.fromMeters(500)
    )
    expect(results.every(r => r.distanceFrom(userLocation).meters <= 500)).toBe(true)
  })
  ```
- [ ] GREEN: `filterByRadius()` 구현, DistanceCalculatorService 활용
- [ ] RFCT: 결과를 거리순 정렬

**[거리순 정렬]**
- [ ] RED: `sortByDistance_returnsAscendingOrder` 테스트 작성
- [ ] GREEN: `sortByDistance()` 구현
- [ ] RFCT: 정리

**RestaurantSearchService 완료 기준**
- [ ] 검색/필터/정렬 모든 케이스 통과
- [ ] 반경 검색 정확도 검증

---

## Phase 4: Application Layer - Use Cases

---

### 4-1. GetRestaurantListUseCase

**파일**: `src/application/use-cases/GetRestaurantListUseCase.ts`
**테스트**: `src/application/use-cases/__tests__/GetRestaurantListUseCase.test.ts`

**[Repository Interface 먼저 정의]**
- [ ] `src/domain/repositories/IRestaurantRepository.ts` 인터페이스 생성
  ```typescript
  export interface IRestaurantRepository {
    findAll(): Promise<Restaurant[]>
    findById(id: string): Promise<Restaurant | null>
    findByCategory(category: RestaurantCategory): Promise<Restaurant[]>
  }
  ```
- [ ] `src/adapters/repositories/InMemoryRestaurantRepository.ts` Fake 구현 (Map 기반)

**[전체 목록 조회]**
- [ ] RED: `execute_noFilter_returnsAllRestaurantsWithDistance` 테스트 작성
  ```typescript
  it('필터 없이 실행하면 모든 레스토랑을 호텔 거리와 함께 반환한다', async () => {
    const repo = new InMemoryRestaurantRepository([sampleRestaurant1, sampleRestaurant2])
    const useCase = new GetRestaurantListUseCase(repo)
    const result = await useCase.execute({})
    expect(result.restaurants).toHaveLength(2)
    expect(result.restaurants[0]).toHaveProperty('distanceFromHotel')
  })
  ```
- [ ] GREEN: Use Case 구현, DistanceCalculatorService로 거리 계산 주입
- [ ] RFCT: DTO 분리 (`RestaurantListItemDTO`)

**[카테고리 필터 적용]**
- [ ] RED: `execute_withCategory_returnsFilteredResults` 테스트 작성
  ```typescript
  it('카테고리 필터를 적용하면 해당 카테고리 레스토랑만 반환한다', async () => {
    const useCase = new GetRestaurantListUseCase(repo)
    const result = await useCase.execute({ category: 'tapas' })
    expect(result.restaurants.every(r => r.categories.includes('tapas'))).toBe(true)
  })
  ```
- [ ] GREEN: 카테고리 필터 로직 추가
- [ ] RFCT: 복수 카테고리 지원

**[검색어 적용]**
- [ ] RED: `execute_withSearchQuery_returnsMatchingResults` 테스트 작성
- [ ] GREEN: 검색 로직 추가 (RestaurantSearchService 활용)
- [ ] RFCT: 검색 + 필터 복합 적용

**[거리순 정렬]**
- [ ] RED: `execute_withSortByDistance_returnsSortedResults` 테스트 작성
- [ ] GREEN: 정렬 옵션 처리
- [ ] RFCT: 정렬 기준 확장 고려

**GetRestaurantListUseCase 완료 기준**
- [ ] 전체 조회 테스트 통과
- [ ] 카테고리 필터 테스트 통과
- [ ] 검색어 필터 테스트 통과
- [ ] 거리순 정렬 테스트 통과

---

### 4-2. GetRestaurantDetailUseCase

**파일**: `src/application/use-cases/GetRestaurantDetailUseCase.ts`
**테스트**: `src/application/use-cases/__tests__/GetRestaurantDetailUseCase.test.ts`

**[상세 조회 - 성공]**
- [ ] RED: `execute_validId_returnsRestaurantWithDistance` 테스트 작성
  ```typescript
  it('유효한 ID로 레스토랑 상세 정보와 호텔 거리를 반환한다', async () => {
    const result = await useCase.execute({ id: 'rest-001' })
    expect(result.restaurant.id).toBe('rest-001')
    expect(result.restaurant.distanceFromHotel).toBeDefined()
    expect(result.restaurant.walkingMinutes).toBeDefined()
    expect(result.hotelNavigationUrl).toContain('maps.google.com')
  })
  ```
- [ ] GREEN: Use Case 구현, Google Maps 링크 생성
- [ ] RFCT: DTO 분리 (`RestaurantDetailDTO`)

**[존재하지 않는 ID]**
- [ ] RED: `execute_invalidId_throwsNotFoundError` 테스트 작성
  ```typescript
  it('존재하지 않는 ID로 조회하면 NotFoundError를 던진다', async () => {
    await expect(useCase.execute({ id: 'nonexistent' })).rejects.toThrow(RestaurantNotFoundError)
  })
  ```
- [ ] GREEN: `RestaurantNotFoundError` 도메인 에러 클래스 생성
- [ ] RFCT: 에러 코드 표준화

**[호텔로 돌아가기 링크]**
- [ ] RED: `execute_validId_returnsGoogleMapsNavigationUrl` 테스트 작성
  ```typescript
  it('Google Maps 내비게이션 URL을 생성한다', async () => {
    const result = await useCase.execute({ id: 'rest-001' })
    // destination=호텔좌표, origin=레스토랑좌표
    expect(result.hotelNavigationUrl).toMatch(
      /maps\.google\.com\/maps\?.*destination=41\.3983,2\.1969/
    )
  })
  ```
- [ ] GREEN: Google Maps URL 생성 로직
- [ ] RFCT: URL 빌더 분리

**GetRestaurantDetailUseCase 완료 기준**
- [ ] 성공 케이스 테스트 통과
- [ ] NotFoundError 케이스 테스트 통과
- [ ] Google Maps URL 생성 테스트 통과

---

### 4-3. SearchRestaurantsUseCase

**파일**: `src/application/use-cases/SearchRestaurantsUseCase.ts`
**테스트**: `src/application/use-cases/__tests__/SearchRestaurantsUseCase.test.ts`

**[이름/주소/태그 검색]**
- [ ] RED: `execute_withQuery_returnsMatchingResults` 테스트 작성
- [ ] GREEN: RestaurantSearchService 활용 구현
- [ ] RFCT: 검색 결과 DTO 정의

**[빈 결과]**
- [ ] RED: `execute_noMatch_returnsEmptyList` 테스트 작성
- [ ] GREEN: 빈 배열 반환 처리
- [ ] RFCT: 정리

**SearchRestaurantsUseCase 완료 기준**
- [ ] 검색 결과 반환 테스트 통과
- [ ] 빈 결과 처리 테스트 통과

---

### 4-4. FindNearbyRestaurantsUseCase (GPS 기반 주변 탐색)

**파일**: `src/application/use-cases/FindNearbyRestaurantsUseCase.ts`
**테스트**: `src/application/use-cases/__tests__/FindNearbyRestaurantsUseCase.test.ts`

**[현재 위치 기반 탐색]**
- [ ] RED: `execute_withUserLocation_returnsNearbyRestaurants` 테스트 작성
  ```typescript
  it('사용자 위치 기반으로 반경 내 레스토랑을 거리순으로 반환한다', async () => {
    const result = await useCase.execute({
      userLatitude: 41.3983,
      userLongitude: 2.1969,
      radiusMeters: 500,
    })
    expect(result.restaurants[0].distanceFromUser).toBeLessThanOrEqual(500)
    // 거리순 정렬 확인
    const distances = result.restaurants.map(r => r.distanceFromUser)
    expect(distances).toEqual([...distances].sort((a, b) => a - b))
  })
  ```
- [ ] GREEN: Use Case 구현, RestaurantSearchService.filterByRadius() 활용
- [ ] RFCT: 결과 DTO 정의

**[기본 반경 설정]**
- [ ] RED: `execute_noRadius_usesDefaultRadius` 테스트 작성
  - 기본 반경: 1000m
- [ ] GREEN: 기본값 적용
- [ ] RFCT: 정리

**FindNearbyRestaurantsUseCase 완료 기준**
- [ ] GPS 기반 반경 검색 통과
- [ ] 거리순 정렬 통과
- [ ] 기본 반경 처리 통과

---

### 4-5. ToggleBookmarkUseCase (북마크)

**파일**: `src/application/use-cases/ToggleBookmarkUseCase.ts`
**테스트**: `src/application/use-cases/__tests__/ToggleBookmarkUseCase.test.ts`

**[Repository Interface 정의]**
- [ ] `src/domain/repositories/IBookmarkRepository.ts` 인터페이스 생성
  ```typescript
  export interface IBookmarkRepository {
    findAll(): Promise<Bookmark[]>
    findByRestaurantId(restaurantId: string): Promise<Bookmark | null>
    save(bookmark: Bookmark): Promise<void>
    delete(restaurantId: string): Promise<void>
  }
  ```
- [ ] `InMemoryBookmarkRepository` Fake 구현

**[북마크 추가]**
- [ ] RED: `execute_notBookmarked_addsBookmark` 테스트 작성
  ```typescript
  it('북마크되지 않은 레스토랑을 북마크한다', async () => {
    const result = await useCase.execute({ restaurantId: 'rest-001' })
    expect(result.isBookmarked).toBe(true)
    const saved = await bookmarkRepo.findByRestaurantId('rest-001')
    expect(saved).not.toBeNull()
  })
  ```
- [ ] GREEN: 북마크 추가 로직
- [ ] RFCT: 정리

**[북마크 제거 (토글)]**
- [ ] RED: `execute_alreadyBookmarked_removesBookmark` 테스트 작성
  ```typescript
  it('이미 북마크된 레스토랑을 북마크 해제한다', async () => {
    await bookmarkRepo.save(Bookmark.create({ restaurantId: 'rest-001' }))
    const result = await useCase.execute({ restaurantId: 'rest-001' })
    expect(result.isBookmarked).toBe(false)
  })
  ```
- [ ] GREEN: 토글 로직 구현
- [ ] RFCT: 정리

**[존재하지 않는 레스토랑 북마크]**
- [ ] RED: `execute_invalidRestaurantId_throwsError` 테스트 작성
- [ ] GREEN: 레스토랑 존재 여부 검증
- [ ] RFCT: 에러 처리 통일

**ToggleBookmarkUseCase 완료 기준**
- [ ] 북마크 추가 테스트 통과
- [ ] 북마크 제거 토글 테스트 통과
- [ ] 잘못된 ID 에러 처리 통과

---

### 4-6. GetBookmarkListUseCase

**파일**: `src/application/use-cases/GetBookmarkListUseCase.ts`
**테스트**: `src/application/use-cases/__tests__/GetBookmarkListUseCase.test.ts`

**[북마크 목록 조회]**
- [ ] RED: `execute_withBookmarks_returnsBookmarkedRestaurants` 테스트 작성
- [ ] GREEN: 북마크된 레스토랑 목록 반환
- [ ] RFCT: DTO 정의

**GetBookmarkListUseCase 완료 기준**
- [ ] 북마크 목록 조회 테스트 통과

---

### 4-7. GetAIRecommendationUseCase (P3 - AI 추천)

**파일**: `src/application/use-cases/GetAIRecommendationUseCase.ts`
**테스트**: `src/application/use-cases/__tests__/GetAIRecommendationUseCase.test.ts`

**[AI 서비스 인터페이스 정의]**
- [ ] `src/application/ports/IAIService.ts` 포트 정의
  ```typescript
  export interface IAIService {
    recommend(prompt: string): Promise<string>
  }
  ```
- [ ] `MockAIService` Fake 구현 (테스트용)

**[추천 요청]**
- [ ] RED: `execute_withPreferences_returnsRecommendation` 테스트 작성
  ```typescript
  it('사용자 선호도를 기반으로 AI 추천을 받는다', async () => {
    const mockAI = new MockAIService('타파스 바를 추천합니다')
    const useCase = new GetAIRecommendationUseCase(repo, mockAI)
    const result = await useCase.execute({ preferences: ['해산물', '현지인맛집'] })
    expect(result.recommendation).toBeDefined()
    expect(result.recommendedRestaurants.length).toBeGreaterThan(0)
  })
  ```
- [ ] GREEN: AI 서비스 호출 로직 구현
- [ ] RFCT: 프롬프트 템플릿 분리

**[AI 서비스 실패 처리]**
- [ ] RED: `execute_aiServiceFails_throwsAIServiceError` 테스트 작성
- [ ] GREEN: 에러 처리 추가
- [ ] RFCT: 폴백 로직 고려

**GetAIRecommendationUseCase 완료 기준**
- [ ] AI 추천 요청/응답 테스트 통과
- [ ] 서비스 실패 처리 테스트 통과

---

## Phase 5: Infrastructure Layer

---

### 5-1. 레스토랑 정적 데이터 (JSON)

**파일**: `src/infrastructure/data/restaurants.json`

- [ ] 바르셀로나 맛집 데이터 수집 및 작성 (최소 20개)
  - 필수 필드: id, name, address, coordinates, categories, tags, rating, priceRange, openingHours
  - 각 카테고리별 최소 3개 이상 포함
  - 좌표 실제 검증 필수

- [ ] 데이터 유효성 검증 스크립트 작성
  ```bash
  # 좌표 범위, 카테고리 유효성 확인
  npx ts-node src/infrastructure/data/validateData.ts
  ```

- [ ] 예시 데이터 항목
  ```json
  {
    "id": "rest-001",
    "name": "Bar El Xampanyet",
    "address": "Carrer de la Montcada, 22, 08003 Barcelona",
    "coordinates": { "latitude": 41.3843, "longitude": 2.1812 },
    "categories": ["tapas"],
    "tags": ["전통", "와인", "현지인맛집", "고딕지구"],
    "rating": 4.5,
    "priceRange": 2,
    "openingHours": "화-일 12:00-23:00",
    "phone": "+34 933 197 003",
    "website": null,
    "imageUrl": null,
    "description": "1929년부터 운영해온 전통 타파스 바. 자체 제조 카바와 타파스로 유명."
  }
  ```

---

### 5-2. JsonRestaurantRepository

**파일**: `src/adapters/repositories/JsonRestaurantRepository.ts`
**테스트**: `src/adapters/repositories/__tests__/JsonRestaurantRepository.test.ts`

**[전체 조회]**
- [ ] RED: `findAll_returnsAllRestaurantsFromJson` Integration 테스트 작성
  ```typescript
  it('JSON 파일에서 모든 레스토랑을 로드한다', async () => {
    const repo = new JsonRestaurantRepository()
    const restaurants = await repo.findAll()
    expect(restaurants.length).toBeGreaterThan(0)
    expect(restaurants[0]).toBeInstanceOf(Restaurant)
  })
  ```
- [ ] GREEN: JSON 파일 읽기, Restaurant 객체 변환
- [ ] RFCT: 캐싱 적용 (두 번째 호출부터는 메모리 캐시 사용)

**[ID로 조회]**
- [ ] RED: `findById_existingId_returnsRestaurant` 테스트 작성
- [ ] GREEN: ID 기반 조회
- [ ] RFCT: 정리

**[카테고리 필터 조회]**
- [ ] RED: `findByCategory_returnsFilteredRestaurants` 테스트 작성
- [ ] GREEN: 카테고리 필터 구현
- [ ] RFCT: 정리

**JsonRestaurantRepository 완료 기준**
- [ ] 모든 CRUD 조회 테스트 통과
- [ ] Restaurant 도메인 객체 변환 정확성 확인

---

### 5-3. LocalStorageBookmarkRepository

**파일**: `src/adapters/repositories/LocalStorageBookmarkRepository.ts`
**테스트**: `src/adapters/repositories/__tests__/LocalStorageBookmarkRepository.test.ts`

> 테스트 환경: jest-environment-jsdom (localStorage mock 활용)

**[저장]**
- [ ] RED: `save_bookmark_persistsToLocalStorage` 테스트 작성
  ```typescript
  it('북마크를 localStorage에 저장한다', async () => {
    const repo = new LocalStorageBookmarkRepository()
    await repo.save(Bookmark.create({ restaurantId: 'rest-001' }))
    const found = await repo.findByRestaurantId('rest-001')
    expect(found).not.toBeNull()
  })
  ```
- [ ] GREEN: localStorage 기반 구현
- [ ] RFCT: JSON 직렬화/역직렬화 분리

**[삭제]**
- [ ] RED: `delete_existingBookmark_removesFromStorage` 테스트 작성
- [ ] GREEN: 삭제 로직 구현
- [ ] RFCT: 정리

**[전체 조회]**
- [ ] RED: `findAll_returnsAllSavedBookmarks` 테스트 작성
- [ ] GREEN: 전체 조회 구현
- [ ] RFCT: 정리

**LocalStorageBookmarkRepository 완료 기준**
- [ ] 저장/삭제/조회 테스트 통과
- [ ] localStorage 초기화(beforeEach) 처리 확인

---

### 5-4. ClaudeAIService (P3)

**파일**: `src/adapters/services/ClaudeAIService.ts`
**테스트**: `src/adapters/services/__tests__/ClaudeAIService.test.ts`

- [ ] `IAIService` 포트 구현
- [ ] Anthropic Claude API 연동
  ```typescript
  import Anthropic from '@anthropic-ai/sdk'
  ```
- [ ] RED: `recommend_withPrompt_callsClaudeAPI` 테스트 (Anthropic 클라이언트 Mock)
- [ ] GREEN: API 호출 구현
- [ ] RFCT: API 키 환경변수 처리, 에러 핸들링

---

## Phase 6: Presentation Layer (Next.js)

---

### 6-1. Server Actions / API Routes

**파일**: `src/app/api/restaurants/route.ts`
**테스트**: `src/__tests__/integration/api/restaurants.test.ts`

**[GET /api/restaurants]**
- [ ] RED: `GET_noFilter_returns200WithRestaurantList` Integration 테스트
  ```typescript
  it('필터 없이 GET 요청하면 200과 레스토랑 목록을 반환한다', async () => {
    const response = await fetch('/api/restaurants')
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.restaurants).toBeInstanceOf(Array)
    expect(data.restaurants[0]).toHaveProperty('distanceFromHotel')
  })
  ```
- [ ] GREEN: Route Handler 구현, GetRestaurantListUseCase 연결
- [ ] RFCT: 응답 형식 표준화

**[GET /api/restaurants?category=tapas]**
- [ ] RED: `GET_withCategory_returnsFilteredResults` 테스트
- [ ] GREEN: query parameter 파싱, 카테고리 필터 적용
- [ ] RFCT: 파라미터 검증 강화

**[GET /api/restaurants?q=검색어]**
- [ ] RED: `GET_withSearchQuery_returnsSearchResults` 테스트
- [ ] GREEN: 검색 파라미터 처리
- [ ] RFCT: 정리

**[GET /api/restaurants/:id]**
- [ ] RED: `GET_validId_returns200WithDetail` 테스트
- [ ] GREEN: 상세 Route Handler 구현
- [ ] RFCT: 정리

**[GET /api/restaurants/:id - 없는 ID]**
- [ ] RED: `GET_invalidId_returns404` 테스트
- [ ] GREEN: 404 에러 응답 처리
- [ ] RFCT: 에러 응답 형식 표준화 (`{ error: { code, message } }`)

---

### 6-2. React Components (TDD with Testing Library)

> 테스트 환경: jest-environment-jsdom + @testing-library/react

**[RestaurantCard 컴포넌트]**

**파일**: `src/components/restaurant/RestaurantCard.tsx`
**테스트**: `src/components/restaurant/__tests__/RestaurantCard.test.tsx`

- [ ] RED: `RestaurantCard_renders_nameAndDistance` 테스트 작성
  ```typescript
  it('레스토랑 이름과 호텔까지 거리를 렌더링한다', () => {
    render(<RestaurantCard restaurant={sampleRestaurantDTO} />)
    expect(screen.getByText('Bar El Xampanyet')).toBeInTheDocument()
    expect(screen.getByText('1.2km')).toBeInTheDocument()
    expect(screen.getByText('약 18분')).toBeInTheDocument()
  })
  ```
- [ ] GREEN: RestaurantCard 컴포넌트 구현
- [ ] RFCT: Tailwind 스타일링 적용

- [ ] RED: `RestaurantCard_renders_categoryBadge` 테스트
- [ ] GREEN: 카테고리 배지 구현
- [ ] RFCT: shadcn/ui Badge 컴포넌트 적용

- [ ] RED: `RestaurantCard_click_navigatesToDetail` 테스트
  ```typescript
  it('카드 클릭 시 상세 페이지로 이동한다', async () => {
    const user = userEvent.setup()
    render(<RestaurantCard restaurant={sampleRestaurantDTO} />)
    await user.click(screen.getByRole('article'))
    expect(mockRouter.push).toHaveBeenCalledWith('/restaurants/rest-001')
  })
  ```
- [ ] GREEN: Next.js router 연동
- [ ] RFCT: 정리

**[BookmarkButton 컴포넌트]**

**파일**: `src/components/bookmark/BookmarkButton.tsx`
**테스트**: `src/components/bookmark/__tests__/BookmarkButton.test.tsx`

- [ ] RED: `BookmarkButton_notBookmarked_showsEmptyHeart` 테스트
- [ ] GREEN: 북마크 상태 표시 구현
- [ ] RFCT: 하트 아이콘 (Lucide React)

- [ ] RED: `BookmarkButton_click_togglesBookmark` 테스트
  ```typescript
  it('클릭 시 북마크 상태가 토글된다', async () => {
    const user = userEvent.setup()
    const onToggle = jest.fn()
    render(<BookmarkButton restaurantId="rest-001" isBookmarked={false} onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: '북마크 추가' }))
    expect(onToggle).toHaveBeenCalledWith('rest-001')
  })
  ```
- [ ] GREEN: 클릭 핸들러 구현
- [ ] RFCT: aria-label 접근성 처리

**[CategoryFilter 컴포넌트]**

**파일**: `src/components/filter/CategoryFilter.tsx`
**테스트**: `src/components/filter/__tests__/CategoryFilter.test.tsx`

- [ ] RED: `CategoryFilter_renders_allCategories` 테스트
  ```typescript
  it('6개 카테고리 버튼을 모두 렌더링한다', () => {
    render(<CategoryFilter selectedCategory={null} onChange={jest.fn()} />)
    expect(screen.getByText('타파스')).toBeInTheDocument()
    expect(screen.getByText('파에야')).toBeInTheDocument()
    expect(screen.getByText('핀초스')).toBeInTheDocument()
    expect(screen.getByText('츄러스')).toBeInTheDocument()
    expect(screen.getByText('하몬')).toBeInTheDocument()
    expect(screen.getByText('해산물')).toBeInTheDocument()
  })
  ```
- [ ] GREEN: CategoryFilter 컴포넌트 구현
- [ ] RFCT: shadcn/ui 버튼 스타일 적용

- [ ] RED: `CategoryFilter_selectedCategory_isHighlighted` 테스트
- [ ] GREEN: 선택된 카테고리 강조 표시
- [ ] RFCT: 정리

- [ ] RED: `CategoryFilter_click_callsOnChange` 테스트
- [ ] GREEN: 클릭 핸들러
- [ ] RFCT: 정리

**[SearchBar 컴포넌트]**

**파일**: `src/components/search/SearchBar.tsx`
**테스트**: `src/components/search/__tests__/SearchBar.test.tsx`

- [ ] RED: `SearchBar_typing_callsOnChange` 테스트
  ```typescript
  it('검색어 입력 시 onSearch 콜백을 호출한다', async () => {
    const user = userEvent.setup()
    const onSearch = jest.fn()
    render(<SearchBar onSearch={onSearch} />)
    await user.type(screen.getByRole('searchbox'), '타파스')
    await user.keyboard('{Enter}')
    expect(onSearch).toHaveBeenCalledWith('타파스')
  })
  ```
- [ ] GREEN: SearchBar 구현
- [ ] RFCT: 디바운스 300ms 적용

**[HotelNavigationButton 컴포넌트]**

**파일**: `src/components/hotel/HotelNavigationButton.tsx`
**테스트**: `src/components/hotel/__tests__/HotelNavigationButton.test.tsx`

- [ ] RED: `HotelNavigationButton_renders_withCorrectLink` 테스트
  ```typescript
  it('호텔로 돌아가기 Google Maps 링크를 올바르게 렌더링한다', () => {
    render(<HotelNavigationButton navigationUrl="https://maps.google.com/..." />)
    const link = screen.getByRole('link', { name: '호텔로 돌아가기' })
    expect(link).toHaveAttribute('href', expect.stringContaining('maps.google.com'))
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
  ```
- [ ] GREEN: 버튼 컴포넌트 구현
- [ ] RFCT: 지도 아이콘 추가 (Lucide React)

---

### 6-3. Page Components

**[메인 페이지 - 맛집 목록]**

**파일**: `src/app/page.tsx` (또는 `src/app/restaurants/page.tsx`)

- [ ] RED: `RestaurantListPage_renders_restaurantCards` 테스트
- [ ] GREEN: 페이지 컴포넌트, fetch로 API 데이터 로드
- [ ] RFCT: Suspense + Loading skeleton 적용

- [ ] RED: `RestaurantListPage_filterByCategory_updatesUrl` 테스트
  - 카테고리 선택 시 URL query parameter 업데이트 (`?category=tapas`)
- [ ] GREEN: URL 상태 관리 (useSearchParams, useRouter)
- [ ] RFCT: 정리

**[레스토랑 상세 페이지]**

**파일**: `src/app/restaurants/[id]/page.tsx`

- [ ] RED: `RestaurantDetailPage_renders_detailWithNavigation` 테스트
- [ ] GREEN: 상세 페이지 구현
- [ ] RFCT: 이미지, 영업시간, 연락처 섹션 정리

**[북마크 페이지]**

**파일**: `src/app/bookmarks/page.tsx`

- [ ] RED: `BookmarkPage_renders_savedRestaurants` 테스트
- [ ] GREEN: 북마크 목록 페이지
- [ ] RFCT: 빈 상태 UI 처리

---

## Phase 7: Integration & E2E

---

### 7-1. 핵심 User Story 통합 테스트

**파일**: `src/__tests__/integration/`

**[UC-1: 타파스 바 찾기]**
- [ ] RED: `userStory_findTapasBar_succeeds` 통합 테스트
  ```typescript
  it('사용자가 타파스 카테고리로 필터링하여 맛집을 찾는다', async () => {
    // Given: JSON 레포지토리 + 실제 Use Case 연결
    const repo = new JsonRestaurantRepository()
    const useCase = new GetRestaurantListUseCase(repo)

    // When: 타파스 필터 적용
    const result = await useCase.execute({ category: 'tapas' })

    // Then: 타파스 레스토랑만 반환, 거리 계산 포함
    expect(result.restaurants.every(r => r.categories.includes('tapas'))).toBe(true)
    expect(result.restaurants[0].distanceFromHotel).toBeDefined()
  })
  ```
- [ ] GREEN: 실제 구현체 연결
- [ ] RFCT: 정리

**[UC-2: 주변 맛집 탐색]**
- [ ] RED: `userStory_findNearbyRestaurants_returns500mRadius` 통합 테스트
- [ ] GREEN: GPS + 반경 검색 통합 테스트
- [ ] RFCT: 정리

**[UC-3: 북마크 저장 및 조회]**
- [ ] RED: `userStory_bookmarkRestaurant_canBeRetrieved` 통합 테스트
- [ ] GREEN: 북마크 저장/조회 플로우 통합 테스트
- [ ] RFCT: 정리

**[UC-4: 호텔로 돌아가기]**
- [ ] RED: `userStory_navigateBackToHotel_generatesGoogleMapsUrl` 통합 테스트
- [ ] GREEN: 내비게이션 URL 생성 검증
- [ ] RFCT: 정리

---

### 7-2. 의존성 주입 설정

**파일**: `src/infrastructure/di/container.ts`

- [ ] Repository 인스턴스 생성 (JsonRestaurantRepository, LocalStorageBookmarkRepository)
- [ ] Use Case 인스턴스 생성 (각 Use Case에 Repository 주입)
- [ ] 서비스 레지스트리 구현 또는 간단한 팩토리 함수

```typescript
// src/infrastructure/di/container.ts
export function createRestaurantContainer() {
  const restaurantRepo = new JsonRestaurantRepository()
  const bookmarkRepo = new LocalStorageBookmarkRepository()

  return {
    getRestaurantListUseCase: new GetRestaurantListUseCase(restaurantRepo),
    getRestaurantDetailUseCase: new GetRestaurantDetailUseCase(restaurantRepo),
    searchRestaurantsUseCase: new SearchRestaurantsUseCase(restaurantRepo),
    findNearbyRestaurantsUseCase: new FindNearbyRestaurantsUseCase(restaurantRepo),
    toggleBookmarkUseCase: new ToggleBookmarkUseCase(restaurantRepo, bookmarkRepo),
    getBookmarkListUseCase: new GetBookmarkListUseCase(bookmarkRepo, restaurantRepo),
  }
}
```

---

### 7-3. 환경 설정

- [ ] `.env.local` 생성
  ```env
  # AI 추천 기능 (P3)
  ANTHROPIC_API_KEY=sk-ant-...

  # 호텔 좌표 (설정 변경 가능하도록)
  NEXT_PUBLIC_HOTEL_LATITUDE=41.3983
  NEXT_PUBLIC_HOTEL_LONGITUDE=2.1969
  NEXT_PUBLIC_HOTEL_NAME=Hotel & SPA Villa Olimpic@Suites
  NEXT_PUBLIC_HOTEL_ADDRESS=Carrer de Pallars, 121-125, Sant Marti, 08018 Barcelona
  ```

- [ ] `.env.example` 생성 (Git 커밋용, 실제 값 없음)
- [ ] `README.md` 환경변수 섹션 업데이트

---

## Phase 8: UI/UX 완성

### 8-1. 디자인 시스템 설정

- [ ] 스페인 테마 색상 팔레트 (Tailwind 커스텀 색상)
  ```typescript
  // tailwind.config.ts
  colors: {
    spain: {
      red: '#C60B1E',      // 스페인 국기 빨강
      yellow: '#FFC400',   // 스페인 국기 노랑
      warm: '#F5E6C8',     // 배경 웜톤
    }
  }
  ```

- [ ] shadcn/ui 컴포넌트 설치
  ```bash
  npx shadcn-ui@latest add card badge button input dialog sheet
  npx shadcn-ui@latest add skeleton tabs scroll-area
  ```

### 8-2. 반응형 레이아웃

- [ ] 모바일 우선 레이아웃 (375px 기준)
- [ ] 맛집 그리드: 모바일 1열, 태블릿 2열
- [ ] 하단 네비게이션 바 (홈/검색/북마크)

### 8-3. 로딩 & 에러 상태

- [ ] `loading.tsx` - 스켈레톤 카드
- [ ] `error.tsx` - 에러 메시지 + 재시도 버튼
- [ ] `not-found.tsx` - 404 페이지

---

## 최종 Definition of Done

### 기능별 완료 기준

| 기능 | 우선순위 | 단위 테스트 | 통합 테스트 | 완료 |
|------|---------|------------|------------|------|
| 맛집 목록 & 상세 | P0 | [ ] | [ ] | [ ] |
| 호텔 거리 표시 (Haversine) | P0 | [ ] | [ ] | [ ] |
| 카테고리 필터 | P1 | [ ] | [ ] | [ ] |
| 검색 기능 | P1 | [ ] | [ ] | [ ] |
| 주변 맛집 탐색 (GPS) | P1 | [ ] | [ ] | [ ] |
| 북마크/즐겨찾기 | P2 | [ ] | [ ] | [ ] |
| 호텔로 돌아가기 | P2 | [ ] | [ ] | [ ] |
| AI 추천 | P3 | [ ] | [ ] | [ ] |
| 방문 일정 관리 | P3 | [ ] | [ ] | [ ] |

### 코드 품질 체크리스트

- [ ] 모든 Unit 테스트 통과 (`npm test`)
- [ ] 모든 Integration 테스트 통과 (`npm run test:integration`)
- [ ] 도메인 레이어 커버리지 >= 90% (`npm run test:coverage`)
- [ ] TypeScript 컴파일 오류 없음 (`npx tsc --noEmit`)
- [ ] ESLint 경고/오류 없음 (`npm run lint`)
- [ ] Next.js 빌드 성공 (`npm run build`)

### 아키텍처 품질 체크리스트

- [ ] 도메인 레이어가 외부 의존성(Next.js, localStorage 등)을 가지지 않음
- [ ] 모든 Repository 접근이 인터페이스를 통해 이루어짐
- [ ] Use Case가 HTTP 요청/응답 객체에 직접 의존하지 않음
- [ ] 환경변수가 인프라 레이어에서만 사용됨
- [ ] 하드코딩된 좌표/문자열 없음 (상수 또는 환경변수 사용)

### 비즈니스 규칙 검증 체크리스트

- [ ] Haversine 거리 계산 정확도 검증 (실제 거리와 5% 이내 오차)
- [ ] 호텔 좌표 (41.3983, 2.1969) 올바르게 사용됨
- [ ] 6개 카테고리 모두 한국어 라벨과 매핑됨
- [ ] 검색이 이름/주소/태그 세 가지 필드에 모두 적용됨
- [ ] 북마크 토글이 저장/삭제를 정확히 처리함
- [ ] Google Maps URL이 올바른 목적지(호텔)를 포함함

### 사용자 경험 체크리스트

- [ ] 레스토랑 목록에 호텔 거리 및 도보 시간 표시
- [ ] 카테고리 필터가 URL parameter와 동기화됨
- [ ] 검색 결과가 즉시 반영됨 (디바운스 300ms)
- [ ] 북마크 상태가 페이지 새로고침 후에도 유지됨 (localStorage)
- [ ] 호텔로 돌아가기 링크가 새 탭으로 열림
- [ ] 모바일 환경에서 GPS 위치 권한 요청 처리됨

---

## 빠른 시작 명령어

```bash
# 1. 도메인 테스트부터 시작 (Watch 모드)
npm run test:domain -- --watch

# 2. 특정 파일만 테스트
npm test -- Coordinates.test.ts

# 3. 전체 테스트 + 커버리지
npm run test:coverage

# 4. 실패한 테스트만 재실행
npm test -- --onlyFailures

# 5. 개발 서버
npm run dev
# → http://localhost:3000

# 6. 빌드 검증
npm run build && npm run lint
```

---

## 구현 우선순위 타임라인

```
Day 1-2: Phase 1 (Value Objects) + Phase 2 (Entities)
         → Coordinates, Distance, RestaurantCategory, Restaurant

Day 3:   Phase 3 (Domain Services)
         → DistanceCalculatorService (Haversine), RestaurantSearchService

Day 4-5: Phase 4 P0/P1 (Use Cases)
         → GetRestaurantList, GetRestaurantDetail, Search, FindNearby

Day 6:   Phase 5 (Infrastructure)
         → JSON 데이터 작성, JsonRestaurantRepository

Day 7-8: Phase 6 P0 (Presentation - API Routes + 핵심 컴포넌트)
         → RestaurantCard, CategoryFilter, SearchBar

Day 9:   Phase 4 P2 + Phase 5 P2 (Bookmark)
         → ToggleBookmark, LocalStorageBookmarkRepository

Day 10:  Phase 6 P2 + Phase 7 (Integration)
         → HotelNavigationButton, E2E 통합 테스트

Day 11+: Phase 4 P3 (AI 추천), Phase 8 (UI 완성)
```
