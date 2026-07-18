from django.db import models


# Create your models here.
class Farm(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()

    def __str__(self):
        return self.name
    
# Farm
#  └── has many Pond

class Pond(models.Model):

    class PondType(models.TextChoices):
        GROW = "GROW", "Grow Pond"
        WATER = "WATER", "Water Reservoir"

    class RecordMode(models.TextChoices):
        OFF = "OFF", "Off"
        ALERT = "ALERT", "Alert Only"
        ALL = "ALL", "Record All"

    farm = models.ForeignKey(
        Farm,
        on_delete=models.CASCADE,
        related_name="ponds"
    )

    name = models.CharField(max_length=100)

    pond_type = models.CharField(
        max_length=20, choices=PondType.choices,
        default=PondType.GROW
    )

    area_m2 = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,blank=True
    )

    depth_m = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True, blank=True
    )

    record_mode = models.CharField(
        max_length=10,
        choices=RecordMode.choices,
        default=RecordMode.OFF
    )

    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
# Farm
#  └── Pond
#        └── many Crop

class Crop(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"
        COMPLETED = "COMPLETED", "Completed"

    pond = models.ForeignKey(
        Pond,
        on_delete=models.CASCADE,
        related_name="crops"
    )
    # make this auto genenting
    code = models.CharField(max_length=50, unique=True, editable=False)

    shrimp_species = models.CharField(max_length=100)

    start_date = models.DateField()

    expected_harvest_date = models.DateField(null=True)

    end_date = models.DateField(
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    def save(self, *args, **kwargs):
        if not self.pk:
            super().save(*args, **kwargs)  # Get ID first
            self.code = f"CROP{self.id:05d}"
            Crop.objects.filter(pk=self.pk).update(code=self.code)
        else:
            super().save(*args, **kwargs)

    def __str__(self):
        return self.code
    
# Pond
#  └── Crop
#        ├── Stocking
#        ├── Feeding
#        ├── Harvest
#        ├── Expenses
#        └── Activities

class Stocking(models.Model):
    crop = models.OneToOneField(
        Crop,
        on_delete=models.CASCADE,
        related_name="stocking"
    )

    stocking_date = models.DateField()
    quantity = models.PositiveIntegerField()
    average_weight = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True, blank=True
    )

    supplier = models.CharField(
        max_length=200, blank=True, null=True
    )

class Feed(models.Model):

    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)

    weight_kg = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    def __str__(self):
        return self.name
    
class InventoryItem(models.Model):

    feed = models.ForeignKey(
        Feed,
        on_delete=models.CASCADE,
        related_name="inventory_items"
    )

    quantity = models.PositiveIntegerField()
    updated_at = models.DateTimeField(
        auto_now_add=True
    )
class FeedingPlan(models.Model):

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name="feeding_plans"
    )

    day_from = models.PositiveIntegerField()
    day_to = models.PositiveIntegerField()

    recommended_quantity_kg = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True, blank=True
    )
class FeedingRecord(models.Model):

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name="feeding_records"
    )

    feed = models.ForeignKey(
        Feed,
        on_delete=models.PROTECT
    )

    quantity_kg = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    feeding_time = models.DateTimeField()

    note = models.TextField(blank=True)

# Crop
#  └── many FeedingRecord

# Feed
#  └── used by many FeedingRecord

class WaterTreatment(models.Model):

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name="water_treatments"
    )

    product_name = models.CharField(max_length=200)

    quantity = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    treatment_time = models.DateTimeField()

    note = models.TextField(blank=True)
class WaterExchange(models.Model):

    class Action(models.TextChoices):
        PUMP_IN = "PUMP_IN", "Pump In"
        SIPHON = "SIPHON", "Siphon"

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name="water_exchanges"
    )

    action = models.CharField(
        max_length=20,
        choices=Action.choices
    )

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    exchange_time = models.DateTimeField()

    note = models.TextField(blank=True)

class Harvest(models.Model):

    class HarvestType(models.TextChoices):
        PARTIAL = "PARTIAL", "Partial"
        FINAL = "FINAL", "Final"

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name="harvests"
    )

    harvest_type = models.CharField(
        max_length=20,
        choices=HarvestType.choices
    )

    harvest_date = models.DateField()

    quantity_kg = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    average_weight_g = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    sale_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
class Expense(models.Model):

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name="expenses"
    )

    category = models.CharField(max_length=100)

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    expense_date = models.DateField()

    note = models.TextField(blank=True)
    
class SensorAlert(models.Model):

    crop = models.ForeignKey(
        Crop,
        on_delete=models.CASCADE,
        related_name="alerts"
    )

    pond = models.ForeignKey(
        Pond,
        on_delete=models.CASCADE,
        related_name="alerts"
    )
    sensor_type = models.CharField(max_length=50)
    value = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    threshold = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    message = models.TextField()
    created_at = models.DateTimeField(
        auto_now_add=True
    )
    resolved = models.BooleanField(default=False)