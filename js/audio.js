// load the audio files
var scrape1 = new Audio('../audio/scrape.wav');
var scrape2 = new Audio('../audio/lick-01.wav');
var scrape3 = new Audio('../audio/slurp-01.wav');
var scrape4 = new Audio('../audio/slurp-02.wav');
var snds = [scrape1, scrape2, scrape3, scrape4];

// play a random sound from snds.
function play_sound() {
    var which_snd = Math.floor((Math.random()*snds.length)+1);
    snds[which_snd].play();
}