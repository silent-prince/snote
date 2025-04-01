from django.urls import path,re_path
from .views import get_notes,edit_note,notes_login,add_note,notes_page,user_logout,choosewho


urlpatterns = [
    path('notes_login/', notes_login, name='notes_login'),
    path('choosewho/', choosewho, name='choosewho'),
    path('user_logout/', user_logout, name='user_logout'),
    path('notes/', notes_page, name='notes_page'),
    path('getnotes/', get_notes, name='get_notes'),
    path('notes/add/', add_note, name='add_note'),
    path('edit/<int:note_id>/', edit_note, name='edit_note'),
]