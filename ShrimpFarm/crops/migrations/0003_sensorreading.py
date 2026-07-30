from django.contrib import admin
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("crops", "0002_alter_crop_code_alter_crop_expected_harvest_date_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="SensorReading",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("ph", models.DecimalField(decimal_places=2, max_digits=4)),
                ("salinity_ppt", models.DecimalField(decimal_places=2, max_digits=6)),
                ("temperature_c", models.DecimalField(decimal_places=2, max_digits=5)),
                ("recorded_at", models.DateTimeField()),
                (
                    "source",
                    models.CharField(
                        choices=[("manual", "Manual"), ("iot", "IoT")],
                        default="manual",
                        max_length=20,
                    ),
                ),
                (
                    "pond",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="sensor_readings",
                        to="crops.pond",
                    ),
                ),
            ],
            options={
                "ordering": ["-recorded_at"],
            },
        ),
    ]
