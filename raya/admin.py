from django.contrib import admin
from .models import Aarumi
# Register your models here.
@admin.register(Aarumi)
class Aarumi(admin.ModelAdmin):
    list_display = ("message_body", "sender","receiver")  # Display columns in admin panel