from django.shortcuts import render

from .modules import manage_aarumi,manageLogin

def aarumi_home(request):
    return manage_aarumi.aarumi_home(request)
def add_aarumi(request):
    return manage_aarumi.add_aarumi(request)
def seenByMe(request):
    return manage_aarumi.seenByMe(request)
def getMissedData(request):
    return manage_aarumi.getMissedData(request)
def retry_failed_messages(request):
    return manage_aarumi.retry_failed_messages(request)

