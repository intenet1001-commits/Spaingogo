#!/bin/bash

# Spaingogo 실행 스크립트
cd "$(dirname "$0")"

echo "🇪🇸 Spaingogo 시작 중..."
echo "📍 기준 호텔: Hotel & SPA Villa Olimpic@Suites"
echo ""

# 포트 9020 사용 중인 프로세스 확인 후 종료
PID=$(lsof -ti:9020 2>/dev/null)
if [ -n "$PID" ]; then
  echo "⚠️  포트 9020 사용 중 → 기존 서버 종료..."
  kill $PID 2>/dev/null
  sleep 1
fi

echo "🚀 개발 서버 실행 중 (포트 9020)..."
echo ""

# 브라우저 자동 열기 (2초 후)
sleep 2 && open http://localhost:9020 &

# Next.js 개발 서버 실행
./node_modules/.bin/next dev -p 9020
