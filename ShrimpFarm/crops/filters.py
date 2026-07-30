from django_filters import rest_framework as filters

from .models import (
    Crop,
    FeedingRecord,
    Pond,
    SensorAlert,
    SensorReading,
)


class PondFilter(filters.FilterSet):
    farm = filters.NumberFilter(field_name="farm_id")
    active = filters.BooleanFilter()
    pond_type = filters.CharFilter()

    class Meta:
        model = Pond
        fields = ["farm", "active", "pond_type"]


class CropFilter(filters.FilterSet):
    pond = filters.NumberFilter(field_name="pond_id")
    status = filters.CharFilter()

    class Meta:
        model = Crop
        fields = ["pond", "status"]


class FeedingRecordFilter(filters.FilterSet):
    crop = filters.NumberFilter(field_name="crop_id")
    feed = filters.NumberFilter(field_name="feed_id")
    feeding_time_after = filters.DateTimeFilter(
        field_name="feeding_time", lookup_expr="gte"
    )
    feeding_time_before = filters.DateTimeFilter(
        field_name="feeding_time", lookup_expr="lte"
    )

    class Meta:
        model = FeedingRecord
        fields = ["crop", "feed"]


class SensorReadingFilter(filters.FilterSet):
    pond = filters.NumberFilter(field_name="pond_id")
    source = filters.CharFilter()
    recorded_at_after = filters.DateTimeFilter(
        field_name="recorded_at", lookup_expr="gte"
    )
    recorded_at_before = filters.DateTimeFilter(
        field_name="recorded_at", lookup_expr="lte"
    )

    class Meta:
        model = SensorReading
        fields = ["pond", "source"]


class SensorAlertFilter(filters.FilterSet):
    pond = filters.NumberFilter(field_name="pond_id")
    crop = filters.NumberFilter(field_name="crop_id")
    resolved = filters.BooleanFilter()

    class Meta:
        model = SensorAlert
        fields = ["pond", "crop", "resolved"]


class WaterTreatmentFilter(filters.FilterSet):
    crop = filters.NumberFilter(field_name="crop_id")

    class Meta:
        from .models import WaterTreatment

        model = WaterTreatment
        fields = ["crop"]


class WaterExchangeFilter(filters.FilterSet):
    crop = filters.NumberFilter(field_name="crop_id")

    class Meta:
        from .models import WaterExchange

        model = WaterExchange
        fields = ["crop"]
