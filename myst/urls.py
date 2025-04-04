from django.urls import path,re_path
from .views import get_missed_notes,make_seen,update_note,get_notes,edit_note,notes_login,add_note,notes_page,user_logout,choosewho


urlpatterns = [
    path('notes_login/', notes_login, name='notes_login'),
    path('choosewho/', choosewho, name='choosewho'),
    path('user_logout/', user_logout, name='user_logout'),
    path('', notes_page, name='notes_page'),
    path('getnotes/', get_notes, name='get_notes'),
    path('get_missed_notes/', get_missed_notes, name='get_missed_notes'),
    path('make_seen/', make_seen, name='make_seen'),
    path('notes/add/', add_note, name='add_note'),
    path('notes/update/', update_note, name='update_note'),
    path('edit/<int:note_id>/', edit_note, name='edit_note'),
]