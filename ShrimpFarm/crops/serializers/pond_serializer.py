from rest_framework import serializers

from ..models import Pond


class PondSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)
    active_crop_id = serializers.SerializerMethodField()
    active_crop_code = serializers.SerializerMethodField()

    class Meta:
        model = Pond
        fields = [
            "id",
            "farm",
            "farm_name",
            "name",
            "pond_type",
            "area_m2",
            "depth_m",
            "record_mode",
            "active",
            "active_crop_id",
            "active_crop_code",
        ]

    def get_active_crop_id(self, obj):
        crop = obj.crops.filter(status="ACTIVE").order_by("-start_date").first()
        return crop.id if crop else None

    def get_active_crop_code(self, obj):
        crop = obj.crops.filter(status="ACTIVE").order_by("-start_date").first()
        return crop.code if crop else None
