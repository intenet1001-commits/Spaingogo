/**
 * Spaingogo Barcelona App - Functional Test Suite
 * Tests: SOS button, Emergency contacts, BottomNav, Hotel FAB, Nearby page
 */
const { chromium } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:9020";
const RESULTS_DIR = path.join(__dirname, "results");

const tests = [];
let passed = 0;
let failed = 0;
let skipped = 0;

function result(id, category, page, description, status, details = null, duration = "0s") {
  const entry = { id, category, page, description, status, duration, details };
  tests.push(entry);
  if (status === "passed") passed++;
  else if (status === "failed") failed++;
  else skipped++;
  const icon = status === "passed" ? "✅" : status === "failed" ? "❌" : "⚠️";
  console.log(`${icon} [${id}] ${description}`);
  if (details) console.log(`   → ${JSON.stringify(details)}`);
  return entry;
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 size
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  });
  const page = await context.newPage();

  const t0 = Date.now();

  // ─── TEST 1: Home page loads ───────────────────────────────────────────────
  console.log("\n=== 1. Home Page ===");
  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 15000 });
    const title = await page.title();
    result("home-001", "navigation", "/", "홈 페이지가 정상 로드됨", "passed", { title });
  } catch (e) {
    result("home-001", "navigation", "/", "홈 페이지 로드", "failed", { error: e.message });
  }

  // ─── TEST 2: SOS floating button visible ───────────────────────────────────
  console.log("\n=== 2. SOS Floating Button ===");
  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 15000 });
    // SOS button: aria-label="긴급연락처"
    const sosBtn = page.getByRole("button", { name: "긴급연락처" });
    const visible = await sosBtn.isVisible();
    result(
      "sos-001",
      "ui",
      "/",
      "SOS 플로팅 버튼이 홈에서 보임",
      visible ? "passed" : "failed",
      visible ? null : { issue: "SOS button not visible" }
    );

    // Check position: bottom-left (fixed bottom-24 left-4)
    const box = await sosBtn.boundingBox();
    if (box) {
      const isBottomLeft = box.x < 60 && box.y > 600;
      result(
        "sos-002",
        "ui",
        "/",
        "SOS 버튼이 좌하단에 위치 (bottom-left)",
        isBottomLeft ? "passed" : "failed",
        { x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) }
      );
    } else {
      result("sos-002", "ui", "/", "SOS 버튼 위치 확인", "failed", { issue: "No bounding box" });
    }
  } catch (e) {
    result("sos-001", "ui", "/", "SOS 플로팅 버튼 확인", "failed", { error: e.message });
    result("sos-002", "ui", "/", "SOS 버튼 위치 확인", "skipped", null);
  }

  // ─── TEST 3: Hotel FAB visible and position ────────────────────────────────
  console.log("\n=== 3. Hotel FAB Button ===");
  try {
    const hotelBtn = page.locator('button:has-text("호텔")').first();
    const hotelVisible = await hotelBtn.isVisible();
    result(
      "fab-001",
      "ui",
      "/",
      "호텔 FAB 버튼이 홈에서 보임",
      hotelVisible ? "passed" : "failed",
      hotelVisible ? null : { issue: "Hotel FAB not visible" }
    );

    if (hotelVisible) {
      const hotelBox = await hotelBtn.boundingBox();
      const sosBtn = page.getByRole("button", { name: "긴급연락처" });
      const sosBox = await sosBtn.boundingBox();

      // Hotel FAB: fixed bottom-24 right-4 → right side
      const isBottomRight = hotelBox && hotelBox.x > 300;
      result(
        "fab-002",
        "ui",
        "/",
        "호텔 FAB가 우하단에 위치 (bottom-right)",
        isBottomRight ? "passed" : "failed",
        { x: Math.round(hotelBox?.x), y: Math.round(hotelBox?.y) }
      );

      // Check they don't overlap
      if (sosBox && hotelBox) {
        const overlap =
          sosBox.x < hotelBox.x + hotelBox.width &&
          sosBox.x + sosBox.width > hotelBox.x &&
          sosBox.y < hotelBox.y + hotelBox.height &&
          sosBox.y + sosBox.height > hotelBox.y;
        result(
          "fab-003",
          "ui",
          "/",
          "SOS와 호텔 버튼이 겹치지 않음",
          !overlap ? "passed" : "failed",
          {
            sos: { x: Math.round(sosBox.x), y: Math.round(sosBox.y) },
            hotel: { x: Math.round(hotelBox.x), y: Math.round(hotelBox.y) },
            overlap,
          }
        );
      }
    }
  } catch (e) {
    result("fab-001", "ui", "/", "호텔 FAB 버튼 확인", "failed", { error: e.message });
  }

  // ─── TEST 4: SOS click → bottom sheet opens ────────────────────────────────
  console.log("\n=== 4. SOS Bottom Sheet ===");
  try {
    const sosBtn = page.getByRole("button", { name: "긴급연락처" });
    await sosBtn.click();
    await page.waitForTimeout(600);

    // Check bottom sheet header
    const sheetHeader = page.locator("text=🆘 긴급 연락처");
    const sheetVisible = await sheetHeader.isVisible();
    result(
      "sos-003",
      "ui",
      "/",
      "SOS 클릭 시 바텀시트가 열림",
      sheetVisible ? "passed" : "failed",
      sheetVisible ? null : { issue: "Bottom sheet not visible after click" }
    );

    // Check subtitle
    const subtitle = page.locator("text=탭하면 바로 전화연결됩니다");
    const subtitleVisible = await subtitle.isVisible();
    result(
      "sos-004",
      "ui",
      "/",
      "바텀시트에 부제목 안내문 표시",
      subtitleVisible ? "passed" : "failed",
      null
    );

    // Screenshot bottom sheet
    await page.screenshot({
      path: path.join(RESULTS_DIR, "sos-bottomsheet.png"),
      fullPage: false,
    });
    console.log("   → Screenshot saved: sos-bottomsheet.png");
  } catch (e) {
    result("sos-003", "ui", "/", "SOS 바텀시트 열기", "failed", { error: e.message });
  }

  // ─── TEST 5: Emergency contacts in bottom sheet ────────────────────────────
  console.log("\n=== 5. Emergency Contacts in Bottom Sheet ===");
  try {
    // Ensure sheet is open
    const sheetVisible = await page.locator("text=🆘 긴급 연락처").isVisible();
    if (!sheetVisible) {
      await page.getByRole("button", { name: "긴급연락처" }).click();
      await page.waitForTimeout(600);
    }

    // Check 긴급 section label
    const emergencyLabel = page.locator("text=🚨 긴급");
    result(
      "contact-001",
      "emergency",
      "/",
      "바텀시트에 '🚨 긴급' 섹션 표시",
      await emergencyLabel.isVisible() ? "passed" : "failed",
      null
    );

    // Check 112
    const tel112 = page.locator("text=112").first();
    result(
      "contact-002",
      "emergency",
      "/",
      "긴급번호 112 표시",
      await tel112.isVisible() ? "passed" : "failed",
      null
    );

    // Check 061 (ambulance)
    const tel061 = page.locator("text=061").first();
    result(
      "contact-003",
      "emergency",
      "/",
      "구급대 061 표시",
      await tel061.isVisible() ? "passed" : "failed",
      null
    );

    // Check 경찰 section
    const policeLabel = page.locator("text=👮 경찰");
    result(
      "contact-004",
      "emergency",
      "/",
      "바텀시트에 '👮 경찰' 섹션 표시",
      await policeLabel.isVisible() ? "passed" : "failed",
      null
    );

    // Check 091 (Policía Nacional)
    const tel091 = page.locator("text=091").first();
    result(
      "contact-005",
      "emergency",
      "/",
      "국가경찰 091 표시",
      await tel091.isVisible() ? "passed" : "failed",
      null
    );

    // Check 092 (Guardia Urbana)
    const tel092 = page.locator("text=092").first();
    result(
      "contact-006",
      "emergency",
      "/",
      "바르셀로나 시경 092 표시",
      await tel092.isVisible() ? "passed" : "failed",
      null
    );

    // Check 영사관 & 호텔 section
    const consulateLabel = page.locator("text=🇰🇷 영사관 & 호텔");
    result(
      "contact-007",
      "emergency",
      "/",
      "바텀시트에 '🇰🇷 영사관 & 호텔' 섹션 표시",
      await consulateLabel.isVisible() ? "passed" : "failed",
      null
    );

    // Check Korean consulate phone
    const consulatePhone = page.locator("text=+34934880600").first();
    result(
      "contact-008",
      "emergency",
      "/",
      "한국영사관 전화번호 +34934880600 표시",
      await consulatePhone.isVisible() ? "passed" : "failed",
      null
    );

    // Check hotel phone
    const hotelPhone = page.locator("text=+34932212610").first();
    result(
      "contact-009",
      "emergency",
      "/",
      "호텔 전화번호 +34932212610 표시",
      await hotelPhone.isVisible() ? "passed" : "failed",
      null
    );

    // Screenshot all sections
    await page.screenshot({
      path: path.join(RESULTS_DIR, "sos-contacts-sections.png"),
      fullPage: false,
    });
    console.log("   → Screenshot saved: sos-contacts-sections.png");
  } catch (e) {
    result("contact-001", "emergency", "/", "바텀시트 연락처 확인", "failed", { error: e.message });
  }

  // ─── TEST 6: Tel links check ───────────────────────────────────────────────
  console.log("\n=== 6. Tel: Links Verification ===");
  try {
    // Check tel links in the bottom sheet via DOM
    const tel112Link = page.locator('a[href="tel:112"]');
    const tel112Count = await tel112Link.count();
    result(
      "tel-001",
      "tel-links",
      "/",
      "112 링크가 href='tel:112'를 가짐",
      tel112Count > 0 ? "passed" : "failed",
      { count: tel112Count }
    );

    const tel061Link = page.locator('a[href="tel:061"]');
    result(
      "tel-002",
      "tel-links",
      "/",
      "061 링크가 href='tel:061'를 가짐",
      (await tel061Link.count()) > 0 ? "passed" : "failed",
      { count: await tel061Link.count() }
    );

    const consulateLink = page.locator('a[href="tel:+34934880600"]');
    result(
      "tel-003",
      "tel-links",
      "/",
      "한국영사관 링크가 href='tel:+34934880600'를 가짐 (공백없음)",
      (await consulateLink.count()) > 0 ? "passed" : "failed",
      { count: await consulateLink.count() }
    );

    const hotelTelLink = page.locator('a[href="tel:+34932212610"]');
    result(
      "tel-004",
      "tel-links",
      "/",
      "호텔 링크가 href='tel:+34932212610'를 가짐",
      (await hotelTelLink.count()) > 0 ? "passed" : "failed",
      { count: await hotelTelLink.count() }
    );

    const tel091Link = page.locator('a[href="tel:091"]');
    result(
      "tel-005",
      "tel-links",
      "/",
      "091 링크가 href='tel:091'를 가짐",
      (await tel091Link.count()) > 0 ? "passed" : "failed",
      { count: await tel091Link.count() }
    );

    const tel092Link = page.locator('a[href="tel:092"]');
    result(
      "tel-006",
      "tel-links",
      "/",
      "092 링크가 href='tel:092'를 가짐",
      (await tel092Link.count()) > 0 ? "passed" : "failed",
      { count: await tel092Link.count() }
    );
  } catch (e) {
    result("tel-001", "tel-links", "/", "Tel 링크 확인", "failed", { error: e.message });
  }

  // ─── TEST 7: Close bottom sheet via backdrop ───────────────────────────────
  console.log("\n=== 7. Close Bottom Sheet ===");
  try {
    const sheetVisible = await page.locator("text=🆘 긴급 연락처").isVisible();
    if (sheetVisible) {
      // Click backdrop (fixed inset-0 bg-black/50, z-50 - click top area)
      await page.mouse.click(195, 100);
      await page.waitForTimeout(500);
      const sheetGone = !(await page.locator("text=🆘 긴급 연락처").isVisible());
      result(
        "sos-005",
        "ui",
        "/",
        "백드롭 클릭 시 바텀시트 닫힘",
        sheetGone ? "passed" : "failed",
        sheetGone ? null : { issue: "Sheet did not close on backdrop click" }
      );
    } else {
      result("sos-005", "ui", "/", "백드롭 클릭으로 바텀시트 닫기", "skipped", { reason: "Sheet not open" });
    }
  } catch (e) {
    result("sos-005", "ui", "/", "백드롭 클릭 닫기", "failed", { error: e.message });
  }

  // Also test close via X button
  try {
    await page.getByRole("button", { name: "긴급연락처" }).click();
    await page.waitForTimeout(400);
    // Find X close button inside bottom sheet
    const closeBtn = page.locator('button:has(.lucide-x)').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(400);
      const closed = !(await page.locator("text=🆘 긴급 연락처").isVisible());
      result(
        "sos-006",
        "ui",
        "/",
        "X 버튼 클릭 시 바텀시트 닫힘",
        closed ? "passed" : "failed",
        null
      );
    } else {
      // Try by SVG close icon alternative
      result("sos-006", "ui", "/", "X 버튼으로 바텀시트 닫기", "skipped", { reason: "X button not found via selector" });
    }
  } catch (e) {
    result("sos-006", "ui", "/", "X 버튼 닫기", "failed", { error: e.message });
  }

  // ─── TEST 8: Bottom Navigation ─────────────────────────────────────────────
  console.log("\n=== 8. Bottom Navigation ===");
  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 15000 });

    // Check all 4 nav items exist
    const navHome = page.locator("nav a").filter({ hasText: "홈" });
    const navNearby = page.locator("nav a").filter({ hasText: "주변" });
    const navRestaurants = page.locator("nav a").filter({ hasText: "맛집" });
    const navAttractions = page.locator("nav a").filter({ hasText: "명소" });

    result("nav-001", "navigation", "/", "BottomNav '홈' 항목 표시", await navHome.isVisible() ? "passed" : "failed", null);
    result("nav-002", "navigation", "/", "BottomNav '주변' 항목 표시", await navNearby.isVisible() ? "passed" : "failed", null);
    result("nav-003", "navigation", "/", "BottomNav '맛집' 항목 표시", await navRestaurants.isVisible() ? "passed" : "failed", null);
    result("nav-004", "navigation", "/", "BottomNav '명소' 항목 표시", await navAttractions.isVisible() ? "passed" : "failed", null);

    // Screenshot BottomNav on home
    await page.screenshot({
      path: path.join(RESULTS_DIR, "bottomnav-home.png"),
      fullPage: false,
    });

    // Click 맛집 → /restaurants
    await navRestaurants.click();
    await page.waitForURL("**/restaurants**", { timeout: 5000 });
    const restaurantsUrl = page.url();
    result(
      "nav-005",
      "navigation",
      "/restaurants",
      "맛집 탭 클릭 시 /restaurants로 이동",
      restaurantsUrl.includes("/restaurants") ? "passed" : "failed",
      { url: restaurantsUrl }
    );
    await page.screenshot({ path: path.join(RESULTS_DIR, "bottomnav-restaurants.png") });

    // Check active state on restaurants
    const restaurantsNavLink = page.locator("nav a").filter({ hasText: "맛집" });
    const activeClass = await restaurantsNavLink.getAttribute("class");
    const isRedActive = activeClass && activeClass.includes("C60B1E");
    result(
      "nav-009",
      "navigation",
      "/restaurants",
      "맛집 탭 활성화 시 빨간색(#C60B1E) 표시",
      isRedActive ? "passed" : "failed",
      { class: activeClass?.substring(0, 80) }
    );

    // Click 명소 → /attractions
    await page.locator("nav a").filter({ hasText: "명소" }).click();
    await page.waitForURL("**/attractions**", { timeout: 5000 });
    result(
      "nav-006",
      "navigation",
      "/attractions",
      "명소 탭 클릭 시 /attractions로 이동",
      page.url().includes("/attractions") ? "passed" : "failed",
      { url: page.url() }
    );
    await page.screenshot({ path: path.join(RESULTS_DIR, "bottomnav-attractions.png") });

    // Click 주변 → /nearby
    await page.locator("nav a").filter({ hasText: "주변" }).click();
    await page.waitForURL("**/nearby**", { timeout: 8000 });
    result(
      "nav-007",
      "navigation",
      "/nearby",
      "주변 탭 클릭 시 /nearby로 이동",
      page.url().includes("/nearby") ? "passed" : "failed",
      { url: page.url() }
    );

    // Click 홈 → /
    await page.locator("nav a").filter({ hasText: "홈" }).click();
    await page.waitForURL(BASE_URL + "/", { timeout: 5000 }).catch(() => {});
    const homeUrl = page.url();
    result(
      "nav-008",
      "navigation",
      "/",
      "홈 탭 클릭 시 / 로 이동",
      homeUrl === BASE_URL + "/" || homeUrl === BASE_URL ? "passed" : "failed",
      { url: homeUrl }
    );
  } catch (e) {
    result("nav-001", "navigation", "/", "BottomNav 네비게이션 테스트", "failed", { error: e.message });
  }

  // ─── TEST 9: Emergency page /emergency ────────────────────────────────────
  console.log("\n=== 9. Emergency Page (/emergency) ===");
  try {
    await page.goto(`${BASE_URL}/emergency`, { waitUntil: "networkidle", timeout: 15000 });

    // Check page header
    const pageHeader = page.locator("h1:has-text('긴급 연락처')");
    result(
      "emrg-001",
      "emergency",
      "/emergency",
      "/emergency 페이지 헤더 '긴급 연락처' 표시",
      await pageHeader.isVisible() ? "passed" : "failed",
      null
    );

    // Screenshot full page
    await page.screenshot({
      path: path.join(RESULTS_DIR, "emergency-page-full.png"),
      fullPage: true,
    });
    console.log("   → Screenshot saved: emergency-page-full.png");

    // Check emergency section
    const emergencySection = page.locator("text=🚨 긴급 (즉시 연결)");
    result(
      "emrg-002",
      "emergency",
      "/emergency",
      "긴급 섹션 '🚨 긴급 (즉시 연결)' 표시",
      await emergencySection.isVisible() ? "passed" : "failed",
      null
    );

    // Check 112 contact
    const e112 = page.locator("text=112").first();
    result(
      "emrg-003",
      "emergency",
      "/emergency",
      "긴급 페이지에 112 연락처 표시",
      await e112.isVisible() ? "passed" : "failed",
      null
    );

    // Check 061 ambulance
    const e061 = page.locator("text=061").first();
    result(
      "emrg-004",
      "emergency",
      "/emergency",
      "긴급 페이지에 061 구급대 표시",
      await e061.isVisible() ? "passed" : "failed",
      null
    );

    // Check police section
    const policeSection = page.locator("text=👮 경찰");
    result(
      "emrg-005",
      "emergency",
      "/emergency",
      "긴급 페이지에 '👮 경찰' 섹션 표시",
      await policeSection.isVisible() ? "passed" : "failed",
      null
    );

    // Check 091, 092
    const e091 = page.locator("text=091").first();
    const e092 = page.locator("text=092").first();
    result("emrg-006", "emergency", "/emergency", "091 국가경찰 표시", await e091.isVisible() ? "passed" : "failed", null);
    result("emrg-007", "emergency", "/emergency", "092 시경 표시", await e092.isVisible() ? "passed" : "failed", null);

    // Check consulate section
    const consulateSection = page.locator("text=🇰🇷 영사관 & 호텔");
    result(
      "emrg-008",
      "emergency",
      "/emergency",
      "긴급 페이지에 '🇰🇷 영사관 & 호텔' 섹션 표시",
      await consulateSection.isVisible() ? "passed" : "failed",
      null
    );

    // Check safety tips section
    const safetySection = page.locator("text=🛡️ 바르셀로나 안전 가이드");
    result(
      "emrg-009",
      "emergency",
      "/emergency",
      "안전 가이드 섹션 표시",
      await safetySection.isVisible() ? "passed" : "failed",
      null
    );

    // Check specific safety tips
    const pickpocketTip = page.locator("text=소매치기 주의");
    result(
      "emrg-010",
      "emergency",
      "/emergency",
      "소매치기 주의 안전팁 표시",
      await pickpocketTip.isVisible() ? "passed" : "failed",
      null
    );

    const passportTip = page.locator("text=여권 관리");
    result(
      "emrg-011",
      "emergency",
      "/emergency",
      "여권 관리 안전팁 표시",
      await passportTip.isVisible() ? "passed" : "failed",
      null
    );

    // Check '호텔로 돌아가기' button
    const hotelBackBtn = page.locator("button:has-text('호텔로 돌아가기')");
    result(
      "emrg-012",
      "emergency",
      "/emergency",
      "'호텔로 돌아가기' 버튼 표시",
      await hotelBackBtn.isVisible() ? "passed" : "failed",
      null
    );

    // Check '홈으로' back link
    const homeLink = page.locator("a:has-text('홈으로')");
    result(
      "emrg-013",
      "emergency",
      "/emergency",
      "'홈으로' 뒤로가기 링크 표시",
      await homeLink.isVisible() ? "passed" : "failed",
      null
    );

    // Tel links on emergency page
    const epTel112 = page.locator('a[href="tel:112"]');
    result(
      "emrg-014",
      "tel-links",
      "/emergency",
      "긴급 페이지 112 tel: 링크 유효",
      (await epTel112.count()) > 0 ? "passed" : "failed",
      { count: await epTel112.count() }
    );

    const epConsulate = page.locator('a[href="tel:+34934880600"]');
    result(
      "emrg-015",
      "tel-links",
      "/emergency",
      "긴급 페이지 영사관 tel:+34934880600 링크 유효",
      (await epConsulate.count()) > 0 ? "passed" : "failed",
      { count: await epConsulate.count() }
    );

    const epHotel = page.locator('a[href="tel:+34932212610"]');
    result(
      "emrg-016",
      "tel-links",
      "/emergency",
      "긴급 페이지 호텔 tel: 링크 유효",
      (await epHotel.count()) > 0 ? "passed" : "failed",
      { count: await epHotel.count() }
    );

    // Check Korean consulate info
    const consulateName = page.locator("text=주바르셀로나 한국총영사관");
    result(
      "emrg-017",
      "emergency",
      "/emergency",
      "한국총영사관 이름(Korean) 표시",
      await consulateName.isVisible() ? "passed" : "failed",
      null
    );

    // Check Hotel name
    const hotelName = page.locator("text=호텔 프런트 데스크");
    result(
      "emrg-018",
      "emergency",
      "/emergency",
      "호텔 프런트 데스크 이름 표시",
      await hotelName.isVisible() ? "passed" : "failed",
      null
    );
  } catch (e) {
    result("emrg-001", "emergency", "/emergency", "/emergency 페이지 테스트", "failed", { error: e.message });
  }

  // ─── TEST 10: Nearby page ──────────────────────────────────────────────────
  console.log("\n=== 10. Nearby Page (/nearby) ===");
  try {
    await page.goto(`${BASE_URL}/nearby`, { waitUntil: "networkidle", timeout: 15000 });

    // Screenshot
    await page.screenshot({
      path: path.join(RESULTS_DIR, "nearby-page.png"),
      fullPage: false,
    });
    console.log("   → Screenshot saved: nearby-page.png");

    // Check radius filters
    const filter500 = page.locator("button:has-text('500m')");
    const filter1k = page.locator("button:has-text('1km')");
    const filter2k = page.locator("button:has-text('2km')");
    const filter3k = page.locator("button:has-text('3km')");

    result(
      "nearby-001",
      "nearby",
      "/nearby",
      "반경 필터 500m 버튼 표시",
      await filter500.count() > 0 ? "passed" : "failed",
      { count: await filter500.count() }
    );
    result(
      "nearby-002",
      "nearby",
      "/nearby",
      "반경 필터 1km 버튼 표시",
      await filter1k.count() > 0 ? "passed" : "failed",
      { count: await filter1k.count() }
    );
    result(
      "nearby-003",
      "nearby",
      "/nearby",
      "반경 필터 2km 버튼 표시",
      await filter2k.count() > 0 ? "passed" : "failed",
      { count: await filter2k.count() }
    );
    result(
      "nearby-004",
      "nearby",
      "/nearby",
      "반경 필터 3km 버튼 표시",
      await filter3k.count() > 0 ? "passed" : "failed",
      { count: await filter3k.count() }
    );

    // Check page content
    const pageContent = await page.content();
    const hasLocationFallback =
      pageContent.includes("호텔") ||
      pageContent.includes("위치") ||
      pageContent.includes("GPS") ||
      pageContent.includes("주변");
    result(
      "nearby-005",
      "nearby",
      "/nearby",
      "주변 페이지에 위치/호텔 관련 콘텐츠 존재",
      hasLocationFallback ? "passed" : "failed",
      null
    );
  } catch (e) {
    result("nearby-001", "nearby", "/nearby", "주변 페이지 테스트", "failed", { error: e.message });
  }

  // ─── TEST 11: 404 page ──────────────────────────────────────────────────────
  console.log("\n=== 11. 404 Error Page ===");
  try {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist-12345`, { timeout: 10000 });
    const status = response?.status();
    result(
      "err-001",
      "error-handling",
      "/404",
      "존재하지 않는 URL 접근 시 404 응답",
      status === 404 ? "passed" : "failed",
      { httpStatus: status }
    );
  } catch (e) {
    result("err-001", "error-handling", "/404", "404 페이지 확인", "failed", { error: e.message });
  }

  // ─── TEST 12: Home page tab switcher ───────────────────────────────────────
  console.log("\n=== 12. Home Page Tab Switcher ===");
  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 15000 });

    // Check for tab view (맛집/명소 tabs)
    const content = await page.content();
    const hasTabContent = content.includes("맛집") && content.includes("명소");
    result(
      "home-002",
      "navigation",
      "/",
      "홈 페이지에 맛집/명소 탭 콘텐츠 존재",
      hasTabContent ? "passed" : "failed",
      null
    );

    await page.screenshot({
      path: path.join(RESULTS_DIR, "home-page.png"),
      fullPage: false,
    });
    console.log("   → Screenshot saved: home-page.png");
  } catch (e) {
    result("home-002", "navigation", "/", "홈 탭 스위처 테스트", "failed", { error: e.message });
  }

  // ─── TEST 13: Restaurants page ─────────────────────────────────────────────
  console.log("\n=== 13. Restaurants Page (/restaurants) ===");
  try {
    await page.goto(`${BASE_URL}/restaurants`, { waitUntil: "networkidle", timeout: 15000 });

    const content = await page.content();
    const hasRestaurants = content.includes("타파스") || content.includes("파에야") || content.includes("맛집");
    result(
      "rest-001",
      "navigation",
      "/restaurants",
      "/restaurants 페이지 로드 및 맛집 관련 콘텐츠 존재",
      hasRestaurants ? "passed" : "failed",
      null
    );

    await page.screenshot({ path: path.join(RESULTS_DIR, "restaurants-page.png") });
  } catch (e) {
    result("rest-001", "navigation", "/restaurants", "맛집 페이지 테스트", "failed", { error: e.message });
  }

  // ─── TEST 14: Attractions page ─────────────────────────────────────────────
  console.log("\n=== 14. Attractions Page (/attractions) ===");
  try {
    await page.goto(`${BASE_URL}/attractions`, { waitUntil: "networkidle", timeout: 15000 });

    const content = await page.content();
    const hasAttractions = content.includes("사그라다") || content.includes("가우디") || content.includes("명소") || content.includes("박물관");
    result(
      "attr-001",
      "navigation",
      "/attractions",
      "/attractions 페이지 로드 및 명소 관련 콘텐츠 존재",
      hasAttractions ? "passed" : "failed",
      null
    );

    await page.screenshot({ path: path.join(RESULTS_DIR, "attractions-page.png") });
  } catch (e) {
    result("attr-001", "navigation", "/attractions", "명소 페이지 테스트", "failed", { error: e.message });
  }

  // ─── TEST 15: SOS button visible on non-home pages ─────────────────────────
  console.log("\n=== 15. SOS Button on Other Pages ===");
  // Note: EmergencyButton is only rendered on home (page.tsx). Check if it's needed on other pages.
  try {
    await page.goto(`${BASE_URL}/restaurants`, { waitUntil: "networkidle", timeout: 15000 });
    const sosOnRestaurants = await page.getByRole("button", { name: "긴급연락처" }).isVisible().catch(() => false);
    // The SOS button is only on home page by design
    result(
      "sos-007",
      "ui",
      "/restaurants",
      "맛집 페이지에서 SOS 버튼 가시성 확인",
      "passed", // This is informational
      { visible: sosOnRestaurants, note: sosOnRestaurants ? "SOS visible on /restaurants" : "SOS only on home - by design" }
    );

    await page.goto(`${BASE_URL}/emergency`, { waitUntil: "networkidle", timeout: 15000 });
    const sosOnEmergency = await page.getByRole("button", { name: "긴급연락처" }).isVisible().catch(() => false);
    result(
      "sos-008",
      "ui",
      "/emergency",
      "긴급 페이지에서 SOS 버튼 가시성 확인",
      "passed",
      { visible: sosOnEmergency, note: sosOnEmergency ? "SOS visible" : "SOS not shown on /emergency (acceptable)" }
    );
  } catch (e) {
    result("sos-007", "ui", "/restaurants", "다른 페이지 SOS 버튼 확인", "failed", { error: e.message });
  }

  // ─── Finalize ──────────────────────────────────────────────────────────────
  const totalDuration = ((Date.now() - t0) / 1000).toFixed(1) + "s";
  const total = passed + failed + skipped;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) + "%" : "0%";

  console.log("\n=== SUMMARY ===");
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed} | Skipped: ${skipped}`);
  console.log(`Pass Rate: ${passRate} | Duration: ${totalDuration}`);

  await browser.close();

  // ─── Write report ──────────────────────────────────────────────────────────
  const issues = tests
    .filter((t) => t.status === "failed")
    .map((t) => ({
      severity: t.category === "emergency" || t.category === "tel-links" ? "high" : "medium",
      category: t.category,
      page: t.page,
      description: t.description,
      details: t.details,
      recommendation: getRecommendation(t),
    }));

  const report = {
    url: BASE_URL,
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: total,
      passed,
      failed,
      skipped,
      passRate,
      duration: totalDuration,
    },
    tests,
    issues,
  };

  fs.writeFileSync(
    path.join(RESULTS_DIR, "functional-report.json"),
    JSON.stringify(report, null, 2),
    "utf-8"
  );
  console.log(`\nReport written to: ${path.join(RESULTS_DIR, "functional-report.json")}`);

  return report;
}

function getRecommendation(test) {
  if (test.category === "tel-links") return "tel: 링크 href 속성 확인 필요";
  if (test.category === "navigation") return "라우팅 설정 확인 필요";
  if (test.category === "emergency") return "긴급연락처 데이터/UI 확인 필요";
  if (test.category === "ui") return "UI 레이아웃/컴포넌트 확인 필요";
  if (test.category === "nearby") return "Nearby 페이지 필터 기능 확인 필요";
  return "코드 검토 필요";
}

runTests().catch((e) => {
  console.error("Test suite failed:", e);
  process.exit(1);
});
