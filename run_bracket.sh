#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$HOME/.local/bin:$PATH"
cd "$(dirname "$0")"
echo "Starting Bracket Generator..."
echo "Open http://localhost:5173 in your browser."
echo "Keep this window open. Press Ctrl+C to stop."
echo ""
npm run dev
