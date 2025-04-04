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





function updateNoteTimings() {
    $(".note-timing").each(function () {
        let timingAttr = $(this).attr("timing");
        if (!timingAttr) return;

        let noteTime = new Date(timingAttr);
        let formattedTime = formatNoteTitle(noteTime); // Use your existing function

        $(this).text(formattedTime);
    });
}