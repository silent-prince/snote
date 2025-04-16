
let curretTime= Date.now();
$(document).ready(function () {
    $('#message-input').on('input', function (event) {
        let curretTime2= Date.now();
        if (curretTime2 - curretTime >4000) {
            sendTypingStatus(true);
            curretTime=curretTime2;
        }
        
    });
    function sendTypingStatus(status) {
        /*const now = new Date();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        console.log(`sender is typing: ${status} at ${minutes}:${seconds}`);*/
        fetch(notify_typing_status);
    }


});

function setTyingIsTrue(data) {
       const now = Date.now();
       let ele=`<div class="chat-message received typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>`;
            
       if (data.typing) {
           /*const date1 = new Date();
           const minutes = date1.getMinutes().toString().padStart(2, '0');
           const seconds = date1.getSeconds().toString().padStart(2, '0');
           console.log(`User is typing: true  at ${minutes}:${seconds}`);*/
           clearTimeout(window.receivedTypingReset); // Clear the timeout for resetting typing status
           if($(".typing-indicator").length === 0) {
            $("#chat-body").prepend(ele);
           }
          
           
       }
       
    window.receivedTypingReset = setTimeout(() => {
            /*const date2 = new Date();
            const minutes = date2.getMinutes().toString().padStart(2, '0');
            const seconds = date2.getSeconds().toString().padStart(2, '0');
            console.log(`User is typing: false  at ${minutes}:${seconds}`);*/
            $('.typing-indicator').remove(); // Remove the typing indicator after 6 seconds of inactivity
        //sendTypingStatus(false); // Send status when typing stops
    }, 6000);
   }
