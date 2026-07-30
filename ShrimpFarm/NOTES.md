# MinhDungFarm — Phase 1 Notes

## Assumptions

- Django project name stays `ShrimpFarm`; product UI name is **MinhDungFarm**.
- Inventory `quantity` is tracked in **kg** (integer). Feeding records deduct rounded kg on save.
- No `DailyLog`, `FeedStock`, or `MedicineStock` models — mapped to existing `FeedingRecord`, `InventoryItem`, and water activity models.
- Pond status is derived from `active` flag + active crop, not a separate status field.
- JWT access tokens only (no refresh rotation in Phase 1).

## Phase 1 sensors (mock JSON)

1. Edit `crops/fixtures/sensor-readings.mock.json`
2. Ensure `pond_name` matches seeded pond names (`Ao nuôi 1`, `Ao nuôi 2`, `Ao dự trữ`)
3. Re-run: `python manage.py seed_farm_data --sensors-only`

Out-of-range values (e.g. pH 6.5) auto-create `SensorAlert` rows during seed.

## Phase 2 IoT (planned)

- ESP32 devices POST to `/api/v1/sensor-readings/` with `"source": "iot"`
- React `SensorWidget` unchanged — still reads from API
- Retire JSON mock once devices are live

## Remaining gaps (Phase 1.5+)

- Revenue/cost dashboard charts
- Full CRUD UI for every entity (Harvest, Expense, Farm admin-only for now)
- Medicine inventory model and pages
- Refresh token rotation / token blacklist
- Pond create/edit UI (list + detail read-focused in MVP)
- `InventoryItem.updated_at` uses `auto_now_add` only

## Dev smoke test checklist

- [ ] Login with superuser
- [ ] Dashboard shows ponds, sensor widgets, alerts
- [ ] Pond detail feeding stats chart loads 4+ weeks of data
- [ ] Feeding log creates record and deducts inventory
- [ ] Alerts page resolves an alert
- [ ] Mobile viewport (375px) — sidebar drawer works
