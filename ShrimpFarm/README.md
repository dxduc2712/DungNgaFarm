# MinhDungFarm — Quản Lý Hồ Tôm

Phase 1 MVP for shrimp farm management: Django REST API + React/Tailwind frontend.

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL (optional — SQLite works for local dev)

## Backend setup

```bash
cd ShrimpFarm
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_farm_data
python manage.py runserver 8000
```

### Environment

Copy `.env.example` to `.env`. By default `USE_SQLITE=True` uses `db.sqlite3`.

For PostgreSQL, set:

```env
USE_SQLITE=False
DB_NAME=minhdungfarm
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:5173 and log in with your Django superuser credentials.

## API

- Base URL: `http://localhost:8000/api/v1/`
- Auth: `POST /api/v1/auth/login/` → `{ "access": "...", "refresh": "..." }`
- Use header: `Authorization: Bearer <access>`

Key endpoints:

| Endpoint | Description |
|----------|-------------|
| `/dashboard/` | Dashboard aggregates |
| `/ponds/` | Pond CRUD |
| `/ponds/{id}/feeding-stats/` | Feeding statistics chart data |
| `/sensor-readings/` | Water quality readings |
| `/sensor-alerts/` | Environment alerts |
| `/feeding-records/` | Feeding log entries |
| `/inventory-items/` | Feed inventory |

## Updating mock sensor data

1. Edit `crops/fixtures/sensor-readings.mock.json`
2. Run `python manage.py seed_farm_data --sensors-only`

The React app always reads sensor data from the API, never from the JSON file directly.

## Live ESP32 sensor (pond 1)

ESP32 publishes MQTT JSON with `"pond": 1` (Ao nuôi 1). Copy MQTT settings from `.env.example` into `.env`, then:

```bash
pip install -r requirements.txt
python manage.py mqtt_sensor_bridge
```

Dashboard **Ao nuôi 1** then shows `source: iot` readings. Re-upload the Arduino sketch after changing `POND_ID`.

## Django admin

http://localhost:8000/admin/ — full CRUD for all models.

## Project structure

```
ShrimpFarm/
├── crops/                 # Django app (models, API, seed command)
├── frontend/              # React + Vite + Tailwind UI
├── requirements.txt
├── .env.example
├── README.md
└── NOTES.md
```

## Production notes

- Set `DEBUG=False` and a strong `SECRET_KEY`
- Use PostgreSQL in production
- Serve frontend build (`npm run build`) via nginx or similar
- Configure `CORS_ALLOWED_ORIGINS` for your domain
