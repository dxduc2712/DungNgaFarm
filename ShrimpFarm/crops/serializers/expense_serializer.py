from rest_framework import serializers

from ..models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    crop_code = serializers.CharField(source="crop.code", read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id",
            "crop",
            "crop_code",
            "category",
            "amount",
            "expense_date",
            "note",
        ]
