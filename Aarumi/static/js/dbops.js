function savemessage(message,replyingmessageid){
    console.log("message dbops "+message)
     let replyid  = isNaN(replyingmessageid) ? null : replyingmessageid;
    return fetch(add_aarumi,{
        method:"POST",
        headers:{"X-CSRFToken":csrfToken},
        contentType:"Application/json",
        body:JSON.stringify({
            "message":message,
            "replyid":replyid
        })
    })
    .then(res=>res.json())
    .then(data=>{
        console.log("dbos fetch "+data.success)
        return data;
    })
    .catch(error => {
        console.log("error "+error);
        return "error";
    });
}
function seenByMe(aarumiIds,is_seen_or_is_received){
    return fetch(make_seen_by_me,{
        method:"POST",
        headers:{"X-CSRFToken":csrfToken},
        contentType:"Application/json",
        body:JSON.stringify({"aarumiIds":aarumiIds,"is_seen_or_is_received":is_seen_or_is_received})
    }).then(res=>res.json()).then(data=>{
        if(data.success){
        console.log("made seen or received by me");
        return true;
        }else{
        console.log("error made seen or received by me");
        return false;
        }
    }).catch(error=>{
        console.log(error);
        return false;
    });
}
function retryFailedMessages(){
    let failedMessages = $('[newOrOld="offline"]').map(function () {
        return {
            id: $(this).attr('aarumi-id'),
            message: $(this).find('.message-body').text().trim(),
            replyId: $(this).attr('aarumi-reply-id')
        };
    }).get();
    console.log(" deltelog failed messages "+failedMessages);
    return fetch(retry_failed_messages,{
        method:"POST",
        headers:{"X-CSRFToken":csrfToken},
        contentType:"Application/json",
        body:JSON.stringify({"failedMessages":failedMessages})
    }).then(res=>res.json()).then(data=>{
        console.log("retry failed messages "+data.success)
        return data;
    }).catch(error=>{
        console.log(error);
        return false;
    });
}
function getMissedData(newArrumiIds,is_seen_or_is_received){
    return fetch(get_missed_data,{
        method:"POST",
        headers:{"X-CSRFToken":csrfToken},
        contentType:"Application/json",
        body:JSON.stringify({
            "newArrumiIds":newArrumiIds,
            "is_seen_or_is_received":is_seen_or_is_received
        })
    }).then(res=>res.json()).then(data=>{
        return data
    }).catch(error=>{
        console.log(error);
        return data
    });
}