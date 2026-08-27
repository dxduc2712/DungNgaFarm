from datetime import datetime, time, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from crops.models import (
    Crop,
    Expense,
    Farm,
    Feed,
    FeedingPlan,
    FeedingRecord,
    InventoryItem,
    Pond,
    SensorReading,
    Stocking,
)
from crops.sensor_alerts import create_sensor_alerts_for_reading


class Command(BaseCommand):
    help = "Seed MinhDungFarm demo data for development and testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--sensors-only",
            action="store_true",
            help="Only reload sensor readings from JSON fixture.",
        )
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before seeding (full seed only).",
        )

    def handle(self, *args, **options):
        if options["sensors_only"]:
            self.seed_sensors()
            self.stdout.write(self.style.SUCCESS("Sensor readings reloaded."))
            return

        if options["clear"]:
            self.clear_data()

        farm = self.seed_farm()
        ponds = self.seed_ponds(farm)
        feeds, inventory = self.seed_feeds()
        crops = self.seed_crops(ponds)
        self.seed_stockings(crops)
        self.seed_feeding_plans(crops)
        self.seed_feeding_records(crops, feeds, inventory)
        self.seed_sensors()
        self.stdout.write(self.style.SUCCESS("Farm data seeded successfully."))

    def clear_data(self):
        SensorAlert.objects.all().delete()
        SensorReading.objects.all().delete()
        FeedingRecord.objects.all().delete()
        FeedingPlan.objects.all().delete()
        InventoryItem.objects.all().delete()
        Feed.objects.all().delete()
        Stocking.objects.all().delete()
        Expense.objects.all().delete()
        Crop.objects.all().delete()
        Pond.objects.all().delete()
        Farm.objects.all().delete()

    def seed_farm(self):
        farm, _ = Farm.objects.get_or_create(
            name="Trại tôm Minh Dũng",
            defaults={"address": "Ấp 3, xã Tân Thuận, Cà Mau"},
        )
        return farm

    def seed_ponds(self, farm):
        pond_specs = [
            ("Ao nuôi 1", Pond.PondType.GROW, 1200, 1.2),
            ("Ao nuôi 2", Pond.PondType.GROW, 1500, 1.3),
            ("Ao dự trữ", Pond.PondType.WATER, 800, 1.5),
        ]
        ponds = []
        for name, pond_type, area, depth in pond_specs:
            pond, _ = Pond.objects.get_or_create(
                farm=farm,
                name=name,
                defaults={
                    "pond_type": pond_type,
                    "area_m2": area,
                    "depth_m": depth,
                    "record_mode": Pond.RecordMode.ALL,
                    "active": True,
                },
            )
            ponds.append(pond)
        return ponds

    def seed_feeds(self):
        feed_specs = [
            ("Thức ăn khởi đầu", "CP", 25, 850000),
            ("Thức ăn tăng trưởng", "Proconco", 25, 920000),
        ]
        feeds = []
        inventory = []
        for name, brand, weight, price in feed_specs:
            feed, _ = Feed.objects.get_or_create(
                name=name,
                brand=brand,
                defaults={"weight_kg": weight, "price": price},
            )
            feeds.append(feed)
            item, _ = InventoryItem.objects.get_or_create(
                feed=feed,
                defaults={"quantity": 500},
            )
            inventory.append(item)
        return feeds, inventory

    def seed_crops(self, ponds):
        today = timezone.localdate()
        crops = []
        for pond in ponds:
            if pond.pond_type == Pond.PondType.WATER:
                continue
            crop, created = Crop.objects.get_or_create(
                pond=pond,
                status=Crop.Status.ACTIVE,
                defaults={
                    "shrimp_species": "Tôm thẻ chân trắng",
                    "start_date": today - timedelta(days=35),
                    "expected_harvest_date": today + timedelta(days=60),
                },
            )
            crops.append(crop)
        return crops

    def seed_stockings(self, crops):
        for crop in crops:
            Stocking.objects.get_or_create(
                crop=crop,
                defaults={
                    "stocking_date": crop.start_date,
                    "quantity": 200000,
                    "average_weight": Decimal("0.05"),
                    "supplier": "Giống Miền Tây",
                },
            )

    def seed_feeding_plans(self, crops):
        plan_ranges = [
            (1, 14, Decimal("8")),
            (15, 28, Decimal("15")),
            (29, 42, Decimal("25")),
            (43, 60, Decimal("40")),
        ]
        for crop in crops:
            for day_from, day_to, qty in plan_ranges:
                FeedingPlan.objects.get_or_create(
                    crop=crop,
                    day_from=day_from,
                    day_to=day_to,
                    defaults={"recommended_quantity_kg": qty},
                )

    def seed_feeding_records(self, crops, feeds, inventory):
        for item in inventory:
            item.quantity = 2000
            item.save(update_fields=["quantity"])

        today = timezone.localdate()
        amounts = [8, 10, 12, 9, 11, 14, 13, 15, 10, 12, 16, 18, 14, 17, 20, 19, 22, 21, 18, 16, 15, 14, 13, 12, 11, 10, 9, 8]
        feed = feeds[0]

        for crop in crops:
            for day_offset, qty in enumerate(amounts):
                feeding_date = today - timedelta(days=len(amounts) - day_offset)
                feeding_time = timezone.make_aware(
                    datetime.combine(feeding_date, time(hour=7))
                )
                if FeedingRecord.objects.filter(crop=crop, feeding_time=feeding_time).exists():
                    continue
                FeedingRecord.objects.create(
                    crop=crop,
                    feed=feed,
                    quantity_kg=Decimal(str(qty)),
                    feeding_time=feeding_time,
                    note="Cho ăn buổi sáng",
                )

    def seed_sensors(self):
        import json
        from pathlib import Path

        fixture_path = (
            Path(__file__).resolve().parent.parent.parent
            / "fixtures"
            / "sensor-readings.mock.json"
        )
        with open(fixture_path, encoding="utf-8") as f:
            readings = json.load(f)

        for entry in readings:
            pond = Pond.objects.filter(name=entry["pond_name"]).first()
            if not pond:
                self.stdout.write(
                    self.style.WARNING(f"Pond not found: {entry['pond_name']}")
                )
                continue

            recorded_at = parse_datetime(entry["recorded_at"])
            if recorded_at and timezone.is_naive(recorded_at):
                recorded_at = timezone.make_aware(recorded_at)

            SensorReading.objects.filter(pond=pond).delete()
            reading = SensorReading.objects.create(
                pond=pond,
                ph=Decimal(str(entry["ph"])),
                salinity_ppt=Decimal(str(entry["salinity_ppt"])),
                temperature_c=Decimal(str(entry["temperature_c"])),
                recorded_at=recorded_at or timezone.now(),
                source=entry.get("source", "manual"),
            )

            crop = pond.crops.filter(status=Crop.Status.ACTIVE).first()
            if crop:
                create_sensor_alerts_for_reading(reading, crop)
