from django.db.models import Sum
from rest_framework import serializers

from ..models import Crop, Stocking, Expense


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

class CropCreateSerializer(serializers.ModelSerializer):
    """
    Start a new crop season
    """

    quantity = serializers.IntegerField(write_only=True)

    stocking_cost = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        write_only=True
    )

    class Meta:
        model = Crop
        fields = (
            "pond",
            "shrimp_species",
            "start_date",
            "expected_harvest_date",
            "quantity",
            "stocking_cost",
        )

    def create(self, validated_data):

        quantity = validated_data.pop("quantity")
        stocking_cost = validated_data.pop("stocking_cost")

        crop = Crop.objects.create(**validated_data)

        Stocking.objects.create(
            crop=crop,
            stocking_date=crop.start_date,
            quantity=quantity,
        )

        # Optional:
        # Expense.objects.create(
        #     crop=crop,
        #     category="Stocking",
        #     amount=stocking_cost,
        #     expense_date=crop.start_date,
        # )

        return crop
class CropListSerializer(serializers.ModelSerializer):
    """
    Display crop list
    """

    pond_name = serializers.CharField(
        source="pond.name",
        read_only=True
    )

    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Crop
        fields = (
            "id",
            "code",
            "pond_name",
            "start_date",
            "status",
            "total_cost",
        )

    def get_total_cost(self, obj):

        result = obj.expenses.aggregate(
            total=Sum("amount")
        )

        return result["total"] or 0
class CropDetailSerializer(serializers.ModelSerializer):
    """
    Crop detail
    """

    pond_name = serializers.CharField(
        source="pond.name",
        read_only=True
    )

    quantity = serializers.SerializerMethodField()

    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Crop
        fields = (
            "id",
            "code",
            "pond",
            "pond_name",
            "shrimp_species",
            "start_date",
            "expected_harvest_date",
            "end_date",
            "status",
            "quantity",
            "total_cost",
        )

    def get_quantity(self, obj):

        if hasattr(obj, "stocking"):
            return obj.stocking.quantity

        return 0

    def get_total_cost(self, obj):

        result = obj.expenses.aggregate(
            total=Sum("amount")
        )

        return result["total"] or 0
    
class CropStatusSerializer(serializers.ModelSerializer):

    class Meta:
        model = Crop
        fields = (
            "status",
        )