from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.timezone import localtime

class Aarumi(models.Model):
    sender = models.ForeignKey(User,on_delete=models.CASCADE,related_name='sent_aarumis')
    receiver = models.ForeignKey(User,on_delete=models.CASCADE,related_name='received_aarumis')
    message_body = models.TextField()
    aarumi_reply = models.ForeignKey("self",on_delete=models.SET_NULL,null=True,blank=True,related_name="replies")
    created_at = models.DateTimeField(auto_now_add=True)
    seen_at = models.DateTimeField(default=timezone.now)
    is_seen = models.BooleanField(default=False)
    is_received = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    is_replied = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username} at {localtime(self.created_at).strftime('%Y-%m-%d %H:%M:%S')}"
