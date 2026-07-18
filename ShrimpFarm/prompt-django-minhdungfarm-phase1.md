# AI Prompt — MinhDungFarm: Quản Lý Hồ Tôm (Phase 1 MVP, Django + React)

Copy toàn bộ nội dung dưới đây và đưa cho AI (Claude Code, Cursor, ChatGPT, v.v.) để nó scaffold dự án.

---

## PROMPT

You are an expert full-stack Django + React developer. Build **Phase 1 (MVP)** of a shrimp farm management web app called **MinhDungFarm** ("Quản Lý Hồ Tôm"). Follow the spec below exactly. Ask no clarifying questions — make reasonable assumptions and note them in a `NOTES.md` file if needed.

### Tech Stack
- **Backend:** Django 5.x + Django REST Framework, exposed as a pure JSON API (no server-rendered templates for app pages)
- **Frontend:** **React** (Vite + React Router) styled with **Tailwind CSS**, calling the Django REST API. Configure CORS (`django-cors-headers`) so the React dev server can talk to Django locally. Use `recharts` for charts.
- **Database:** PostgreSQL
- **Auth:** DRF Token or JWT (djangorestframework-simplejwt) — React stores the token and sends it on every request. Keep it simple (no refresh-token rotation needed yet).
- **Admin:** Django admin enabled for every model (used by staff for backend data entry/inventory correction)
- **Language:** UI labels in **Vietnamese**; code, comments, and variable/model names in **English**.
- Keep the app mobile-friendly/responsive since farm staff will use phones by the pond.

### Project Structure
Create a Django project `minhdungfarm` with an app `crops` containing the models below, plus a `frontend/` React app. Include a `requirements.txt`, `.env.example` for DB credentials, and a `README.md` with setup + migration + seed instructions.

### Data Models (`crops/models.py`)

Hierarchy: **Farm → Pond → Crop → (Stocking, FeedingRecord, WaterTreatment, WaterExchange, Harvest, Expense)**, plus standalone **Feed/InventoryItem** and **SensorReading/SensorAlert**.

1. **Farm** — `name`, `address`
2. **Pond** — FK `farm`; `name`; `pond_type` (GROW / WATER reservoir); `area_m2`; `depth_m`; `record_mode` (OFF / ALERT / ALL — controls how much sensor data gets logged); `active` (bool)
3. **Crop** (Vụ nuôi) — FK `pond`; `code`; `shrimp_species`; `start_date`; `expected_harvest_date`; `end_date` (nullable); `status` (ACTIVE / COMPLETED)
4. **Stocking** (Thả giống) — OneToOne `crop`; `stocking_date`; `quantity`; `average_weight`; `supplier`
5. **Feed** (catalog, not stock) — `name`, `brand`, `weight_kg` (bag size), `price`
6. **InventoryItem** (Kho thức ăn) — FK `feed`; `quantity`; `updated_at` (auto). This is the current stock count per feed product.
7. **FeedingPlan** (Kế hoạch cho ăn) — FK `crop`; `day_from`, `day_to` (days-of-crop range); `recommended_quantity_kg`
8. **FeedingRecord** (Nhật ký cho ăn) — FK `crop`; FK `feed` (PROTECT); `quantity_kg`; `feeding_time`; `note`. On save, decrement the matching `InventoryItem.quantity`; on delete, reverse it.
9. **WaterTreatment** (Xử lý nước — hóa chất/men vi sinh/vitamin) — FK `crop`; `product_name`; `quantity`; `treatment_time`; `note`
10. **WaterExchange** (Thay nước) — FK `crop`; `action` (PUMP_IN / SIPHON); `percentage`; `exchange_time`; `note`
11. **Harvest** (Thu hoạch) — FK `crop`; `harvest_type` (PARTIAL / FINAL); `harvest_date`; `quantity_kg`; `average_weight_g`; `sale_price`
12. **Expense** (Chi phí) — FK `crop`; `category`; `amount`; `expense_date`; `note`
13. **SensorReading** (Chỉ số môi trường — manual now, IoT-fed in Phase 2) — FK `pond`; `ph`, `salinity_ppt`, `temperature_c`; `recorded_at`; `source` (manual / iot, default "manual")
14. **SensorAlert** — FK `crop`, FK `pond`; `sensor_type`; `value`; `threshold`; `message`; `created_at` (auto); `resolved` (bool). Auto-created when a `SensorReading` (or feed/medicine stock) crosses a threshold — see Alerts logic below.

