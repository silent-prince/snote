from django.shortcuts import render

from .modules import manage_aarumi,manageLogin,manage_pusher

def aarumi_home(request):
    return manage_aarumi.aarumi_home(request)
def add_aarumi(request):
    if request.session.get("receiver") == "123":#raya id
        return manage_ai.handle_request(request)
    return manage_aarumi.add_aarumi(request)
def seenByMe(request):
    return manage_aarumi.seenByMe(request)
def getMissedData(request):
    return manage_aarumi.getMissedData(request)
def retry_failed_messages(request):
    return manage_aarumi.retry_failed_messages(request)
def aarumi_login(request):
    return manageLogin.aarumi_login(request)
def user_list(request):
    return manageLogin.user_list(request)
def raya_logout(request):   
    return manageLogin.raya_logout(request)
def notify_typing_status(request):
    return manage_pusher.notify_typing_status(request)

