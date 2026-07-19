from django.urls import path
from .views.crop_view import CropListView, CropDetailView

urlpatterns = [
    path('crops/', CropListView.as_view),
    path('crops/<int:pk>/', CropDetailView.as_view()),
]