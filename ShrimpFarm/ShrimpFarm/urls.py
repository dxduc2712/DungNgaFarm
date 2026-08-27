from django.conf import settings
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "MinhDungFarm"
admin.site.site_title = "MinhDungFarm"
admin.site.index_title = "Quản trị"
# Prefer React shell navigation; account chrome lives in the SPA sidebar.
admin.site.site_url = getattr(settings, "FRONTEND_URL", "/")
admin.site.enable_nav_sidebar = False

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/v1/", include("crops.api_urls")),
]
