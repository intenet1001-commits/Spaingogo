# Web Test Report - Spaingogo

**테스트 일시**: 2026-02-25 01:50 ~ 02:10 KST
**대상 URL**: http://localhost:9020
**앱 설명**: 바르셀로나 맛집/관광 정보 앱 (한국어 여행자용)
**기준 호텔**: Hotel & SPA Villa Olimpic@Suites (좌표: 41.3983, 2.1969)
**테스트 소요 시간**: 약 20분
**Playwright 버전**: 1.56.1 / Chromium 1194

---

## 종합 등급: B+

| 영역 | 등급 | 비고 |
|------|------|------|
| 기능 테스트 | B | 10/12 통과, SOS 버튼/탭 selector 이슈 |
| 시각/접근성 | B+ | 반응형 양호, 일부 터치 타겟 부족 |
| API/네트워크 | B | 이미지 404 3건, admin auth 405 |
| 성능 | A | FCP 760ms, CLS 0, TTFB 491ms |

---

## 1. 사이트 구조

- **발견된 페이지**: 9개 라우트 전체 HTTP 200 응답
- **감지된 프레임워크**: Next.js 15 (App Router) + TypeScript + Tailwind CSS 3
- **주요 라우트 목록**:

| 경로 | 이름 | 상태 |
|------|------|------|
| `/` | 홈 (먹고/갈래 탭) | 200 OK |
| `/restaurants` | 맛집 목록 (20개) | 200 OK |
| `/restaurants/[id]` | 맛집 상세 | 200 OK |
| `/attractions` | 명소 목록 (20개) | 200 OK |
| `/attractions/[id]` | 명소 상세 | 200 OK |
| `/nearby` | 주변 탭 (GPS 기반) | 200 OK |
| `/bookmarks` | 북마크 | 200 OK |
| `/emergency` | 긴급연락처 | 200 OK |
| `/admin` | 관리자 페이지 | 200 OK |

- **API 엔드포인트**: `/api/restaurants` (20개), `/api/attractions` (20개), `/api/admin/auth`
- **외부 도메인**: images.unsplash.com, fonts.googleapis.com, fonts.gstatic.com

---

## 2. 기능 테스트 결과

**통과: 10 / 실패: 2**

### 통과 항목
| 테스트 | 결과 |
|--------|------|
| 홈 페이지 로드 | "Spaingogo 바르셀로나 맛집 가이드" 타이틀 확인 |
| BottomNav - 주변 | `/nearby` 정상 이동 |
| BottomNav - 맛집 | `/restaurants` 정상 이동 |
| BottomNav - 명소 | `/attractions` 정상 이동 |
| 맛집 상세 페이지 | `/restaurants/4` (Tickets) 진입, "지도에서 보기" 확인 |
| 명소 상세 페이지 | `/attractions/a1` (Sagrada Familia) 진입 확인 |
| 호텔 FAB 버튼 | 홈 화면에서 표시 확인 |
| /emergency 연락처 | 112/061/091/092 전체 표시 확인 |
| 카테고리 필터 (타파스) | 필터 동작 확인 |
| /bookmarks 페이지 | 정상 로드 확인 |

### 실패 항목
| 테스트 | 원인 | 심각도 |
|--------|------|--------|
| 탭 스위치 (먹고/갈래) | Playwright strict mode 위반: `getByRole('button', { name: /먹고/ })`가 "🍽️ 먹고?" 탭 버튼과 "🦞 해산물 먹고파" 칩 버튼 2개를 동시 매칭 | 낮음 (테스트 selector 문제, 기능 자체는 정상) |
| SOS 버튼 | `getByRole('button', { name: /SOS/i })` 로 찾을 수 없음 - 실제로는 `button:has-text("SOS")` selector로 동작 확인됨 | 낮음 (테스트 selector 문제, 기능 자체는 정상) |

> 참고: 탭 스위치와 SOS 버튼은 실제로 정상 작동함. 테스트 selector 한계로 인한 false negative.

---

## 3. 상황별 추천 기능 심층 검토

### 3-1. 맛집 상황별 추천 (12개 칩)

**평균 점수: 3.2 / 5.0**

