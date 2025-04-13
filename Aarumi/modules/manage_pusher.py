from .my_imports import login_required,Aarumi,pusher,json


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
    receiver_channel = f'receiver-channel-{receiver_id}'
    response = pusher_client.trigger(receiver_channel, 'new-aarumi-event2', {
        'failedMessages':failedMessages
    })

def send_push_message(aarumi: Aarumi):
    # Handle reply info
    replyFrom = ""
    replyMessage = ""

    if aarumi.aarumi_reply:
        replyMessage = aarumi.aarumi_reply.message_body
        replyFrom="you"
        if aarumi.aarumi_reply.sender_id != aarumi.sender_id:
            replyFrom = aarumi.aarumi_reply.sender.username

    # Construct channel name
    receiver_channel = f'receiver-channel-{aarumi.receiver_id}'

    # Send message via pusher
    response = pusher_client.trigger(receiver_channel, 'new-aarumi-event', {
        'username': aarumi.sender.username,
        'message': aarumi.message_body,
        'aarumiId': aarumi.id,
        'replyFrom': replyFrom,
        'replyMessage': replyMessage,
        'created_at': aarumi.created_at.strftime('%Y-%m-%d %H:%M:%S')
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
    receiver_channel = f'receiver-channel-{receiver_id}'
    response = pusher_client.trigger(receiver_channel, 'all-seen-event', {
        'is_seen_or_is_received':rtatus
    })
    return response
