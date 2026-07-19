from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.http import Http404
from ..serliazers.crop_serializer import CropSerializer
from ..models import Crop

class CropListView(APIView):
    """
        List all crops, or create new crop
    """
    def get(self, request, format=None):
        crops = Crop.objects.all()
        serializer = CropSerializer(crops, many=True)
        if serializer.is_valid:
            serializer.save()
            return Response(serializer.data, status = status.HTTP_200_OK)
    
    def post(self, request, format=None):
        serializer = CropSerializer(data = request.data)
        if serializer.is_valid:
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CropDetailView(APIView):
    """
        Retrieve, update or delete crop instance
    """
    def get_crop(self, pk):
        try:
            return Crop.objects.get(pk= pk)
        except Crop.DoesNotExist:
            raise Http404
        
    def get(self, request, pk, format=None):
        crop = self.get_crop(pk)
        serializer = CropSerializer(crop)
        return Response(serializer.data, status= status.HTTP_200_OK)
    
    def put(self, request, pk, formar=None):
        crop = self.get_crop(pk)
        serializer = CropSerializer(crop, data= request.data)
        if serializer.is_valid:
            serializer.save()
            return Response(serializer.data, status= status.HTTP_201_CREATED)
        return Response(serializer.errors, status= status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, formar=None):
        crop = self.get_crop(pk)
        serializer = CropSerializer(crop)
        serializer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


