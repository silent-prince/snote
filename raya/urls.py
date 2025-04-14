from django.urls import path,re_path
from .views import aarumi_home,add_aarumi,seenByMe,getMissedData,retry_failed_messages


urlpatterns = [
    path('', aarumi_home, name='aarumi_home'),
    path('add', add_aarumi, name='add_aarumi'),
    path('seenByMe',seenByMe,name='seenByMe'),
    path('getMissedData',getMissedData,name='getMissedData'),
    path('retry_failed_messages',retry_failed_messages,name='retry_failed_messages'),
]