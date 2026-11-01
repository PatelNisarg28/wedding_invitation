#!/bin/bash
# Double-click this file in Finder to run the wedding website on this Mac.
cd "$(dirname "$0")" || exit 1
export WRANGLER_SEND_METRICS=false CI=true

echo ""
echo "  Nisarg & Devanshi · starting the wedding website locally…"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "  Node.js is not installed. Please install the LTS version from https://nodejs.org"
  echo "  and then double-click this file again."
  open "https://nodejs.org/en/download"
  read -r -p "  Press Enter to close…" _
  exit 1
fi

MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$MAJOR" -lt 20 ]; then
  echo "  Your Node.js version is $(node -v). Version 20 or newer is needed — please update from https://nodejs.org"
  open "https://nodejs.org/en/download"
  read -r -p "  Press Enter to close…" _
  exit 1
fi

[ -f .dev.vars ] || cp .dev.vars.example .dev.vars

if [ ! -d node_modules ]; then
  echo "  Installing packages (first run only, takes a minute)…"
  npm install --no-audit --no-fund || { read -r -p "  npm install failed. Press Enter to close…" _; exit 1; }
fi

echo "  Preparing the local RSVP database…"
npx wrangler d1 migrations apply nwd-rsvp --local >/dev/null 2>&1 || npx wrangler d1 migrations apply nwd-rsvp --local

echo "  Building the website…"
npm run build >/dev/null || { npm run build; read -r -p "  Build failed. Press Enter to close…" _; exit 1; }

ADMIN_KEY=$(grep ADMIN_TOKEN .dev.vars | cut -d'"' -f2)
echo ""
echo "  ✅ Website:   http://127.0.0.1:8788"
echo "  🔐 RSVP admin: http://127.0.0.1:8788/admin   (access key: $ADMIN_KEY)"
echo "  📱 On your phone (same Wi-Fi): http://$(ipconfig getifaddr en0 2>/dev/null || echo 'YOUR-MAC-IP'):8788"
echo ""
echo "  Keep this window open while you browse. Press Ctrl+C to stop."
echo ""
(sleep 5; open "http://127.0.0.1:8788") &
npx wrangler pages dev dist --port 8788 --ip 0.0.0.0
