from rest_framework import serializers

from ..models import Harvest


class HarvestSerializer(serializers.ModelSerializer):
    crop_code = serializers.CharField(source="crop.code", read_only=True)

    class Meta:
        model = Harvest
        fields = [
            "id",
            "crop",
            "crop_code",
            "harvest_type",
            "harvest_date",
            "quantity_kg",
            "average_weight_g",
            "sale_price",
        ]
