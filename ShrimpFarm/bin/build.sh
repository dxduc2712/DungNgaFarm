#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
cd frontend
npm ci
VITE_API_BASE_URL= npm run build
cd ..
pip install -r requirements.txt
python manage.py collectstatic --noinput