Revenue/cost are **derived**, not stored fields: `revenue` = sum of `Harvest.quantity_kg × sale_price` for a crop; `cost` = sum of `Expense.amount` (+ optionally feed cost) for a crop.

### Dashboard UI — sidebar layout (React)

Build the Dashboard page to follow this structure (generic admin-dashboard pattern — sidebar nav + top stat cards + charts, all with Vietnamese labels and shrimp-farm content):

**Left sidebar** (collapsible, fixed):
- Logo/app name at top ("MinhDungFarm")
- Search box
- Nav sections/groups:
  - **Tổng quan** → Dashboard
  - **Trang trại** → Farms, Ao (Ponds)
  - **Vụ nuôi** → Crops, Thả giống (Stocking)
  - **Cho ăn** → Kế hoạch (FeedingPlan), Nhật ký cho ăn (FeedingRecord), Kho thức ăn (InventoryItem)
  - **Xử lý nước** → Xử lý (WaterTreatment), Thay nước (WaterExchange)
  - **Thu hoạch & Chi phí** → Harvest, Expense
  - **Cảnh báo** → SensorAlert list (with resolved/unresolved filter)
- Highlight the active route; icons from `lucide-react`

**Top bar:** breadcrumb / page title + a "Hôm nay" (today) date indicator on the right, matching a typical dashboard header.

**Main content — Dashboard page:**
- **Row 1 — 4 stat cards**, each with a big number + a small up/down % badge vs. last period:
  1. Tổng số ao (total ponds)
  2. Vụ nuôi đang hoạt động (active crops)
  3. Doanh thu (revenue, derived, this period)
  4. Cảnh báo chưa xử lý (unresolved SensorAlert count)
- **Row 2, left (wide) — trend chart**: "Doanh thu & Chi phí theo tháng" — an area/line chart (recharts `AreaChart`) with two series (revenue vs cost), tabs to toggle "Theo tháng / Theo vụ nuôi", legend "Năm nay" vs "Năm trước"
- **Row 2, right (narrow) — list widget**: "Cảnh báo theo loại cảm biến" — one row per `sensor_type` (pH, độ mặn, nhiệt độ, tồn kho) with a mini progress bar showing count of alerts for that type
- **Row 3, left — bar chart**: "Chi phí theo hạng mục" (Expense grouped by `category`)
- **Row 3, right — donut chart**: "Phân bổ ao theo loại" (Pond count by `pond_type`: GROW vs WATER) with a percentage legend
- Also show a **"Chỉ số môi trường" (sensor readings) card per pond** on this dashboard or the pond detail page — see IoT section below.

Keep the visual style clean/minimal: white cards with soft shadows and rounded corners on a light-gray background, one accent color, small colored badges for up/down %. Use Tailwind utility classes only (no custom design system needed).

### React Pages/Routes (calling the Django REST API)

- `/` — Dashboard (as above)
- `/farms`, `/farms/:id` — Farm CRUD
- `/ao`, `/ao/:id` — Pond CRUD; detail shows crops on that pond + latest sensor reading
- `/vu-nuoi`, `/vu-nuoi/:id` — Crop CRUD; detail shows stocking, feeding records, water treatment/exchange, harvests, expenses for that crop
- `/cho-an/ke-hoach`, `/cho-an/nhat-ky` — FeedingPlan and FeedingRecord (logging feeding auto-deducts InventoryItem)
- `/kho-thuc-an` — Feed catalog + InventoryItem stock levels
- `/xu-ly-nuoc` — WaterTreatment + WaterExchange logs
- `/thu-hoach`, `/chi-phi` — Harvest and Expense logs
- `/canh-bao` — SensorAlert list, filter by resolved/unresolved
- Shared layout = the sidebar described above; simple `axios`/`fetch` API client with the auth token attached.

### IoT Sensor Data — Phase 1 (UI-only defaults) vs Phase 2 (real integration)

