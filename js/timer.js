var start_time;

function setup_timer() {
    start_time = new Date();
}

function update_timer() {
    document.getElementById('timer').textContent = format_time();
    if (!game_over) var t = setTimeout(update_timer, 1000);
}

function format_time() {
    var now_time = new Date();
    var ms_elapsed = now_time.getTime() - start_time.getTime();
    var secs = Math.floor(ms_elapsed / 1000);
    var timer_string = Math.floor(secs / 60) + ":";
    if (secs % 60 < 10) timer_string += "0";
    timer_string += (secs % 60);
    return timer_string;
}
