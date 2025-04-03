(function ($) {
    $.fn.longPress = function (callback, duration = 800) {
        return this.each(function () {
            let holdTimer;
            
            $(this).on("touchstart mousedown", function (e) {
                e.preventDefault(); // Prevent default touch behavior
                holdTimer = setTimeout(() => {
                    callback.call(this, e);
                }, duration);
            });

            $(this).on("touchend mouseup mouseleave touchmove", function () {
                clearTimeout(holdTimer); // Clear timer on release or move
            });
        });
    };
})(jQuery);

$(".zero-list-item").longPress(function () {
    let noteid=$(this).attr("noteid");
    $(".option-popup-bg").css("display", "flex").hide().fadeIn(300);
    $(".option-popup-bg").attr("noteid",noteid);
});

$(".option-popup-cancel").click(function () {
    $(".option-popup-bg").css("display", "flex").show().fadeOut(300);
});
$(".option-popup-edit").click(function () {
    let noteid=$(".option-popup-bg").attr("noteid");
    let content=$(`[noteid='${noteid}']`).find(".note-content").text();
    let title=$(`[noteid='${noteid}']`).find(".note-title").text(); 
    $(".editor-popup-bg").css("display", "flex").hide().fadeIn(300);
    $(".option-popup-bg").css("display", "flex").show().fadeOut(300);
    $(".editor-popup-bg").attr("noteid",noteid);
    $(".editor-popup-title").val(title);
    $(".editor-popup-content").val(content);
});
$(".editor-popup-cancel").click(function () {
    $(".editor-popup-bg").css("display", "flex").show().fadeOut(300);
    $(".editor-popup-title").val("");
    $(".editor-popup-content").val("");
});
$(".editor-popup-save").click(function () {
    $(".editor-popup-bg").css("display", "flex").show().fadeOut(300);
    let noteid=$(".editor-popup-bg").attr("noteid");
    let title=$(".editor-popup-title").val();
    let content=$(".editor-popup-content").val();
    updateNote(noteid,title,content);
    $(".editor-popup-title").val("");
    $(".editor-popup-content").val("");
});

function updateNote(noteid,title,content){
    
    let noteItem=$(`[noteid='${noteid}']`);
    noteItem.find(".statusText").text("updating...");
    noteItem.find(".note-title").text(title);
    noteItem.find(".note-content").text(content);
    noteItem.css("border-color", "yellow");
    $.ajax({
        url: update_note,
        type: "POST",
        headers: { "X-CSRFToken": csrfToken },
        contentType: "application/json",
        timeout: 10000,  // 10 seconds
        data: JSON.stringify({ noteid:noteid,title: title, content: content}),
        success: function(data) {
            if (data.success) {
                noteItem.find(".statusText").text("updated");
                noteItem.css("border-color", "");
                
            } else {
                let resendBtn = $("<div>").addClass("retry").text("retry");
                noteItem.find(".messageStatus").append(resendBtn);
                noteItem.css("border-color", "#ff2525");
                noteItem.find(".messageStatus").text("error");
            }
        },
        error: function(xhr, textStatus, errorThrown) {
            let resendBtn = $("<div>").addClass("retry").text("retry");
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
            
        }
    });

}
$(document).on("click", ".retry", function() {
    let noteid = $(this).closest(".note-item").attr(".noteid");
    let content = $(this).closest(".note-item").find(".note-content").text();
    let title = $(this).closest(".note-item").find(".note-title").text();
    updateNote(noteid,title,content);
});
