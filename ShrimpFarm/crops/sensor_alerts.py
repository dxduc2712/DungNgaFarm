from decimal import Decimal

from .models import Crop, SensorAlert

PH_MIN = Decimal("7.0")
PH_MAX = Decimal("9.0")
SALINITY_MIN = Decimal("5")
SALINITY_MAX = Decimal("25")
TEMP_MIN = Decimal("26")
TEMP_MAX = Decimal("32")


def create_sensor_alerts_for_reading(reading, crop=None):
    if crop is None:
        crop = (
            reading.pond.crops.filter(status=Crop.Status.ACTIVE)
            .order_by("-start_date")
            .first()
        )
    if not crop:
        return []

    alerts = []
    checks = [
        ("ph", reading.ph, PH_MIN, PH_MAX, "pH"),
        ("salinity_ppt", reading.salinity_ppt, SALINITY_MIN, SALINITY_MAX, "Độ mặn"),
        ("temperature_c", reading.temperature_c, TEMP_MIN, TEMP_MAX, "Nhiệt độ"),
    ]
    for sensor_type, value, low, high, label in checks:
        if value < low or value > high:
            threshold = low if value < low else high
            message = f"{label} {value} ngoài ngưỡng an toàn ({low}–{high})"
            alert, _ = SensorAlert.objects.update_or_create(
                pond=reading.pond,
                crop=crop,
                sensor_type=sensor_type,
                resolved=False,
                defaults={
                    "value": value,
                    "threshold": threshold,
                    "message": message,
                },
            )
            alerts.append(alert)
        else:
            SensorAlert.objects.filter(
                pond=reading.pond,
                crop=crop,
                sensor_type=sensor_type,
                resolved=False,
            ).update(resolved=True)
    return alerts
