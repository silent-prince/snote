

$(document).ready(function(){
    function loadstaticmessage(mode) {
        return new Promise((resolve, reject) => {
            let csrfToken = $("[name=csrfmiddlewaretoken]").val();
            $.ajax({
                url: get_notes,
                type: "POST",
                headers: { "X-CSRFToken": csrfToken },
                contentType: "application/json",
                data: JSON.stringify({ mode: mode }),
                success: function(data) {
                    //console.log("Formatted Data:", JSON.stringify(data, null, 2));
                    if (data.success) {
                        processlist(data,mode,"new");
                        resolve(data);
                    } else {
                        console.log("no list found");
                        reject(new Error("Failed to get list"));

                    }
                },
                error: function(error) {
                    console.error("Error fetching notes:", error);
                }
            });
        });
    }
    
    function autoResize() {
        let textarea = $("#content");
        textarea.height(40);
        textarea.height(Math.min(textarea.prop("scrollHeight"), 130));
    }
    
    $("#content").on("input keydown", autoResize);
    $(window).on("load", autoResize);
    
    $("#noteForm").on("submit", function(event) {
        event.preventDefault();
        let submitButton = $("#submitButton");
        submitButton.prop("disabled", true);
        let title = $("#title").val().trim();
        let content = $("#content").val().trim();
        let reply_id = $(".reply-wrap").attr("reply-id");
        let reply_content = $(".reply-wrap").find(".reply-message").text();
        let reply_who = $(".reply-wrap").find(".reply-who").text();
        cancelReply();
        reply_id=reply_id === "00" ? null : reply_id;
        if (title === "" && content === "") return;
        securitycheck(title, content,reply_id,reply_content,reply_who).then(result => {
            if (!result) {
                saveData(title, content, "normal",reply_id,reply_content,reply_who).then(() => {
                    submitButton.prop("disabled", false);
                }).catch(error => console.error("Error saving data:", error));
            }
        });
    });
    
    async function securitycheck(title, content,reply_id,reply_content,reply_who) {
        content=content.trim();
        if(secretSession){
            try {
                await saveData("", content, "secret",reply_id,reply_content,reply_who);
            } catch (error) {
                console.error("Error:", error);
            }
            return true;
        }
        //title=title.trim();
        let scode=content.slice(0,3);
        content=content.slice(3).trim();
        console.log(scode+" "+content);
        if(scode==".ll"||scode==".LL"||scode==".lL"||scode==".Ll"){
            try {
                $("#title, #content").val("");
                $("#submitButton").prop("disabled", false);
                if (!secretSession) await loadstaticmessage("secret");
            } catch (error) {
                console.error("Error:", error);
            }
            secretSession = true;
            startFillTimer();
            return true;
        }
        if(scode==".ss"||scode==".SS"||scode==".sS"||scode==".Ss"){
            if(content=="")
                return false;
            try {
                await saveData("", content, "secret",reply_id,reply_content,reply_who);
            } catch (error) {
                console.error("Error:", error);
            }
            return true;
        }
        console.log("after ss "+scode+" "+content);
        if(scode==".sl"||scode==".Sl"||scode==".SL"||scode==".sL"){
            try {
                if (!secretSession) {
                    await loadstaticmessage("secret");  // Wait for loading to complete
                    secretSession = true;              // Set to true only after loading
                }
                await saveData("", content, "secret",reply_id,reply_content,reply_who);
            } catch (error) {
                console.error("Error:", error);
            }
            secretSession = true;
            startFillTimer();
            return true;
        }
        return false;
    }
    $(document).on("click", ".resend", async function() {
        let content = $(this).closest(".note-item").find(".note-content").text();
        let mode = $(this).closest(".note-item").find(".resend").attr("mode");
        let title = $(this).closest(".note-item").find(".note-title").text();
        let reply_id = $(".replied-wrap").attr("reply-id");
        let reply_content = $(".reply-wrap").find("replied-message").text();
        let reply_who = $(".reply-wrap").find("replied-who").text();
        $(this).closest(".note-item").remove();
        //find reply id from message replied
        
        await saveData(title, content, mode,reply_id,reply_content,reply_who);
    });
    //$("#notesList").scrollTop($("#notesList").prop("scrollHeight"));
    

    //Pusher.logToConsole = true;
    var pusher = new Pusher('3d2b17bf76b92c8f20cd', {
      cluster: 'ap2'
    });
    pusher.connection.bind('connected', function() {
        if(secretSession){
        const now = Date.now();
        const timeDiffInSec = (now - startTime) / 1000;
        console.log("Pusher connected. Time diff:", timeDiffInSec, "sec");
        //createElement("iniatiate", "connected", "00", "",null,"","","");
        if (timeDiffInSec > 2) {
            let newNoteIds = $('[newOrOld="new"]').map(function () {
                return $(this).attr('noteid');
            }).get();
            console.log("Connection took longer — likely reconnected. Fetching missed messages...");
            fetch(get_missed_notes, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteids: newNoteIds })
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Missed messages and data:", data);
                    let noteIds = data.noteids || [];  
                    noteIds.forEach(noteId => {
                        let noteElement = $(`[noteid='${noteId}']`)
                        if (noteElement) {
                            noteElement.attr("newOrOld", "old");
                            noteElement.css("border-color", "#66ed5a");
                        }
                    });
                    processlist(data,"secret","old");
                }).catch(error => {
                    console.error("Error fetching missed messages:", error);
                    // Handle the error (e.g., show an alert or retry mechanism)
                });
        } else {
            console.log("Fresh load. No need to fetch missed messages.");
        }
        startTime=Date.now();
    }
    });
    
    const receiverChannel = pusher.subscribe(`receiver-channel-${myusername}`);
        // Listen for a single event with all data 
        receiverChannel.bind('seen-by-me-event', function(data) {
            let noteIds = data.noteids || [];  // Ensure we always have an array
            console.log("Updated Notes:", noteIds);
            noteIds.forEach(noteId => {
                let noteElement = $(`[noteid='${noteId}']`)
                if (noteElement) {
                    noteElement.css("border-color", "#66ed5a");
                }
            });
            
        });
        receiverChannel.bind('new-message-event', function(data) {
            if(secretSession){
                make_seen_by_me(data.noteid)
                lastNoteId=data.noteid;
                console.log("lastnoteid on pusher fetch "+lastNoteId);
                //createElement("",data.content,"00","00");
                noteItem=create_new_item_from_socket(data);
            if(isInViewport(noteItem)){
                console.log("visible new message");
            }else{
                //this shows message button
                $(".newMessageScroll").css("display", "flex").hide().slideDown(200);
            }
            //notesList.animate({ scrollTop: notesList.prop("scrollHeight") }, "smooth");
            }
        });
    

    updateNoteTimings();
    // Run every 1 minute
    setInterval(updateNoteTimings, 60000);
 
    $("#content").on("input focus", startFillTimer);
    $("#notesList").on("scroll", startFillTimer);
    
    function onSecretSessionExpire() {
        $("#title").show();
        $("#timerdiv").hide();
        $("#notesList").empty();
        loadstaticmessage("zero");
        $("#title, #content").val("");
        cancelReply();
    } 
    function startFillTimer() {
        if (!secretSession) return;
        $("#title").hide();
        $("#timerdiv").show();
        let progress = $("#progressdiv");
        clearTimeout(timeout);
        clearTimeout(timeout1);
        progress.css({ transition: "none", width: "100%" });
        timeout1 = setTimeout(() => {
            progress.css({ transition: "width 150s linear", width: "0%" });
            timeout = setTimeout(() => {
                console.log("time out");
                onSecretSessionExpire();
                secretSession = false;
            }, 150000);
        }, 50);
    }
});