**Phase 1 (this build):** No real IoT device integration yet. Still model the data shape now so Phase 2 just plugs in:
- Seed each pond with one `SensorReading` row (`source="manual"`) so the UI has real-looking numbers instead of blank/zero.
- On the Dashboard and Pond detail pages, show a **"Chỉ số môi trường (IoT)" widget** displaying the latest `SensorReading` per pond, with a small badge: "Dữ liệu thủ công" (manual) vs "Dữ liệu IoT" (once `source="iot"` exists). If no reading exists at all, show sensible placeholder text ("Chưa có dữ liệu") rather than an error.
- Expose `/api/v1/sensor-readings/` as a normal DRF ViewSet (CRUD) — this is exactly the endpoint a Phase 2 IoT device/gateway will POST to later; no schema changes needed then.

**Phase 2 (future, do NOT build now):** ESP32/Arduino devices push readings automatically (e.g. via MQTT → a small ingestion service → this same `SensorReading` endpoint), replacing manual entries and enabling near-real-time charts/alerts. Leave a short `NOTES.md` comment marking this as the next step.

### REST API
Expose all models via DRF ViewSets under `/api/v1/` (farms, ponds, crops, stockings, feeds, inventory-items, feeding-plans, feeding-records, water-treatments, water-exchanges, harvests, expenses, sensor-readings, sensor-alerts) with standard CRUD, so the React frontend, a future mobile app, an IoT gateway, or an AI layer can all consume the same data. Use DRF's browsable API + a basic `filterset` for pond/crop/date where relevant.

### Alerts logic (simple, rule-based for now)
On saving a `SensorReading` or when `InventoryItem.quantity` drops, auto-create a `SensorAlert` when:
- pH outside 7.0–9.0
- salinity outside 5–25 ppt
- temperature outside 26–32°C
- any `InventoryItem.quantity` < 10% of its last-known restock quantity

Each alert stores the offending `sensor_type`, `value`, `threshold`, and a human-readable Vietnamese `message`. Mark `resolved=True` when the next reading is back in range (or manually via the UI).

### Deliverables
1. `backend/` — full Django project (all models above, admin, migrations, DRF viewsets+serializers, urls, CORS + JWT auth config, alert-generation signal/logic)
2. `frontend/` — React (Vite) app with the sidebar dashboard layout + pages listed above, Tailwind + recharts configured, an API client, and the IoT sensor widget showing manual/default data
3. Seed script/fixture with 1 farm, 2-3 sample ponds, one active crop each with stocking, a week of feeding records, one manual SensorReading per pond, and a couple of sample expenses/harvests
4. `README.md` with setup steps for both apps (Python venv + `pip install -r requirements.txt` + Postgres config + `migrate` + `createsuperuser` + `runserver`, and `npm install` + `npm run dev` for the frontend, including the `.env`/API base URL wiring between them)
5. Keep everything minimal and working — this is an MVP; don't over-engineer permissions, multi-tenant support, or real IoT ingestion yet (those are future phases).

---

### Ghi chú khi dùng prompt này
- Data model đã cập nhật theo schema chi tiết: Farm → Pond → Crop → (Stocking, FeedingRecord, WaterTreatment, WaterExchange, Harvest, Expense), cộng thêm Feed/InventoryItem và SensorReading/SensorAlert.
- Dashboard UI theo kiểu **sidebar bên trái + stat cards + biểu đồ** (layout phổ biến, không gắn với brand cụ thể), đã Việt hóa nội dung và đổi số liệu sang các chỉ số của trang trại tôm.
- Dữ liệu IoT ở Phase 1 chỉ là **giá trị mặc định/nhập tay** hiển thị đúng chỗ trên UI; schema (`SensorReading`, endpoint `/api/v1/sensor-readings/`) đã có sẵn để Phase 2 cắm thiết bị ESP32/Arduino vào mà không cần đổi cấu trúc.
- Prompt này giả định PostgreSQL chạy local hoặc qua Docker — có thể thêm "include a docker-compose.yml with postgres + backend + frontend services" nếu muốn.
- Doanh thu/chi phí là **giá trị tính toán** (derived) từ Harvest và Expense, không lưu trực tiếp trên Crop.
