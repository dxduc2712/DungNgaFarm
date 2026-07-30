from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView

from .views.dashboard_view import DashboardView
from .views.viewsets import (
    CropViewSet,
    ExpenseViewSet,
    FarmViewSet,
    FeedViewSet,
    FeedingPlanViewSet,
    FeedingRecordViewSet,
    HarvestViewSet,
    InventoryItemViewSet,
    PondViewSet,
    SensorAlertViewSet,
    SensorReadingViewSet,
    StockingViewSet,
    WaterExchangeViewSet,
    WaterTreatmentViewSet,
)

router = DefaultRouter()
router.register(r"farms", FarmViewSet)
router.register(r"ponds", PondViewSet)
router.register(r"crops", CropViewSet)
router.register(r"stockings", StockingViewSet)
router.register(r"feeds", FeedViewSet)
router.register(r"inventory-items", InventoryItemViewSet)
router.register(r"feeding-plans", FeedingPlanViewSet)
router.register(r"feeding-records", FeedingRecordViewSet)
router.register(r"water-treatments", WaterTreatmentViewSet)
router.register(r"water-exchanges", WaterExchangeViewSet)
router.register(r"harvests", HarvestViewSet)
router.register(r"expenses", ExpenseViewSet)
router.register(r"sensor-readings", SensorReadingViewSet)
router.register(r"sensor-alerts", SensorAlertViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
]
