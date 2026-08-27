from rest_framework import serializers

from ..models import SensorAlert, SensorReading


def isoformat_datetime(value):
    if value is None:
        return None
    return serializers.DateTimeField().to_representation(value)


class SensorReadingSerializer(serializers.ModelSerializer):
    pond_name = serializers.CharField(source="pond.name", read_only=True)

    class Meta:
        model = SensorReading
        fields = [
            "id",
            "pond",
            "pond_name",
            "ph",
            "salinity_ppt",
            "temperature_c",
            "recorded_at",
            "source",
        ]


class SensorAlertSerializer(serializers.ModelSerializer):
    pond_name = serializers.CharField(source="pond.name", read_only=True)
    crop_code = serializers.CharField(source="crop.code", read_only=True)

    class Meta:
        model = SensorAlert
        fields = [
            "id",
            "crop",
            "crop_code",
            "pond",
            "pond_name",
            "sensor_type",
            "value",
            "threshold",
            "message",
            "created_at",
            "resolved",
        ]
