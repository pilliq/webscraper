var game_over;

function win(ctx, cvs_w, cvs_h, cvs_left, cvs_top) {
    console.log("WINNER");
    game_over = true; 
    var end_time = new Date();
    var time = end_time.getTime() - start_time.getTime();
    $("#yourTime").text( (time/1000) + " sec");
    $("#wintoast").fadeIn();
}

