$(document).ready(function(){
    let secretSession = false;

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
                        //console.log("if success "+data.success);
                        let notesList = $("#notesList");
                        notesList.empty();
                        
                        if (data.notes.length === 0) {
                            notesList.html('<p style="text-align: center; color: #6b7280;">No notes found.</p>');
                            resolve([]);
                            return;
                        }
                        
                        $.each(data.notes, function(index, note) {
                            let replyData = note.reply_id; // reply_id is now an object
                            //let title = note.mode === "secret" ? formatNoteTitle(note.created_at) : note.title;
                            let replyHtml = ""; // Default empty, add only if reply exists
                            let rightleft="";
                            if(mode==="secret")
                            rightleft=(note.username === myusername) ? "goright" : "goleft";
                            if (replyData.id) {
                                replyHtml = `
                                    <div class="replied-wrap" reply-id="${replyData.id}">
                                        <div class="replied-who">${replyData.username === myusername ? "you" : replyData.username}</div>        
                                        <div class="replied-message">${replyData.content}</div>
                                    </div>`;
    }
                            let noteItem = $('<div>', {
                                noteid: `${note.id}`,
                                from:`${note.username===myusername?"you":note.username}`,
                                class: `note-item ${mode}-list-item ${rightleft}`,
                                html: `
                                ${replyHtml}  <!-- This div will be added only if there is a reply -->
                                <div class="note-title">${note.title}</div>
                                <div class="note-content">${note.content}</div>
                                <div class="messageStatus">
                                <div class="note-timing" timing="${note.created_at}">${formatNoteTitle(note.created_at)}</div>
                                </div>
                                `
                            });
                            if(note.username!=myusername)
                                noteItem.css("border-color", "#a597ff");
                            notesList.prepend(noteItem);
                        });
                        
                        //notesList.scrollTop(notesList.prop("scrollHeight"));
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
    
    function saveData(title, content, mode,reply_id,reply_content,reply_who) {
        return new Promise((resolve, reject) => {
            let randomId = Math.floor(1000 + Math.random() * 9000);
            let noteItem;
            if(!secretSession&&mode=="secret")
            noteItem = createElement("demo title", "This is a demo note", "00", randomId,reply_id,reply_content,reply_who,mode);
            else
            noteItem = createElement(title, content, "00", randomId,reply_id,reply_content,reply_who,mode);
            let csrfToken = $("[name=csrfmiddlewaretoken]").val();
    
            $.ajax({
                url: add_note,
                type: "POST",
                headers: { "X-CSRFToken": csrfToken },
                contentType: "application/json",
                timeout: 10000,  // 10 seconds
                data: JSON.stringify({ title: title, content: content, mode: mode,reply_id:reply_id }),
                success: function(data) {
                    if (data.success) {
                        noteItem.attr("noteid", `${data.noteid}`);
                        noteItem.find(".statusText").text("saved");
                        noteItem.css("border-color", "");
                        resolve(data);
                    } else {
                        let resendBtn = $("<div>").addClass("resend").text("resend").attr("mode", mode);
                        noteItem.find(".messageStatus").append(resendBtn);
                        noteItem.css("border-color", "#ff2525");
                        noteItem.find(".messageStatus").text("error");
                        reject(new Error("Failed to save data"));
                    }
                },
                error: function(xhr, textStatus, errorThrown) {
                    let resendBtn = $("<div>").addClass("resend").text("resend").attr("mode", mode);
                        noteItem.find(".messageStatus").children(".statusText").after(resendBtn);
                        noteItem.css("border-color", "#ff2525");
                    if (textStatus === "timeout") {
                        noteItem.find(".statusText").text("failed");
                        console.log("Request timed out!");
                    } else if (xhr.status === 0) {
                        noteItem.find(".statusText").text("no network");
                        console.log("No internet connection or server unreachable.");
                    } else {
                        noteItem.find(".statusText").text("error");
                        console.log("Error:", textStatus, errorThrown);
                    }
                    
                    reject(errorThrown);
                }
            });
        });
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
            console.log("insde ll "+scode+" "+content);
            console.log(secretSession);
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
        console.log("after ll "+scode+" "+content);
        if(scode==".ss"||scode==".SS"||scode==".sS"||scode==".Ss"){
            console.log("insde ss "+scode+" "+content);
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
            console.log("insde sl "+scode+" "+content);
            console.log(secretSession);
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
        console.log("after sl "+scode+" "+content);
        return false;
    }
    //Pusher.logToConsole = true;
    var pusher = new Pusher('3d2b17bf76b92c8f20cd', {
      cluster: 'ap2'
    });
    const receiverChannel = pusher.subscribe(`receiver-channel-${myusername}`);
        // Listen for a single event with all data
        receiverChannel.bind('new-message-event', function(data) {
            if(secretSession){
                //createElement("",data.content,"00","00");
                let notesList = $("#notesList");
                let  replyHtml = `
                <div class="replied-wrap" reply-id="${data.reply_id}">
                    <div class="replied-who">${data.reply_who}</div>        
                    <div class="replied-message">${data.reply_content}</div>
                </div>`;
                
                let noteItem = $('<div>', {
                noteid: `${data.noteid}`,
                from:`${data.username}`,
                class: "note-item secret-list-item goleft",
                html: `
                ${replyHtml}
                <div class="note-title"></div>
                <div class="note-content">${data.content}</div>
                <div class="messageStatus">
                <div class="note-timing" timing="${new Date().toISOString()}">just now</div>
                </div>
                `
            }).css("border-color", "#a597ff");
            notesList.prepend(noteItem);
            if(isInViewport(noteItem)){
                console.log("visible new message");
            }else{
                //this shows message button
                $(".newMessageScroll").css("display", "flex").hide().slideDown(200);
            }
            //notesList.animate({ scrollTop: notesList.prop("scrollHeight") }, "smooth");
            }
        });
    function createElement(title, content, noteid, tempid,reply_id,reply_content,reply_who,mode) {
        $("#title, #content").val("");
        $("#submitButton").prop("disabled", false);
        let notesList = $("#notesList");
        let  replyHtml ="";
        if(reply_id!==null){
          replyHtml = `
                <div class="replied-wrap" reply-id="${reply_id}">
                    <div class="replied-who">${reply_who}</div>        
                    <div class="replied-message">${reply_content}</div>
                </div>`;
        }
        let rightleft="";
        if(mode==="secret")
            rightleft="goright"
        let noteItem = $('<div>', {
            noteid: `${noteid}`,
            from:"you",
            class: `note-item ${mode}-list-item ${rightleft}`,
            id: tempid,
            html: `
            ${replyHtml}
            <div class="note-title">${title}</div>
            <div class="note-content">${content}</div>
            <div class="messageStatus">
            <div class='statusText'>saving...</div>
            <div class="note-timing" timing="${new Date().toISOString()}">just now</div>
            </div>
            `
        }).css("border-color", "#ffdd25");
        
        notesList.prepend(noteItem);
        scrollbottom();
        return noteItem;
    }
    function updateNoteTimings() {
        $(".note-timing").each(function () {
            let timingAttr = $(this).attr("timing");
            if (!timingAttr) return;
    
            let noteTime = new Date(timingAttr);
            let formattedTime = formatNoteTitle(noteTime); // Use your existing function
    
            $(this).text(formattedTime);
        });
    }
    updateNoteTimings();
    // Run every 1 minute
    setInterval(updateNoteTimings, 60000);
    function formatNoteTitle(title) {
        let date = new Date(title);
        if (isNaN(date.getTime())) {
            return title;
        }
        let now = new Date();
        let diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 3600) {
            let minutes = Math.floor(diffInSeconds / 60);
            return minutes > 1 ? `${minutes} min ago` : "Just now";
        }
        let isToday = now.toDateString() === date.toDateString();
        let yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        let isYesterday = yesterday.toDateString() === date.toDateString();
        let formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        if (isToday) {
            return formattedTime;
        } else if (isYesterday) {
            return `Yesterday ${formattedTime}`;
        } else {
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + " " + formattedTime;
        }
    }
    
    function onSecretSessionExpire() {
        $("#title").show();
        $("#timerdiv").hide();
        $("#notesList").empty();
        loadstaticmessage("zero");
        $("#title, #content").val("");
        cancelReply();
    }
    
    let timeout, timeout1;
    $("#content").on("input focus", startFillTimer);
    $("#notesList").on("scroll", startFillTimer);
    
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