def aarumiSerializer(aarumis):
    data = []
    for aarumi in aarumis:
        replyMessage = ""
        replyFrom = ""
        if aarumi.aarumi_reply:
            replyMessage = aarumi.aarumi_reply.message_body
            replyFrom="you"
            if aarumi.aarumi_reply.sender_id != aarumi.sender_id:
                replyFrom = aarumi.aarumi_reply.sender.username
        data.append({
            'id': aarumi.id,
            'message': aarumi.message_body,
            'created_at': aarumi.created_at,
            'replyMessage': replyMessage,
            'replyFrom': replyFrom

        })
    return data
