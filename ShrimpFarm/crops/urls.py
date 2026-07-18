from django.urls import path
from .views.crop_view import CropView

urlpatterns = [
    path('', CropView.as_view()),
]