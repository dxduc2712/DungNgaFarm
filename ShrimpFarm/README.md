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
├── Dockerfile             # Production image (Node build + Gunicorn)
├── Procfile
├── requirements.txt
├── .env.example
├── README.md
└── NOTES.md
```

Repo root also has `render.yaml` for Render Blueprint.

## Production notes

- Set `DEBUG=False` and a strong `SECRET_KEY`
- Use PostgreSQL in production (`DATABASE_URL`)
- Serve frontend build from Django (WhiteNoise); one Gunicorn worker so MQTT stays unique
- Configure `CORS_ALLOWED_ORIGINS` / `FRONTEND_URL` for your domain

## Deploy (GitHub + Render)

GitHub only stores the repo. Render (or Railway) runs it and gives a public HTTPS URL.

1. Push this repo to GitHub (`main`).
2. On [Render](https://render.com): **New → Blueprint** and select `dxduc2712/DungNgaFarm`, or create a **Web Service** with:
   - Runtime: **Docker**
   - Dockerfile path: `ShrimpFarm/Dockerfile`
   - Context: `ShrimpFarm`
3. Add a **PostgreSQL** database and set `DATABASE_URL` (Blueprint `render.yaml` does this).
4. Set env vars (do not commit secrets): `SECRET_KEY`, `DEBUG=False`, `MQTT_USER`, `MQTT_PASSWORD`, `MQTT_HOST`. For forgot-password email, also set `EMAIL_HOST`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL` (Gmail App Password, not the Google login password). `RENDER_EXTERNAL_HOSTNAME` is set automatically.
5. After the first deploy, open the Render **Shell** and run:

```bash
python manage.py createsuperuser
python manage.py seed_farm_data
```

6. Later deploys: `git push origin main`.

Local production-like check:

```bash
cd ShrimpFarm/frontend && VITE_API_BASE_URL= npm run build && cd ..
gunicorn ShrimpFarm.wsgi:application --bind 0.0.0.0:8000 --workers 1
```

Open http://localhost:8000 (not :5173). Keep `--workers 1` so only one MQTT client id connects to HiveMQ.

ESP32 stays on HiveMQ Cloud; the server subscribes using `MQTT_*`.
