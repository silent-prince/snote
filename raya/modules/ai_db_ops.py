

def save_raya(request):
    data = json.loads(request.body)  # Parse JSON from request
    aarumi = Aarumi.objects.create(
    sender = request.user,
    receiver_id=request.session.get("receiver"),
    aarumi_reply_id=data.get("replyid"),
    created_at=parse_datetime(data.get("created_at")),
    received_at=parse_datetime(data.get("created_at")),
    seen_at=parse_datetime(data.get("created_at")),
    is_received=True,
    is_seen=True,
    message_body = data.get("message"))
    return aarumi
def save_raya_response(request,reply):
    aarumi = Aarumi.objects.create(
    sender = request.session.get("receiver"),
    receiver_id=request.user,
    #aarumi_reply_id=data.get("replyid"),
    #created_at=parse_datetime(data.get("created_at")),
    #received_at=parse_datetime(data.get("created_at")),
    #seen_at=parse_datetime(data.get("created_at")),
    #is_received=True,
    #is_seen=True,
    message_body = reply)
    return aarumi