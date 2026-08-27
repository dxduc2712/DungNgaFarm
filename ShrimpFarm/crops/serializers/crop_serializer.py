from rest_framework import serializers

from ..models import Crop


class CropSerializer(serializers.ModelSerializer):
    pond_name = serializers.CharField(source="pond.name", read_only=True)

    class Meta:
        model = Crop
        fields = [
            "id",
            "code",
            "pond",
            "pond_name",
            "shrimp_species",
            "start_date",
            "expected_harvest_date",
            "end_date",
            "status",
        ]
        read_only_fields = ["id", "code"]
