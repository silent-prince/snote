function cancelReply(){
    //$("#notesList").animate({ marginBottom: "125px" }, 500);
    $(".reply-wrap").slideUp(200);
    $(".reply-who").text("");
    $(".reply-message").text("");
    $(".reply-wrap").attr("reply-id","00");
    //$(".reply-wrap").hide();
}

$(document).ready(function () {


$(".reply-cancel").click(function(){
    cancelReply();
});


function setReply(draggedElement){
    //$("#notesList").animate({ marginBottom: "155px" }, 500);
    
    $("#content").focus();
    $(".reply-who").text(draggedElement.attr("from"));
    $(".reply-message").text(draggedElement.find(".note-content").text());
    $(".reply-wrap").attr("reply-id",draggedElement.attr("noteid"));
    $(".reply-wrap").slideDown(200);
}
function minorVibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(15); // Short vibration (15ms) for subtle feedback
    }
}

    let isDragging = false;
    let draggedElement = null;
    let startX = 0;
    let halfScreen = $(window).width() / 2;
    let hasCrossedHalf = false; // Track crossing state

    $("#notesList").on("touchstart mousedown", ".secret-list-item", function (e) {
        isDragging = true;
        draggedElement = $(this);
        startX = e.pageX || e.originalEvent.touches[0].pageX;
        hasCrossedHalf = false; // Reset on new drag
    });

    $(document).on("touchmove mousemove", function (e) {
        if (!isDragging) return;

        let currentX = e.pageX || e.originalEvent.touches[0].pageX;
        let diffX = currentX - startX;

        // Restrict movement to the right only
        if (diffX > 0) {
            draggedElement.css("transform", `translateX(${diffX}px)`);
        }

        // Print log only **once** when crossing half-screen
        if (diffX >= halfScreen && !hasCrossedHalf) {
            //console.log("Dragged beyond half-screen:", draggedElement.attr("id"));
            minorVibrate();
            setReply(draggedElement);
            hasCrossedHalf = true; // Prevent repeated logs
            cancelDrag();
        } 
        
        // Reset flag if moved back
        if (diffX < halfScreen) {
            hasCrossedHalf = false;
        }
    });

    $(document).on("touchend mouseup", function () {
        cancelDrag();
    });

function cancelDrag(){
    if (!isDragging) return;
    isDragging = false;

    // Smoothly return to original position
    draggedElement.css("transition", "transform 0.3s ease");
    draggedElement.css("transform", "translateX(0)");
}


//for scroll to replied element
$("#notesList").on('click','.replied-wrap',function(){
    let replyid=$(this).attr('reply-id');
    console.log("replyid "+replyid);
    let ele = $(`[noteid='${replyid}']`);
    scrollToElement(ele);
    blinkBorder(ele, 3, 500);
});
function scrollToElement(targetElement) {
    
    //var targetElement = $('#' + targetId);

    if (targetElement.length) {
        var container = $('#notesList');

        // Scroll so that the target element comes to the center
        var containerHeight = container.height();
        var elementHeight = targetElement.outerHeight();
        var containerScrollTop = container.scrollTop();
        var elementOffset = targetElement.position().top;

        var scrollTo = containerScrollTop + elementOffset - (containerHeight / 2) + (elementHeight / 2);

        container.animate({ scrollTop: scrollTo }, 500);
    } else {
        alert('Element not found!');
    }
}

function blinkBorder(element, times, interval) {
    let count = 0;
    let originalColor = element.css("border-color"); // Store the default border color
    
    let blinkInterval = setInterval(() => {
        element.css("border-color", count % 2 === 0 ? "yellow" : originalColor); // Toggle between red and default
        count++;
        if (count >= times * 2) clearInterval(blinkInterval); // Stop after 3 blinks
    }, interval);
}

$(".newMessageScroll").click(function(){
    scrollbottom();
    $(".newMessageScroll").slideUp(300);
});


});//end of document ready
function scrollbottom(){
    $("#notesList").animate({ scrollTop: $("#notesList").prop("scrollHeight") }, "smooth");
}
function isInViewport(item) {
    let $item = $(item);
    let $container = $("#notesList");

    let containerTop = $container.scrollTop(); 
    let containerBottom = containerTop + $container.innerHeight(); 

    let itemTop = $item.position().top; 
    let itemBottom = itemTop + $item.outerHeight();

    return itemBottom > 0 && itemTop < containerBottom;
}

