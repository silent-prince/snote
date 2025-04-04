from django.shortcuts import render,redirect,get_object_or_404
from myst.models import Note,Whois
from django.contrib import messages
import json
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
import pusher
from django.db.models import Q
from django.utils import timezone

pusher_client = pusher.Pusher(
  app_id='1967128',
  key='3d2b17bf76b92c8f20cd',
  secret='4da3289b64a6cf5a4b0d',
  cluster='ap2',
  ssl=True
)



@login_required
def notes_page(request):
    user = request.user
    whois=request.session.get("whois")
    
    if request.method == "POST":
        title = request.POST.get("title")
        content = request.POST.get("content")
        Note.objects.create(username=user.username, title=title, content=content)
        return redirect("notes_page")
    #print(whois_id)
    notes = Note.objects.filter(username=user.username).exclude(mode="secret").order_by('-created_at')
    return render(request, 'notes.html', {'notes': notes})
@login_required
def make_seen(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)  # Parse JSON from request
            noteid = data.get("noteid")
            updated_count=Note.objects.filter(
                Q(id=noteid),
                isSeen=False
            ).update(isSeen=True, seen_at=timezone.now())
            if(updated_count>0):
                whois=request.session.get("whois")
                receiver_channel = f'receiver-channel-{whois}'
                pusher_client.trigger(receiver_channel, 'seen-by-me-event', {
                    'noteids':[noteid]
                })
                return JsonResponse({"success": True}, status=200)
            return JsonResponse({"success": False}, status=200)
        except json.JSONDecodeError as e:
            return JsonResponse({"success": False, "error": "Invalid JSON", "details": str(e)}, status=400)
    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)
@login_required
def get_notes(request):
    print("getting notes")
    user = request.user
    if request.method == "POST":
        try:
            data = json.loads(request.body)  # Parse JSON from request
            mode = data.get("mode")
            whois=request.session.get("whois")
            if mode=="secret":
                notes_to_update = Note.objects.filter(
                    username=whois, mode=mode, whois=user.username,isSeen=False
                )
                updated_notes = list(notes_to_update.values_list("id", flat=True))  # Get list of IDs
                updated_count = notes_to_update.update(isSeen=True, seen_at=timezone.now())
                receiver_channel = f'receiver-channel-{whois}'
                pusher_client.trigger(receiver_channel, 'seen-by-me-event', {
                    'noteids':updated_notes
                })
                notes = Note.objects.filter(
                    Q(username=user.username, mode=mode, whois=whois) |
                    Q(username=whois, mode=mode, whois=user.username)
                ).order_by('seen_at')
            else:
                notes = Note.objects.filter(mode=mode,username=user.username).order_by('created_at')
            notes_data = []
            for note in notes:
                notes_data.append({
                    "id": note.id,
                    "username": note.username,
                    "whois": note.whois,
                    "mode": note.mode,
                    "isSeen": note.isSeen,
                    "title": note.title,
                    "content": note.content,
                    "reply_id": {
                        "id": note.reply.id if note.reply else None,
                        "username": note.reply.username if note.reply else "",
                        "content": note.reply.content if note.reply else ""
                    },
                    "created_at": note.created_at.isoformat()
                })

            return JsonResponse({"success": True, "notes": notes_data}, status=200)
        except json.JSONDecodeError as e:
            return JsonResponse({"success": False, "error": "Invalid JSON", "details": str(e)}, status=400)
    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)

@login_required
def get_missed_notes(request):
    print("getting missed notes")
    user = request.user
    try:
        whois=request.session.get("whois")
        notes = Note.objects.filter(
            username=whois, mode="secret", whois=user.username, isSeen=False
        ).order_by('seen_at')
        updated_notes = list(notes.values_list("id", flat=True))  # Get list of IDs
        receiver_channel = f'receiver-channel-{whois}'
        pusher_client.trigger(receiver_channel, 'seen-by-me-event', {
                    'noteids':updated_notes
                })
        notes_data = []
        if notes.exists():
            for note in notes:
                notes_data.append({
                    "id": note.id,
                    "username": note.username,
                    "whois": note.whois,
                    "mode": note.mode,
                    "isSeen": True,
                    "title": note.title,
                    "content": note.content,
                    "reply_id": {
                        "id": note.reply.id if note.reply else None,
                        "username": note.reply.username if note.reply else "",
                        "content": note.reply.content if note.reply else ""
                    },
                    "created_at": note.created_at.isoformat()
                })
            notes.update(isSeen=True, seen_at=timezone.now())
        return JsonResponse({"success": True, "notes": notes_data}, status=200)
    except Exception as e:
        return JsonResponse({"success": False, "error": "unknown", "details": str(e)}, status=400)

@login_required
def update_note(request):
    if request.method == "POST":
        user = request.user
        data = json.loads(request.body)  # Parse JSON from request
        title = data.get("title")
        content = data.get("content")
        noteid=data.get("noteid")
        updated_count=Note.objects.filter(id=noteid,username=user.username).update(title=title, content=content)
        if updated_count == 0:
            return JsonResponse({"success": False, "error": "Note not found or unauthorized"}, status=404)
        return JsonResponse({"success": True}, status=200)
    
    return JsonResponse({"success": False, "error": "Invalid request method"}, status=400)

@login_required
def add_note(request):
    if request.method == "POST":
        try:
            user = request.user
            data = json.loads(request.body)  # Parse JSON from request
            title = data.get("title", "").strip()  # Get title and remove extra spaces
            whois=request.session.get("whois")
            reply_id=data.get("reply_id")
            
            #if not title:  # Check if it's empty or None
                #title = "No Title"
            content = data.get("content")
            mode = data.get("mode")

            if(mode=="secret"):
                note=Note.objects.create(whois=whois,username=user.username, content=content,mode=mode,reply_id=reply_id)
                receiver_channel = f'receiver-channel-{whois}'
                # Sending all data in one event to save Pusher quota
                pusher_client.trigger(receiver_channel, 'new-message-event', {
                    'username': user.username,
                    'content': note.content,
                    'noteid':note.id,
                    'reply_id':note.reply.id if note.reply else None,
                    'reply_who':note.reply.whois if note.reply else "",
                    'reply_content':note.reply.content if note.reply else "",
                    'created_at': note.created_at.strftime('%Y-%m-%d %H:%M:%S')
                })
            else:
                note=Note.objects.create(username=user.username, title=title, content=content)
            return JsonResponse({"success": True,"noteid":note.id,"createdat":note.created_at,"mode":mode})

        except json.JSONDecodeError as e:
            return JsonResponse({"success": False, "error": "Invalid JSON", "details": str(e)}, status=400)

    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)
@login_required
def add_note2(request):

    if request.method == "POST":
        user=request.user
        title = request.POST.get("title")
        content = request.POST.get("content")
        Note.objects.create(whois=user.username, title=title, content=content)
        return redirect("notes_page")
    return render(request, "add_note.html")

@login_required
def edit_note(request, note_id):
    user=request.user
    whois=request.session.get("whois")
    note = get_object_or_404(Note, id=note_id, whois=whois,username=user.username)

    if request.method == "POST":
        note.title = request.POST.get("title")
        note.content = request.POST.get("content")
        note.save()
        messages.success(request, "Note updated successfully!")
        return redirect('notes_page')

    return render(request, 'add_note.html', {'note': note})

