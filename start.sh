#!/usr/bin/env bash
# FinCommand — Financial Command Center
# Starts both the backend API and the frontend dev server

set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║          FinCommand — Financial Command Center        ║"
echo "║           Executive Intelligence Platform             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Backend ──────────────────────────────────────────────────────────────────
echo "▶ Starting backend API..."
cd "$(dirname "$0")/backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "  ✓ API running at http://localhost:8000"
echo "  ✓ API docs at   http://localhost:8000/docs"

# ── Frontend ─────────────────────────────────────────────────────────────────
echo ""
echo "▶ Starting frontend..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!
echo "  ✓ App running at http://localhost:5173"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Open http://localhost:5173 in your browser"
echo "  Press Ctrl+C to stop all services"
echo "═══════════════════════════════════════════════════════"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Stopped.'; exit 0" INT
wait
