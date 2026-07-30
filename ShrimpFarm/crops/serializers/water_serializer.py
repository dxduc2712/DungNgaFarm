from rest_framework import serializers

from ..models import WaterExchange, WaterTreatment


class WaterTreatmentSerializer(serializers.ModelSerializer):
    crop_code = serializers.CharField(source="crop.code", read_only=True)

    class Meta:
        model = WaterTreatment
        fields = [
            "id",
            "crop",
            "crop_code",
            "product_name",
            "quantity",
            "treatment_time",
            "note",
        ]


class WaterExchangeSerializer(serializers.ModelSerializer):
    crop_code = serializers.CharField(source="crop.code", read_only=True)

    class Meta:
        model = WaterExchange
        fields = [
            "id",
            "crop",
            "crop_code",
            "action",
            "percentage",
            "exchange_time",
            "note",
        ]
