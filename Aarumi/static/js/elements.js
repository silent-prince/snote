function createSentElement(message,replymessage,aarumi_from){
    let tempid = "temp" + Math.floor(1000 + Math.random() * 9000);  
    return createElement(tempid,message,replymessage,aarumi_from,"sent","sending","new");
}
function createElement(aarumiId,message,replyMessage,aarumi_from,type,status,newOrOld){
    let replyHtml = replyMessage.trim() !== '' ? `<div class="reply">${replyMessage}</div>` : '';
    let ele=`<div newOrOld="${newOrOld}" aarumi-from="${aarumi_from}" aarumi-id="${aarumiId}" class="chat-message ${type}">
    ${replyHtml}
    <div class="message-body">${message}</div>
    <div class="meta-info">
        <div class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="status"><i class="${status}"></i></div>
    </div>
</div>`;
$("#chat-body").prepend(ele);
return aarumiId;
}
function createReceivedElement(data){
    createElement(data.aarumiId,data.message,data.replyMessage,data.replyFrom,"received","none","old");
}
function updateElement(temp_aarumi_id,savedData){
    let messagestatus="sending";
    let ele=$(`[aarumi-id="${temp_aarumi_id}"]`);
    let icon=ele.find(".status i");
    console.log("aarumi id "+savedData.aarumiid);
    if(savedData.success){
        messagestatus="sent";
        ele.attr("aarumi-id", savedData.aarumiid);
    }else
        messagestatus="failed";
    icon.attr('class', messagestatus);
}
function updateElementStatus(status){
    if(status==="s_received")
    $(".chat-message.sent .sent").attr('class', status);
    else if(status==="read"){
        $(".chat-message.sent .sent").attr('class', status);
        $(".chat-message.sent.s_received").attr('class', status);
    }
    if(status=="read")
        $(".chat-message.sent").attr("newOrOld","old");
}