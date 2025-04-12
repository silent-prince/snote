$(document).ready(function(){
    //Pusher.logToConsole = true;
    let startTime=Date.now();
    var pusher = new Pusher('3d2b17bf76b92c8f20cd', {
        cluster: 'ap2'
      });
    const receiverChannel = pusher.subscribe(`receiver-channel-${myUserid}`);
$("#send-message").click(function(){
    let message=$("#message-input").val().trim();
    if(message!==""){
        $("#message-input").val("");
    let replyingmessage=$(".replying-message").text().trim();
    let replyingmessageid=$(".replying").attr("replying-aarumi-id");
    let aarumi_from=$(".replying-to").text();
    console.log("saving message "+message+" replyingmessage "+replyingmessage+" replyingmessageid "+replyingmessageid);
    let temp_aarumi_id=createSentElement(message,replyingmessage,aarumi_from);
    savemessage(message, replyingmessageid).then(savedData => {
        console.log("temp_aarumi_id", temp_aarumi_id);
        updateElement(temp_aarumi_id, savedData);
    });
    }
});
const textarea = document.getElementById('message-input');
    textarea.addEventListener('input', () => {
      textarea.style.height = '20px';
      textarea.style.height = textarea.scrollHeight + 'px';
});
$(".chat-message").on("mousedown touchstart", function (e) {
    handleStart(e, $(this));
});

let receivedAarumiIds = new Set();
let inFocus=true;
receiverChannel.bind('new-aarumi-event', function(data) {//new message received
        console.log("received dssta "+data.aarumiId);
        if (inFocus){
            seenByMe([data.aarumiId],"is_seen");//if user1 is on current screen send status seen
        }else{
            seenByMe([data.aarumiId],"is_received");//if user1 is not on current screen send status received
            receivedAarumiIds.add(data.aarumiId)//add id in list so when user1 resume screen send read status
        }
        createReceivedElement(data);//created received element
});

receiverChannel.bind('all-seen-event', function(data) { // user2 sends update either he seen message or received message
    console.log("all-seen-event dsta "+data);
    let seenOrReceived=data.is_seen_or_is_received;
    updateElementStatus(seenOrReceived);// update user1 screen accordingly

});

pusher.connection.bind('connected', function() {
    // it does 3 jobs
    // job 1 -- check for status for sent message if its read or received only to user 2
    // job 2-- fetch for new meesage from db and get it in user1 screen
    // job 3-- if user1 is in front screen send update for newly received message read else received
    const now = Date.now();
    const timeDiffInSec = (now - startTime) / 1000;
    console.log("Pusher connected. Time diff:", timeDiffInSec, "sec");
    if (timeDiffInSec > 2) {
        console.log("Connection took longer — likely reconnected. Fetching missed messages...");
        let newArrumiIds = $('[newOrOld="new"]').map(function () {//from user1 screen those message has been sent check seen or received update
            return $(this).attr('aarumi-id');
        }).get();//this ids are for job 1
        
        let seenOrReceived="is_received"
        if (inFocus){
            seenOrReceived="is_seen"
        }
        console.log("after reconnect "+newArrumiIds+" seenOrReceived "+seenOrReceived);
        getMissedData(newArrumiIds,seenOrReceived).then(data=>{//this ids are for job1 and seenOrReceived for job 3
            console.log("got missed data");
            let seenOrReceived=data.is_seen_or_is_received;
            updateElementStatus(seenOrReceived);// response for job 1
            let newAarumiList=data.newAarumiList || [];
            newAarumiList.forEach(aarumi => {
                createReceivedElement(aarumi); //response for job 2
                if(!inFocus)
                receivedAarumiIds.add(data.aarumiId)//add id in list so when user1 resume screen send read status
            });
        });//dbops.js
    }
    startTime = Date.now();
});

document.addEventListener("visibilitychange", function () {
    const now = new Date().toLocaleString(); // Example: "4/7/2025, 10:34:22 AM"
    if (document.hidden) {
        console.log(`[${now}] User is not seeing the page anymore.`);
        inFocus=false;
        // Trigger pause-like action
    } else {
        console.log(`[${now}] User came back to the page.`);
        inFocus=true;
        if (receivedAarumiIds.size > 0) {
            let idsArray = Array.from(receivedAarumiIds);
            console.log("got some ids"+idsArray);
            seenByMe(idsArray,"is_seen").then(res=>{// as focus resume sends user 2 response that messages are read
                if(res)
                    receivedAarumiIds.clear();
            });
            
        }
    }
});

});