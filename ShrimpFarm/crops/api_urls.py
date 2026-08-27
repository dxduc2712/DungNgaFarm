from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views.auth_view import (
    ChangePasswordView,
    CurrentUserView,
    DjangoSessionView,
    EmailOrUsernameTokenObtainPairView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
)
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
    path(
        "auth/login/",
        EmailOrUsernameTokenObtainPairView.as_view(),
        name="token_obtain_pair",
    ),
    path("auth/register/", RegisterView.as_view(), name="auth_register"),
    path(
        "auth/password-reset/",
        PasswordResetRequestView.as_view(),
        name="auth_password_reset",
    ),
    path(
        "auth/password-reset/confirm/",
        PasswordResetConfirmView.as_view(),
        name="auth_password_reset_confirm",
    ),
    path(
        "auth/change-password/",
        ChangePasswordView.as_view(),
        name="auth_change_password",
    ),
    path("auth/logout/", LogoutView.as_view(), name="auth_logout"),
    path("auth/me/", CurrentUserView.as_view(), name="current_user"),
    path("auth/django-session/", DjangoSessionView.as_view(), name="django_session"),
]
