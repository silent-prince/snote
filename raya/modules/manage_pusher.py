from .my_imports import login_required,Aarumi,pusher,json,JsonResponse


pusher_client = pusher.Pusher(
  app_id='1967128',
  key='3d2b17bf76b92c8f20cd',
  secret='4da3289b64a6cf5a4b0d',
  cluster='ap2',
  ssl=True
)
def send_push_message2(request,failedMessages):
    print("deletelog arrumi send_push_message2",failedMessages)
    receiver_id = request.session.get("receiver")
    receiver_channel = f'receiver-channel-{receiver_id}-{request.user.id}'
    response = pusher_client.trigger(receiver_channel, 'new-aarumi-event2', {
        'failedMessages':failedMessages
    })

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
    receiver_channel = f'receiver-channel-{aarumi.receiver_id}-{aarumi.sender_id}'

    # Send message via pusher
    response = pusher_client.trigger(receiver_channel, 'new-aarumi-event', {
        'username': aarumi.sender.username,
        'message': aarumi.message_body,
        'id': aarumi.id,
        'replyId': replyId,
        'replyFrom': replyFrom,
        'replyMessage': replyMessage,
        'created_at': aarumi.created_at.isoformat()
    })

    return response
def makeSingleSeen(request):#it was single but now bulk
    return makeAllSeen(request)
def makeAllSeen(request):
    response = None
    is_seen_or_is_received = "is_seen"
    if request.body:
        data = json.loads(request.body)
        is_seen_or_is_received = data.get("is_seen_or_is_received", "is_seen")
    rtatus = "read" if is_seen_or_is_received == "is_seen" else "s_received"
    receiver_id = request.session.get("receiver")
    receiver_channel = f'receiver-channel-{receiver_id}-{request.user.id}'
    response = pusher_client.trigger(receiver_channel, 'all-seen-event', {
        'is_seen_or_is_received':rtatus
    })
    return response
def notify_typing_status(request):
    try:
        receiver_id = request.session.get("receiver")
        receiver_channel = f'receiver-channel-{receiver_id}-{request.user.id}'
        response = pusher_client.trigger(receiver_channel, 'user-typing-event', {
            'typing': True
        })
        return JsonResponse({"success": True}, status=200)
    except json.JSONDecodeError as e:
        return JsonResponse({"success": False, "error": "Invalid JSON", "details": str(e)}, status=400)
