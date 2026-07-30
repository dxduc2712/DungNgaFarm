from rest_framework import serializers

from ..models import Stocking


class StockingSerializer(serializers.ModelSerializer):
    crop_code = serializers.CharField(source="crop.code", read_only=True)

    class Meta:
        model = Stocking
        fields = [
            "id",
            "crop",
            "crop_code",
            "stocking_date",
            "quantity",
            "average_weight",
            "supplier",
        ]
