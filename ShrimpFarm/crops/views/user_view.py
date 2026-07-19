from django.contrib.auth.models import User, Group
from rest_framework import viewsets, permissions
from ..serliazers import UserSerializer, GroupSerializers


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by('name')
    serializer_class = GroupSerializers
    permission_classed = [permissions.IsAuthenticated]