| 칩 | 결과 수 | 점수 | 평가 |
|----|---------|------|------|
| 😴 피곤할 때 | 6개 | 3/5 | La Pepita, El Xampanyet 등 근처 맛집 표시. 적합 |
| 💑 로맨틱한 밤 | 6개 | 4/5 | La Mar Salada(해변뷰), Boca Grande(고급) 등 포함. 적합 |
| 🥂 친구들과 | 6개 | 4/5 | 타파스/핀초스 중심 맛집 표시. 적합 |
| 🤢 해장이 필요해 | 6개 | **2/5** | **"츄러스" 태그 결과 포함 - Granja M. Viader가 해장 추천에 등장** (부적절) |
| 🎉 특별한 날 | 6개 | 4/5 | Tickets(미슐랭), Boca Grande($$$$) 등 고급 맛집 포함. 적합 |
| 💰 가성비로 | 6개 | 3/5 | $/$$급 결과 포함. 적합 |
| 🌅 아침 일찍 | 6개 | 3/5 | 09:00/08:30 영업 맛집 포함. 적합 |
| 🌙 야식 생각 | 6개 | 3/5 | 23:00~01:00 영업 맛집 포함. 적합 |
| 🍷 와인 한 잔 | 6개 | 4/5 | El Xampanyet(카바), Bodega Sepúlveda(자연파와인) 포함. 적합 |
| **⚡ 빠르게 먹자** | **0개** | **1/5** | **"해당 상황의 맛집/관광지 정보가 부족합니다 😅" 메시지 표시** - 호텔(올림픽 빌리지)에서 1km 이내 맛집 없음 확인 |
| 🦞 해산물 먹고파 | 6개 | 4/5 | La Cova Fumada(해산물), 7 Portes(파에야) 포함. 적합 |
| 🍩 달달한 거 | 6개 | 3/5 | 예상(2개)보다 많은 6개 결과. Chök, Granja M. Viader 외 4개 추가 표시됨 |

**빈 결과 칩**: 빠르게 먹자 (1개)

**주요 이슈**:
1. **⚡ 빠르게 먹자 - 빈 결과 확정**: 1km 이내 필터 적용 시 호텔 주변(올림픽 빌리지)에 해당 맛집 없음. "부족합니다 😅" 메시지 표시됨
2. **🤢 해장이 필요해 - 부적절한 결과**: 츄러스(Granja M. Viader) 가게가 해장 추천에 포함됨. 달달한 디저트는 해장과 무관함

### 3-2. 명소 상황별 추천 (12개 칩)

**평균 점수: 3.9 / 5.0**

| 칩 | 결과 수 | 점수 | 평가 |
|----|---------|------|------|
| 📸 사진 찍기 좋은 | 14개 | **5/5** | **Sagrada Familia 포함 확인** - Park Güell(사진명소 태그), 기타 경관 명소들 포함 |
| 🚶 걷기 좋은 | 14개 | 4/5 | Barceloneta 해변, La Rambla 등 산책 명소 포함. 적합 |
| 👨‍👩‍👧 아이와 함께 | 14개 | 4/5 | Parc de la Ciutadella, 바르셀로나 동물원 등 포함. 적합 |
| 🆓 무료 입장 | 14개 | 4/5 | 무료 명소 표시 확인 |
| 🌃 야경 보러 | 13개 | 4/5 | 마법분수, Tibidabo 등 포함. 적합 |
| 📚 역사 탐방 | 14개 | 4/5 | Picasso Museum, Gothic Quarter 등 포함. 적합 |
| 🏖️ 해변 즐기기 | 12개 | 4/5 | Barceloneta 해변 등 포함. 적합 |
| 🌧️ 비 올 때 | 14개 | 4/5 | 박물관 중심 실내 명소 포함. 적합 |
| 🛍️ 쇼핑하기 | 12개 | 4/5 | La Boqueria, El Born 쇼핑 명소 포함. 적합 |
| ⚡ 호텔 근처 | 11개 | 3/5 | 1.5km 이내임에도 11개 결과 표시 (예상보다 많음 - 필터 범위 확인 필요) |
| 🕐 반나절 코스 | 14개 | 3/5 | 60-120분 소요 명소 포함. 적합하나 결과가 지나치게 많음 |
| 🎨 예술 감상 | 14개 | 4/5 | MNAC, Picasso Museum, Fundació Joan Miró 포함. 적합 |

**빈 결과 칩**: 없음 (12개 모두 결과 표시)

