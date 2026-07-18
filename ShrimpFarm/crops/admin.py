from django.contrib import admin
from .models import Crop, Farm, Pond

# Register your models here.
admin.site.register(Crop)
admin.site.register(Farm)
admin.site.register(Pond)