

$(document).ready(function () {




function minorVibrate() {
    if (navigator.vibrate) {
        navigator.vibrate(15); // Short vibration (15ms) for subtle feedback
    }
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



