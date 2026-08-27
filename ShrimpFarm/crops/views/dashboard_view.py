from django.db.models import OuterRef, Subquery
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Crop, InventoryItem, Pond, SensorAlert, SensorReading
from ..serializers import InventoryItemSerializer, SensorAlertSerializer, SensorReadingSerializer


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        latest_reading_id = (
            SensorReading.objects.filter(pond_id=OuterRef("pk"))
            .order_by("-recorded_at", "-id")
            .values("pk")[:1]
        )
        ponds = list(
            Pond.objects.filter(active=True)
            .select_related("farm")
            .annotate(latest_reading_id=Subquery(latest_reading_id))
            .order_by("name", "id")
        )
        reading_ids = [pond.latest_reading_id for pond in ponds if pond.latest_reading_id]
        readings_by_pond = {
            reading.pond_id: reading
            for reading in SensorReading.objects.filter(pk__in=reading_ids).select_related(
                "pond"
            )
        }

        active_crops = Crop.objects.filter(status=Crop.Status.ACTIVE).count()
        unresolved_alerts = SensorAlert.objects.filter(resolved=False).count()

        pond_summaries = []
        for pond in ponds:
            latest_reading = readings_by_pond.get(pond.id)
            active_crop = (
                pond.crops.filter(status=Crop.Status.ACTIVE).order_by("-start_date").first()
            )
            pond_summaries.append(
                {
                    "id": pond.id,
                    "name": pond.name,
                    "pond_type": pond.pond_type,
                    "active_crop_code": active_crop.code if active_crop else None,
                    "latest_reading": (
                        SensorReadingSerializer(latest_reading).data
                        if latest_reading
                        else None
                    ),
                }
            )

        low_stock_items = InventoryItem.objects.filter(quantity__lt=10).select_related(
            "feed"
        )
        recent_alerts = (
            SensorAlert.objects.filter(resolved=False)
            .select_related("pond", "crop")
            .order_by("-created_at", "-id")[:10]
        )

        return Response(
            {
                "total_ponds": len(ponds),
                "active_crops": active_crops,
                "unresolved_alerts": unresolved_alerts,
                "ponds": pond_summaries,
                "low_stock": InventoryItemSerializer(low_stock_items, many=True).data,
                "recent_alerts": SensorAlertSerializer(recent_alerts, many=True).data,
            }
        )
