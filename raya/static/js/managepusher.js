function connectionRestore(){
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
}