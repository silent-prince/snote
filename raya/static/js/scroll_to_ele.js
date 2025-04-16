

$(document).ready(function () {
   
//for scroll to replied element
$("#chat-body").on('click','.chat-message .reply',function(){
    console.log("clicked on message");
    let replyid=$(this).parent().attr('aarumi-reply-id');
    console.log("replyid "+replyid);
    if(!(replyid === undefined || replyid === null || replyid === "" || isNaN(Number(replyid)))) {
        console.log("replyid is valid "+replyid);
    let ele = $(`[aarumi-id='${replyid}']`);
    scrollToElement(ele);
    blinkBorder(ele, "#ee9b9b");
}
});
function scrollToElement(targetElement) {
    
    //var targetElement = $('#' + targetId);

    if (targetElement.length) {
        var container = $('#chat-body');

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

function blinkBorder(element, color, fadeDuration = 3000) {
    let originalColor = element.css("background-color");
    element.css("background-color", color);

    setTimeout(() => {
        element.css("transition", `background-color ${fadeDuration}ms`);
        element.css("background-color", originalColor);

        // Optionally remove the transition after it's done
        setTimeout(() => {
            element.css("transition", "");
        }, fadeDuration);
    }, 2000);
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



