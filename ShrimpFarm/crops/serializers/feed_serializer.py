from rest_framework import serializers

from ..models import Feed, InventoryItem


class FeedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feed
        fields = ["id", "name", "brand", "weight_kg", "price"]


class InventoryItemSerializer(serializers.ModelSerializer):
    feed_name = serializers.CharField(source="feed.name", read_only=True)
    feed_brand = serializers.CharField(source="feed.brand", read_only=True)
    low_stock = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "feed",
            "feed_name",
            "feed_brand",
            "quantity",
            "updated_at",
            "low_stock",
        ]

    def get_low_stock(self, obj):
        return obj.quantity < 10
