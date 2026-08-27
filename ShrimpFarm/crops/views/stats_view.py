from datetime import date, datetime, timedelta
from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncMonth, TruncWeek
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..filters import PondFilter
from ..models import Crop, FeedingPlan, FeedingRecord, Pond
from ..serializers import PondSerializer, SensorReadingSerializer


def _parse_date(value, default):
    if not value:
        return default
    try:
        return date.fromisoformat(value)
    except ValueError:
        return default


def _get_active_crop(pond, crop_id=None):
    if crop_id:
        return pond.crops.filter(pk=crop_id).first()
    return pond.crops.filter(status=Crop.Status.ACTIVE).order_by("-start_date").first()


def _recommended_kg_for_crop(crop):
    if not crop:
        return None
    day_of_cycle = (timezone.localdate() - crop.start_date).days + 1
    plan = (
        FeedingPlan.objects.filter(
            crop=crop,
            day_from__lte=day_of_cycle,
            day_to__gte=day_of_cycle,
        )
        .order_by("day_from")
        .first()
    )
    if plan and plan.recommended_quantity_kg is not None:
        return float(plan.recommended_quantity_kg)
    return None


class PondViewSet(viewsets.ModelViewSet):
    queryset = Pond.objects.select_related("farm").order_by("name", "id")
    serializer_class = PondSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = PondFilter
    search_fields = ["name"]
    ordering_fields = ["name", "id"]
    ordering = ["name", "id"]

    @action(detail=True, methods=["get"], url_path="latest-reading")
    def latest_reading(self, request, pk=None):
        pond = self.get_object()
        reading = pond.sensor_readings.order_by("-recorded_at", "-id").first()
        if not reading:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(SensorReadingSerializer(reading).data)

    @action(detail=True, methods=["get"], url_path="feeding-stats")
    def feeding_stats(self, request, pk=None):
        pond = self.get_object()
        today = timezone.localdate()
        date_from = _parse_date(request.query_params.get("from"), today - timedelta(weeks=4))
        date_to = _parse_date(request.query_params.get("to"), today)
        group_by = request.query_params.get("group_by", "week")
        crop_id = request.query_params.get("crop_id")

        if date_from > date_to:
            return Response(
                {"detail": "'from' must be on or before 'to'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        crop = _get_active_crop(pond, crop_id)
        if not crop:
            return Response(
                {
                    "pond_id": pond.id,
                    "pond_name": pond.name,
                    "crop_id": None,
                    "crop_code": None,
                    "from": date_from.isoformat(),
                    "to": date_to.isoformat(),
                    "group_by": group_by,
                    "total_kg": 0,
                    "series": [],
                    "recommended_kg": None,
                }
            )

        start_dt = timezone.make_aware(datetime.combine(date_from, datetime.min.time()))
        end_dt = timezone.make_aware(datetime.combine(date_to, datetime.max.time()))

        qs = FeedingRecord.objects.filter(
            crop=crop,
            feeding_time__gte=start_dt,
            feeding_time__lte=end_dt,
        )

        trunc_map = {
            "day": TruncDay("feeding_time"),
            "week": TruncWeek("feeding_time"),
            "month": TruncMonth("feeding_time"),
        }
        trunc = trunc_map.get(group_by, TruncWeek("feeding_time"))

        buckets = (
            qs.annotate(period=trunc)
            .values("period")
            .annotate(quantity_kg=Sum("quantity_kg"))
            .order_by("period")
        )

        series = []
        for index, bucket in enumerate(buckets, start=1):
            period_start = bucket["period"]
            if hasattr(period_start, "date"):
                period_start = period_start.date()
            label_map = {
                "day": period_start.strftime("%d/%m"),
                "week": f"Tuần {index}",
                "month": period_start.strftime("Tháng %m/%Y"),
            }
            series.append(
                {
                    "period_start": period_start.isoformat(),
                    "period_label": label_map.get(group_by, f"Tuần {index}"),
                    "quantity_kg": float(bucket["quantity_kg"] or 0),
                }
            )

        total = qs.aggregate(total=Sum("quantity_kg"))["total"] or Decimal("0")

        return Response(
            {
                "pond_id": pond.id,
                "pond_name": pond.name,
                "crop_id": crop.id,
                "crop_code": crop.code,
                "from": date_from.isoformat(),
                "to": date_to.isoformat(),
                "group_by": group_by,
                "total_kg": float(total),
                "series": series,
                "recommended_kg": _recommended_kg_for_crop(crop),
            }
        )