**주요 발견**:
1. **📸 사진 찍기 좋은 - Sagrada Familia 포함 확인**: 우려와 달리 정상 포함됨 (점수 5/5)
2. **⚡ 호텔 근처 - 예상보다 많은 결과**: 1.5km 이내 필터임에도 11개 표시. Parc de la Ciutadella(1개)만 예상했으나 실제로는 Arc de Triomf, El Born Cultural Centre 등 포함

---

## 4. API/네트워크 분석

- **총 요청 수**: 96개
- **실패 요청**: 4개
- **콘솔 에러**: 5개

### 요청 유형별 분류
| 유형 | 수 |
|------|-----|
| script | 36 |
| image | 19 |
| stylesheet | 14 |
| font | 14 |
| document | 7 |
| fetch | 6 |

### 실패 요청 상세
| URL | 상태 | 원인 |
|-----|------|------|
| `/_next/image?url=unsplash...photo-1583779457094` | 404 | Unsplash 이미지 URL 변경/만료 |
| `/_next/image?url=unsplash...photo-1598977591216` | 404 | Unsplash 이미지 URL 변경/만료 |
| `/_next/image?url=unsplash...photo-1561436260` | 404 | Unsplash 이미지 URL 변경/만료 |
| `/api/admin/auth` | 405 | GET 요청 불허 (POST only 설계) - 정상 |

### Google Maps 연동
맛집 상세 페이지에서 Google Maps 링크 3개 확인:
- 좌표 기반 지도 보기: `https://www.google.com/maps/search/?api=1&query=41.3838,2.1815`
- Google 예약 링크: `https://www.google.com/maps/search/Bar del Pla Barcelona`
- 길찾기 링크: 좌표 기반 정상 작동

### 주요 이슈
1. **이미지 404 오류 3건**: Unsplash 이미지 3개가 Next.js Image 최적화 과정에서 404 반환. 해당 이미지들의 URL이 만료된 것으로 추정. 사용자에게 깨진 이미지로 표시될 가능성 있음

---

## 5. 시각/접근성 검사

### 반응형 테스트 결과
| 뷰포트 | 크기 | 가로스크롤 | 터치타겟이슈 |
|--------|------|-----------|------------|
| 모바일 | 390x844 | 없음 | 레스토랑: 3개, 명소: 11개, 주변: 4개 |
| 태블릿 | 768x1024 | 없음 | 레스토랑: 3개, 명소: 11개 |
| 데스크탑 | 1280x800 | 없음 | 레스토랑: 3개, 명소: 11개 |

- **반응형 이슈**: 가로 스크롤 없음 (3개 뷰포트 모두 양호)
- **터치 타겟 이슈**: 명소 목록 페이지에서 11개의 버튼이 32px 미만 (모바일 접근성 기준 44px 권고)

### 접근성 검사
| 항목 | 결과 |
|------|------|
| html lang 속성 | `ko` 설정됨 (정상) |
| 헤딩 구조 | h1=1개, h2=3개 (양호) |
| 이미지 alt 속성 | 별도 위반 없음 |

- **접근성 위반**: 0건 (주요 항목)
- **총 레이아웃 이슈**: 6건 (모두 터치 타겟 크기 관련)

### 스크린샷 목록 (13개)
- `tests/screenshots/mobile-home.png` - 모바일 홈
- `tests/screenshots/mobile-restaurants.png` - 모바일 맛집 목록
- `tests/screenshots/mobile-attractions.png` - 모바일 명소 목록
- `tests/screenshots/mobile-emergency.png` - 모바일 긴급연락처
- `tests/screenshots/mobile-sos-sheet.png` - SOS 바텀시트
- `tests/screenshots/mobile-home-food.png` - 홈 먹고 탭 전체
- `tests/screenshots/mobile-home-tour.png` - 홈 갈래 탭 전체
- `tests/screenshots/tablet-home.png` - 태블릿 홈
- `tests/screenshots/tablet-restaurants.png` - 태블릿 맛집
- `tests/screenshots/tablet-attractions.png` - 태블릿 명소
- `tests/screenshots/tablet-emergency.png` - 태블릿 긴급연락처
- `tests/screenshots/desktop-home.png` - 데스크탑 홈
- `tests/screenshots/desktop-restaurants.png` - 데스크탑 맛집

---

## 6. 성능 감사

