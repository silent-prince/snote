function createSentElement(message,replymessage,aarumi_from,replyingmessageid,created_at){
    let tempid = "temp" + Math.floor(1000 + Math.random() * 9000);  
    return createElement(tempid,message,replymessage,aarumi_from,"sent","sending","new",replyingmessageid,created_at);
}
function createElement(aarumiId,message,replyMessage,aarumi_from,type,status,newOrOld,replyingmessageid,created_at){
    
    let replyHtml = "";
    if(replyMessage !== undefined && replyMessage !== null && replyMessage !== "" && replyMessage.trim() !== '')
        replyHtml=`<div class="reply">${replyMessage}</div>`;
    
    let ele=`<div newOrOld="${newOrOld}" aarumi-from="${aarumi_from}" aarumi-id="${aarumiId}" aarumi-reply-id="${replyingmessageid}" class="chat-message ${type}">
    ${replyHtml}
    <div class="message-body">${message}</div>
    <div class="meta-info">
        <div class="timestamp" seen-sent="${created_at}">${formatTime(created_at)}</div>
        <div class="status"><i class="${status}"></i></div>
    </div>
</div>`;
$("#chat-body").prepend(ele);
return aarumiId;
}
function createReceivedElement(data){
    let now=new Date();
    createElement(data.id,data.message,data.replyMessage,data.replyFrom,"received","no_status","old","00",now);
}
function updateElement(temp_aarumi_id,savedData){
    let messagestatus="sending";
    let ele=$(`[aarumi-id="${temp_aarumi_id}"]`);
    let icon=ele.find(".status i");
    console.log("aarumi id "+savedData.aarumiid);
    if(savedData.success){
        messagestatus="sent";
        ele.attr("aarumi-id", savedData.aarumiid);
    }else{
        messagestatus="failed";
        ele.attr("newOrOld","offline");
    }
    icon.attr('class', messagestatus);
}
function updateElementStatus(status){
    if(status==="s_received")
    $(".chat-message.sent .sent").attr('class', status);
    else if(status==="read"){
        $(".chat-message.sent .sent").attr('class', status);
        $(".chat-message.sent .s_received").attr('class', status);
    }
    if(status=="read")
        $(".chat-message.sent").attr("newOrOld","old");
}
function updateOfflineElement(tempid, actualId){
    let ele=$(`[aarumi-id="${tempid}"]`);
    ele.attr("aarumi-id", actualId);
    ele.attr("newOrOld","new");
    ele.find(".status i").attr('class', "sent");
}