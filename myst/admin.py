from django.contrib import admin

from .models import Whois,Note
# Register your models here.
@admin.register(Whois)
class WhoisAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "status", "passcode")  # Display columns in admin panel
    search_fields = ("name", "status")  # Enable search by name & status
    list_filter = ("status",)  # Filter by status

@admin.register(Note)
class NotesAdmin(admin.ModelAdmin):
    list_display = ("title", "content", "mode", "whois","username")  # Display columns in admin panel
    search_fields = ("title", "content")  # Enable search by name & status
    list_filter = ("whois",)  # Filter by status