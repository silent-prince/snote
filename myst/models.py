from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import localtime
# Create your models here.


class Whois(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True, default="HelloUser")
    passcode = models.CharField(max_length=100, blank=True, null=True, default="secure123")
    status=models.CharField(max_length=100, blank=True, null=True, default="unknown")
    
class Note(models.Model):
    username = models.CharField(max_length=100, blank=True, null=True, default="nouser")
    whois = models.CharField(max_length=100, blank=True, null=True, default="myst")
    mode = models.CharField(max_length=100, blank=True, null=True, default="zero")
    title = models.CharField(max_length=255,blank=True, null=True,default="")
    content = models.TextField()
    reply = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="replies")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return localtime(self.created_at).strftime("%Y-%m-%d %H:%M:%S")
