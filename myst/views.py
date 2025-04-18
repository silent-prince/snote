from django.shortcuts import render,redirect

from .modules import manageNotes,manageLogin

# Create your views here.

def notes_page(request):
    return manageNotes.notes_page(request)
def add_note(request):
    return manageNotes.add_note(request)
def update_note(request):
    return manageNotes.update_note(request)
def get_missed_notes(request):
    return manageNotes.get_missed_notes(request)
def make_seen(request):
    return manageNotes.make_seen(request)
def notes_login(request):
    return manageLogin.notes_login(request)
def choosewho(request):
    return manageLogin.choosewho(request)
def edit_note(request, note_id):
    return manageNotes.edit_note(request, note_id)
def get_notes(request):
    return manageNotes.get_notes(request)
def user_logout(request):
    return manageLogin.user_logout(request)