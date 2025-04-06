
function processlist(data,mode,addOrNew){
    //console.log("if success "+data.success);
    let notesList = $("#notesList");
    if(addOrNew==="new"){
    notesList.empty();
    }
    
    if (data.notes.length === 0 && addOrNew==="new") {
        notesList.html('<p style="text-align: center; color: #6b7280;">No notes found.</p>');
    }else{
    $.each(data.notes, function(index, note) {
        lastNoteId=note.id;
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
        //console.log("id "+note.id+" isSeen "+note.isSeen);
        if(note.isSeen){
            noteItem.css("border-color", "#66ed5a");
        }
        if(note.username!=myusername)
            noteItem.css("border-color", "#a597ff");
        notesList.prepend(noteItem);
    });
    console.log("lastnoteid on static load "+lastNoteId);
    //notesList.scrollTop(notesList.prop("scrollHeight"));
}
}




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
    let newOrOld="old";
    if(mode==="secret"){
        rightleft="goright";
        newOrOld="new";

    }
    let noteItem = $('<div>', {
        noteid: `${noteid}`,
        newOrOld:`${newOrOld}`,
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
    }).css("border-color", "#858585");
    
    notesList.prepend(noteItem);
    //scrollbottom();
    return noteItem;
}

function make_seen_by_me(noteid){
    let csrfToken = $("[name=csrfmiddlewaretoken]").val();
    fetch(make_seen, {
        method: "POST",
        headers: {"X-CSRFToken": csrfToken, "Content-Type": "application/json" },
        body: JSON.stringify({ noteid: noteid })
      })
      .then(res => res.json())
      .then(data => console.log(data))
      .catch(err => console.error(err));
}

function create_new_item_from_socket(data){
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
            return noteItem;
}

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
                    lastNoteId=data.noteid;
                    console.log("lastnoteid on save "+lastNoteId);
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
