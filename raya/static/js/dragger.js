let isDragging = false;
    let startX = 0;
let limit = 100
function minorVibrate() {
  if (navigator.vibrate) {
      navigator.vibrate(15); // Short vibration (15ms) for subtle feedback
  }
}
    function handleStart(e, $elem) {
      isDragging = true;
      startX = e.pageX || e.originalEvent.touches[0].pageX;

      $(document).on("mousemove.drag touchmove.drag", function (e) {
        if (isDragging) {
          let moveX = e.pageX || e.originalEvent.touches[0].pageX;
          let diffX = moveX - startX;

          if (diffX > 0) {
            $elem.css("transform", "translateX(" + diffX + "px)");
          }

          if (diffX >= limit) {
            isDragging = false;
            $(document).off(".drag");
            minorVibrate();
            console.log("draggged");
            setReply($elem);
            $elem.css("transform", "translateX(0px)");
          }
        }
      });

      $(document).on("mouseup.drag touchend.drag", function () {
        isDragging = false;
        $(document).off(".drag");
        $elem.css("transform", "translateX(0px)");
      });
    }

    function setReply(draggedElement){
        //$("#notesList").animate({ marginBottom: "155px" }, 500);
        $("#message-input").focus();
        $(".replying-to").text(draggedElement.attr("aaurmi-from"));
        $(".replying-message").text(draggedElement.find(".message-body").text());
        $(".replying").attr("replying-aarumi-id",draggedElement.attr("aarumi-id"));
        $(".replying").slideDown(200);
    }

function cancelReply(){
  console.log("cancel reply");
  $(".replying").slideUp(200);
  $(".replying-to").text("");
  $(".replying-message").text("");
  $(".replying").removeAttr("replying-aarumi-id");
  //$(".replying").slideDown(200);
}