| 지표 | 홈 | 맛집 목록 | 명소 목록 | 등급 |
|------|-----|----------|----------|------|
| TTFB | 491ms | 460ms | 383ms | Good |
| FCP | 760ms | 448ms | 408ms | Good |
| LCP | N/A | N/A | N/A | - |
| CLS | 0 | 0 | 0 | Good |
| DOM 로드 | 459ms | 431ms | 354ms | Good |
| 전체 로드 | 894ms | 803ms | 758ms | Good |
| 리소스 수 | 14개 | 14개 | 14개| - |
| 총 리소스 크기 | 2,655 KB | 2,336 KB | 2,288 KB | - |

**종합 성능 등급: A**

- FCP 760ms - Good (기준: 1800ms 이하)
- LCP - 측정 불가 (headless 환경 제한)
- CLS 0 - Good (레이아웃 이동 없음)
- TTFB 491ms - Good (기준: 800ms 이하)
- 느린 리소스: 없음 (1초 초과 리소스 0개)

---

## 7. 발견된 버그 및 이슈 요약

### 심각도 높음 (High)
없음

### 심각도 중간 (Medium)
| # | 이슈 | 위치 | 설명 |
|---|------|------|------|
| 1 | 이미지 404 오류 | 전체 앱 | Unsplash 이미지 3개 URL 만료 - 깨진 이미지 표시 가능 |
| 2 | 해장 추천에 츄러스 포함 | 홈 > 먹고 > 해장이 필요해 | Granja M. Viader(츄러스 가게)가 해장 상황에 부적절하게 포함 |
| 3 | 빠르게 먹자 빈 결과 | 홈 > 먹고 > 빠르게 먹자 | 호텔 기준 1km 이내 맛집 없어 빈 결과 표시 - UX 개선 필요 |

### 심각도 낮음 (Low)
| # | 이슈 | 위치 | 설명 |
|---|------|------|------|
| 4 | 터치 타겟 크기 부족 | 명소 목록 페이지 | 11개 버튼이 32px 미만 (권고: 44px) |
| 5 | 달달한 거 결과 과다 | 홈 > 먹고 > 달달한 거 | 2개 예상 대비 6개 표시 - 필터 기준 재검토 필요 |
| 6 | admin/auth GET 405 | /api/admin/auth | GET 불허 (설계상 정상이나 문서화 필요) |

---

## 8. 권장 개선사항

### 우선순위 1 (즉시 수정 권장)
1. **Unsplash 이미지 URL 갱신**: 만료된 3개 이미지 URL을 새 URL로 교체하거나 로컬 이미지로 대체
2. **해장이 필요해 필터 수정**: `해장` 태그 로직에서 `츄러스` 카테고리 또는 Granja M. Viader 제외. 아침 영업 + 소화 편한 음식 위주로 필터 조정

### 우선순위 2 (단기 개선)
3. **빠르게 먹자 UX 개선**: 1km 이내 결과 없을 때 "현재 위치 기준 가장 가까운 맛집 TOP 3" 대안 제시, 또는 "빠른 식사 가능한 맛집 (도보 20분 이내)" 기준 완화
4. **달달한 거 필터 정밀화**: 현재 6개 → `츄러스`, `디저트`, `달달한` 태그로 엄격하게 필터링하여 2-3개로 축소
5. **명소 목록 터치 타겟 개선**: 필터 버튼/태그 최소 크기 44px로 조정 (특히 카테고리 칩들)

### 우선순위 3 (중장기 개선)
6. **호텔 근처 명소 필터 검토**: 1.5km 이내 설정임에도 11개 표시됨. 반경 계산 로직 확인 필요
7. **LCP 측정 도입**: 실제 사용자 환경에서 LCP 측정을 위해 Web Vitals 라이브러리 추가
8. **총 리소스 크기 최적화**: 홈 2.6MB - 이미지 lazy loading 강화, WebP 포맷 적용 검토

---

## 9. 결론

Spaingogo 앱은 전반적으로 안정적으로 작동합니다. 9개 페이지 모두 200 응답, 성능 지표 A등급, 반응형 레이아웃 이상 없음이 확인됐습니다.

핵심 이슈는 **상황별 추천 필터링 로직의 정밀도**입니다:
- 맛집 24개 상황 중 `⚡ 빠르게 먹자`(빈 결과)와 `🤢 해장이 필요해`(부적절한 결과)는 즉시 수정 권장
- 명소 추천은 전반적으로 양호하나 일부 칩의 결과 수가 과다함

이미지 URL 만료(404) 문제도 사용자 경험에 직접 영향을 주므로 조기 수정을 권장합니다.
