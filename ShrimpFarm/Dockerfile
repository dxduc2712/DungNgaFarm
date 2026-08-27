# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_BASE_URL=
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
COPY --from=frontend /app/frontend/dist /app/frontend/dist
ENV DJANGO_SETTINGS_MODULE=ShrimpFarm.settings \
    SECRET_KEY=build-time-only \
    DEBUG=False \
    USE_SQLITE=True
RUN python manage.py collectstatic --noinput
RUN chmod +x bin/start.sh bin/build.sh
CMD ["./bin/start.sh"]
