from django.http import HttpResponse
from rest_framework import generics
from ..serliazers.crop_serializer import CropSerializer
from ..models import Crop

class CropView(generics.ListAPIView):
    queryset = Crop.objects.all()
    serializer_class = CropSerializer