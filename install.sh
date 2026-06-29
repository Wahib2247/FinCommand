#!/usr/bin/env bash
# FinCommand — One-time setup script

set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║          FinCommand — Setup                           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

ROOT="$(dirname "$0")"

echo "▶ Installing Python dependencies..."
cd "$ROOT/backend"
pip install -r requirements.txt
echo "  ✓ Python dependencies installed"

echo ""
echo "▶ Installing frontend dependencies..."
cd "$ROOT/frontend"
npm install
echo "  ✓ Frontend dependencies installed"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Setup complete! Run:  bash start.sh"
echo "═══════════════════════════════════════════════════════"
echo ""
