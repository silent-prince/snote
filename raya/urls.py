from django.urls import path,re_path
from .views import notify_typing_status,aarumi_home,add_aarumi,seenByMe,getMissedData,retry_failed_messages,user_list,aarumi_login,user_logout


urlpatterns = [
    path('', aarumi_home, name='aarumi_home'),
    path('add', add_aarumi, name='add_aarumi'),
    path('seenByMe',seenByMe,name='seenByMe'),
    path('getMissedData',getMissedData,name='getMissedData'),
    path('retry_failed_messages',retry_failed_messages,name='retry_failed_messages'),
    path('aarumi_login',aarumi_login,name='aarumi_login'),
    path('user_list',user_list,name='user_list'),
    path('user_logout',user_logout,name='user_logout'),
    path('notify_typing_status',notify_typing_status,name='notify_typing_status'),
    
]