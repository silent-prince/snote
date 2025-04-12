from .my_imports import login_required,json,Aarumi,Q,Case, When, F, DateTimeField

@login_required
def save_aarumi(request):
    data = json.loads(request.body)  # Parse JSON from request
    aarumi = Aarumi.objects.create(
    sender = request.user,
    receiver_id=request.session.get("receiver"),
    aarumi_reply_id=data.get("replyid"),
    message_body = data.get("message"))
    return aarumi
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
    aarumi_ids = data.get("aarumiIds",[])
    is_seen_or_is_received = data.get("is_seen_or_is_received")
    if aarumi_ids:
        Aarumi.objects.filter(id__in=aarumi_ids).update(**{is_seen_or_is_received: True})
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
    unseen_aarumis.update(**{is_seen_or_is_received: True})
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