from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Crop, InventoryItem, Pond, SensorAlert
from ..serializers import InventoryItemSerializer, SensorAlertSerializer, SensorReadingSerializer


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ponds = Pond.objects.filter(active=True).select_related("farm")
        active_crops = Crop.objects.filter(status=Crop.Status.ACTIVE).count()
        unresolved_alerts = SensorAlert.objects.filter(resolved=False).count()

        pond_summaries = []
        for pond in ponds:
            latest_reading = pond.sensor_readings.order_by("-recorded_at").first()
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
        recent_alerts = SensorAlert.objects.filter(resolved=False).select_related(
            "pond", "crop"
        )[:10]

        return Response(
            {
                "total_ponds": ponds.count(),
                "active_crops": active_crops,
                "unresolved_alerts": unresolved_alerts,
                "ponds": pond_summaries,
                "low_stock": InventoryItemSerializer(low_stock_items, many=True).data,
                "recent_alerts": SensorAlertSerializer(recent_alerts, many=True).data,
            }
        )
