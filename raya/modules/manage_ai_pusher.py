from .my_imports import login_required,Aarumi,pusher,json,JsonResponse


pusher_client = pusher.Pusher(
  app_id='1967128',
  key='3d2b17bf76b92c8f20cd',
  secret='4da3289b64a6cf5a4b0d',
  cluster='ap2',
  ssl=True
)


def send_push_message(aarumi: Aarumi):
    # Handle reply info
    replyFrom = ""
    replyMessage = ""
    replyId = None
    if aarumi.aarumi_reply:
        replyMessage = aarumi.aarumi_reply.message_body
        replyFrom="you"
        if aarumi.aarumi_reply.sender_id != aarumi.sender_id:
            replyFrom = aarumi.aarumi_reply.sender.username
        replyId = aarumi.aarumi_reply.id

    # Construct channel name
    receiver_channel = f'receiver-channel-{aarumi.sender_id}-{aarumi.receiver_id}'

    # Send message via pusher
    response = pusher_client.trigger(receiver_channel, 'new-aarumi-event', {
        'username': "raya",
        'message': aarumi.message_body,
        'id': aarumi.id,
        'replyId': replyId,
        'replyFrom': replyFrom,
        'replyMessage': replyMessage,
        'created_at': aarumi.created_at.isoformat()
    })

    return response

def makeAllSeen(request):
    response = None
    receiver_channel = f'receiver-channel-{request.user.id}-{receiver_id}'
    response = pusher_client.trigger(receiver_channel, 'all-seen-event', {
        'is_seen_or_is_received':"is_seen"
    })
    return response
def notify_typing_status(request):
    try:
        receiver_id = request.session.get("receiver")
        receiver_channel = f'receiver-channel-{request.user.id}-{receiver_id}'
        response = pusher_client.trigger(receiver_channel, 'user-typing-event', {
            'typing': True
        })
        return JsonResponse({"success": True}, status=200)
    except json.JSONDecodeError as e:
        return JsonResponse({"success": False, "error": "Invalid JSON", "details": str(e)}, status=400)
