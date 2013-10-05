var game_over;
var fb_string="";

function win(ctx, cvs_w, cvs_h, cvs_left, cvs_top) {
    console.log("WINNER");
    game_over = true; 
    var end_time = new Date();
    var time = end_time.getTime() - start_time.getTime();
    $("#yourTime").text( (time/1000) + " sec");
    $("#wintoast").fadeIn();
}

function update_fb_link() {
    var linku = "https://www.facebook.com/dialog/feed?app_id=240548372765988 &display=popup&caption=A%20JS%20Web%20Scraper &redirect_uri=https://developers.facebook.com/tools/explorer &link=kyleerf.com"
    if (fb_string != "") {;}

    $("#fblink").attr("href", linku);

}

