from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..filters import (
    CropFilter,
    FeedingRecordFilter,
    PondFilter,
    SensorAlertFilter,
    SensorReadingFilter,
    WaterExchangeFilter,
    WaterTreatmentFilter,
)
from ..models import (
    Crop,
    Expense,
    Farm,
    Feed,
    FeedingPlan,
    FeedingRecord,
    Harvest,
    InventoryItem,
    Pond,
    SensorAlert,
    SensorReading,
    Stocking,
    WaterExchange,
    WaterTreatment,
)
from ..serializers import (
    CropSerializer,
    ExpenseSerializer,
    FarmSerializer,
    FeedSerializer,
    FeedingPlanSerializer,
    FeedingRecordSerializer,
    HarvestSerializer,
    InventoryItemSerializer,
    PondSerializer,
    SensorAlertSerializer,
    SensorReadingSerializer,
    StockingSerializer,
    WaterExchangeSerializer,
    WaterTreatmentSerializer,
)
from .stats_view import PondViewSet


class FarmViewSet(viewsets.ModelViewSet):
    queryset = Farm.objects.all()
    serializer_class = FarmSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["name", "address"]
    ordering_fields = ["name", "id"]


class CropViewSet(viewsets.ModelViewSet):
    queryset = Crop.objects.select_related("pond").all()
    serializer_class = CropSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = CropFilter
    search_fields = ["code", "shrimp_species"]
    ordering_fields = ["start_date", "code"]


class StockingViewSet(viewsets.ModelViewSet):
    queryset = Stocking.objects.select_related("crop").all()
    serializer_class = StockingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["crop"]


class FeedViewSet(viewsets.ModelViewSet):
    queryset = Feed.objects.all()
    serializer_class = FeedSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["name", "brand"]


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.select_related("feed").all()
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["feed"]


class FeedingPlanViewSet(viewsets.ModelViewSet):
    queryset = FeedingPlan.objects.select_related("crop").all()
    serializer_class = FeedingPlanSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["crop"]


class FeedingRecordViewSet(viewsets.ModelViewSet):
    queryset = FeedingRecord.objects.select_related("crop", "feed").all()
    serializer_class = FeedingRecordSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = FeedingRecordFilter
    ordering_fields = ["feeding_time"]


class WaterTreatmentViewSet(viewsets.ModelViewSet):
    queryset = WaterTreatment.objects.select_related("crop").all()
    serializer_class = WaterTreatmentSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = WaterTreatmentFilter
    ordering_fields = ["treatment_time"]


class WaterExchangeViewSet(viewsets.ModelViewSet):
    queryset = WaterExchange.objects.select_related("crop").all()
    serializer_class = WaterExchangeSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = WaterExchangeFilter
    ordering_fields = ["exchange_time"]


class HarvestViewSet(viewsets.ModelViewSet):
    queryset = Harvest.objects.select_related("crop").all()
    serializer_class = HarvestSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["crop", "harvest_type"]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related("crop").all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["crop", "category"]


class SensorReadingViewSet(viewsets.ModelViewSet):
    queryset = SensorReading.objects.select_related("pond").all()
    serializer_class = SensorReadingSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = SensorReadingFilter
    ordering_fields = ["recorded_at"]


class SensorAlertViewSet(viewsets.ModelViewSet):
    queryset = SensorAlert.objects.select_related("pond", "crop").all()
    serializer_class = SensorAlertSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = SensorAlertFilter
    ordering_fields = ["created_at"]

    @action(detail=True, methods=["post"], url_path="resolve")
    def resolve(self, request, pk=None):
        alert = self.get_object()
        alert.resolved = True
        alert.save(update_fields=["resolved"])
        return Response(SensorAlertSerializer(alert).data)


__all__ = [
    "FarmViewSet",
    "PondViewSet",
    "CropViewSet",
    "StockingViewSet",
    "FeedViewSet",
    "InventoryItemViewSet",
    "FeedingPlanViewSet",
    "FeedingRecordViewSet",
    "WaterTreatmentViewSet",
    "WaterExchangeViewSet",
    "HarvestViewSet",
    "ExpenseViewSet",
    "SensorReadingViewSet",
    "SensorAlertViewSet",
]
