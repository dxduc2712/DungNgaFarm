from django.contrib import admin

from .models import (
    Crop,
    Expense,
    Farm,
    Feed,
    FeedingPlan,
    FeedingRecord,
    Harvest,
    InventoryItem,
    Pond,
    SensorAlert,
    SensorReading,
    Stocking,
    WaterExchange,
    WaterTreatment,
)


@admin.register(Farm)
class FarmAdmin(admin.ModelAdmin):
    list_display = ("name", "address")
    search_fields = ("name",)


@admin.register(Pond)
class PondAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "farm", "pond_type", "area_m2", "active")
    list_display_links = ("name",)
    readonly_fields = ("id",)
    list_filter = ("pond_type", "active", "farm")
    search_fields = ("name",)
    ordering = ("id",)


@admin.register(Crop)
class CropAdmin(admin.ModelAdmin):
    list_display = ("code", "pond", "shrimp_species", "start_date", "status")
    list_filter = ("status", "pond")
    search_fields = ("code", "shrimp_species")


@admin.register(Stocking)
class StockingAdmin(admin.ModelAdmin):
    list_display = ("crop", "stocking_date", "quantity", "supplier")


@admin.register(Feed)
class FeedAdmin(admin.ModelAdmin):
    list_display = ("name", "brand", "weight_kg", "price")
    search_fields = ("name", "brand")


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("feed", "quantity", "updated_at")


@admin.register(FeedingPlan)
class FeedingPlanAdmin(admin.ModelAdmin):
    list_display = ("crop", "day_from", "day_to", "recommended_quantity_kg")


@admin.register(FeedingRecord)
class FeedingRecordAdmin(admin.ModelAdmin):
    list_display = ("crop", "feed", "quantity_kg", "feeding_time")
    list_filter = ("feed",)


@admin.register(WaterTreatment)
class WaterTreatmentAdmin(admin.ModelAdmin):
    list_display = ("crop", "product_name", "quantity", "treatment_time")


@admin.register(WaterExchange)
class WaterExchangeAdmin(admin.ModelAdmin):
    list_display = ("crop", "action", "percentage", "exchange_time")


@admin.register(Harvest)
class HarvestAdmin(admin.ModelAdmin):
    list_display = ("crop", "harvest_type", "harvest_date", "quantity_kg")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("crop", "category", "amount", "expense_date")


@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ("id", "pond", "ph", "salinity_ppt", "temperature_c", "recorded_at", "source")
    list_filter = ("source", "pond")


@admin.register(SensorAlert)
class SensorAlertAdmin(admin.ModelAdmin):
    list_display = ("pond", "sensor_type", "value", "resolved", "created_at")
    list_filter = ("resolved", "sensor_type")
