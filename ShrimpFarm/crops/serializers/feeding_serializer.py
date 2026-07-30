from rest_framework import serializers

from ..models import FeedingPlan, FeedingRecord


class FeedingPlanSerializer(serializers.ModelSerializer):
    crop_code = serializers.CharField(source="crop.code", read_only=True)

    class Meta:
        model = FeedingPlan
        fields = [
            "id",
            "crop",
            "crop_code",
            "day_from",
            "day_to",
            "recommended_quantity_kg",
        ]


class FeedingRecordSerializer(serializers.ModelSerializer):
    crop_code = serializers.CharField(source="crop.code", read_only=True)
    feed_name = serializers.CharField(source="feed.name", read_only=True)
    pond_name = serializers.CharField(source="crop.pond.name", read_only=True)

    class Meta:
        model = FeedingRecord
        fields = [
            "id",
            "crop",
            "crop_code",
            "feed",
            "feed_name",
            "pond_name",
            "quantity_kg",
            "feeding_time",
            "note",
        ]
