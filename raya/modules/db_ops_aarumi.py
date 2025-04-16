from .my_imports import login_required,json,Aarumi,Q,Case, When, F, DateTimeField,parse_datetime,make_aware,timezone

@login_required
def save_aarumi(request):
    data = json.loads(request.body)  # Parse JSON from request
    aarumi = Aarumi.objects.create(
    sender = request.user,
    receiver_id=request.session.get("receiver"),
    aarumi_reply_id=data.get("replyid"),
    created_at=parse_datetime(data.get("created_at")),
    message_body = data.get("message"))
    return aarumi
@login_required
def save_aarumi2(request):
    data = json.loads(request.body)
    failedMessages = data.get("failedMessages", [])
    response_pairs = {}
    # Process each message
    for msg in failedMessages:
        temp_id = msg.get("id")
        message = msg.get("message")
        reply_id = msg.get("replyId")
        if reply_id in [None, "undefined", "", "null"]:
            reply_id = None
        aarumi = Aarumi.objects.create(
        sender = request.user,
        receiver_id=request.session.get("receiver"),
        aarumi_reply_id=reply_id,
        created_at=parse_datetime(msg.get("created_at")),
        message_body = message)
        msg["id"] = aarumi.id  # Update the ID in the message
        if aarumi.aarumi_reply:
            msg["replyMessage"]=aarumi.aarumi_reply.message_body
            msg["replyFrom"]="you"
            msg["replyId"]=reply_id
            msg["created_at"]=aarumi.created_at.isoformat()
            if aarumi.aarumi_reply.sender_id != aarumi.sender_id:
                msg["replyFrom"] = aarumi.aarumi_reply.sender.username
        response_pairs[temp_id] = aarumi.id
    return response_pairs,failedMessages
@login_required
def getAarumis(request):
    receiver_id = request.session.get("receiver")
    sender = request.user

    if not receiver_id:
        return Aarumi.objects.none()

    aarumis = Aarumi.objects.filter(
        Q(sender=sender, receiver_id=receiver_id) |
        Q(sender_id=receiver_id, receiver=sender)
    ).filter(
        is_deleted=False  # example condition if you're using soft delete
    ).annotate(
        flow_time=Case(
            When(sender=sender, then=F('created_at')),
            When(sender_id=receiver_id, then=F('seen_at')),
            output_field=DateTimeField()
        )
    ).order_by('-flow_time')
    return aarumis  # or serialize and return as JSON
@login_required
def seenByMe(request):
    data = json.loads(request.body)
    aarumi_ids = data.get("aarumiIds", [])
    is_seen_or_is_received = data.get("is_seen_or_is_received")

    if aarumi_ids and is_seen_or_is_received in ["is_seen", "is_received"]:
        update_fields = {is_seen_or_is_received: True}
        if is_seen_or_is_received == "is_seen":
            update_fields["seen_at"] = timezone.now()
        elif is_seen_or_is_received == "is_received":
            update_fields["received_at"] = timezone.now()
        Aarumi.objects.filter(id__in=aarumi_ids).update(**update_fields)
        return True
    
    return False

@login_required
def makeAllReceivedSeen(request):
    if request.body:
        data = json.loads(request.body)
        is_seen_or_is_received = data.get("is_seen_or_is_received", "is_seen")
    else:
        is_seen_or_is_received = "is_seen"
    unseen_aarumis = Aarumi.objects.filter(receiver=request.user, sender_id=request.session.get("receiver"), is_seen=False)
    aarumis_list = list(unseen_aarumis)
    for obj in unseen_aarumis:
        if is_seen_or_is_received == "is_seen":
            obj.is_seen = True
            obj.seen_at = timezone.now()
            obj.save(update_fields=['is_seen', 'seen_at'])
        elif is_seen_or_is_received == "is_received":
            obj.is_received = True
            obj.received_at = timezone.now()
            obj.save(update_fields=['is_received', 'received_at'])
    #unseen_aarumis.update(**update_fields)
    return aarumis_list
@login_required
def checkNewIdsIfSeen(request):
    data=json.loads(request.body)
    ids = data.get("newArrumiIds",[])
    seen_or_received="read"
    seen_ids = list(
            Aarumi.objects.filter(id__in=ids, is_seen=True).values_list("id", flat=True)
        )
    if not seen_ids:
        seen_ids = list(
                Aarumi.objects.filter(id__in=ids, is_received=True).values_list("id", flat=True)
            )
        seen_or_received="s_received"
    return seen_ids,seen_or_received