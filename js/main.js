// some global variables, for ease

var leftButtonDown = false;
var recentlyScraped = -1;
var recentlyIn = -1;
var num_scraped = 0;

var background_ctx;
var middleground_ctx;
var foreground_ctx;
var cursor_ctx;
var imageObj;

// global canvas w and h
var w;
var h;
var cvs_left;
var cvs_top;

// animation things
var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.msRequestAnimationFrame;
var animq = []; // animation queue

// draw a polygon
var drawPolygon = function(polygon, context) {
    context.beginPath();

    context.moveTo(polygon.points[0].x, polygon.points[0].y);
    for (var i = 1; i < polygon.points.length; i++) {
        context.lineTo(polygon.points[i].x, polygon.points[i].y);
    }
    context.closePath();
};

// erase a polygon
var erasePolygon = function(polygon, context) {
    context.globalCompositeOperation = 'destination-out';
    drawPolygon(polygon, context);
    context.fill()
};

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]
function isPointInPoly(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
            && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
            && (c = !c);
    return c;
}

function allowScrapes() {
    recentlyScraped = -1;
}

var clone = function (p,c) {
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object') {
            c[i] = (p[i].constructor === Array)?[]:{};
            clone(p[i],c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}

var translatePolygon = function(polygon, x, y) {
    for (var i = 0; i < polygon.points.length; i++) {
        polygon.points[i].x += x;
        polygon.points[i].y += y;
    }
};

var minX = function(polygon) {
    var min = {x: polygon.points[0].x, y: polygon.points[0].y};
    for (var i = 0; i < polygon.points.length; i++) {
        if (polygon.points[i].x < min.x) {
            min.x = polygon.points[i].x;
            min.y = polygon.points[i].y;
        }
    }   
    return min;
};

var minY = function(polygon) {
    var min = {x: polygon.points[0].x, y: polygon.points[0].y};
    for (var i = 0; i < polygon.points.length; i++) {
        if (polygon.points[i].y < min.y) {
            min.x = polygon.points[i].x;
            min.y = polygon.points[i].y;
        }
    }   
    return min;
};

var offCanvas = function(polygon) {
    var miny = minY(polygon);
    if (miny.y > h) return true;

    var minx = minX(polygon);
    if (minx.x > w) return true;

    return false;
};

/* The main game "loop", called wheneverthe mouse is moved
*/
function gameMouseMove(evt) {
    function inPoly(x,y,p){
        return isPointInPoly(p.points, {x:x, y:y});
    }

    var update = function(polygon) { // updates position of polygon for animation
        translatePolygon(polygon, 0, polygon.speed); // fall straight down
        foreground_ctx.fillStyle = "#00FF00";
        drawPolygon(polygon, foreground_ctx);
        foreground_ctx.fill();
    };

    var draw = function() {
        foreground_ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < animq.length; i++) {
            update(animq[i]);
            if (offCanvas(animq[i])) {
                animq.splice(i,1); 
                i--;
            } 
        }
        console.log(animq.length);

        if (animq.length != 0) {
            requestAnimationFrame(draw);
        }
    }

    var eject = function(polygon) { // push onto the queue for ejection
        var animpoly = clone(polygon);
        animpoly.speed = .2 + Math.random() * 3; //random speed
        animq.push(animpoly);
        if (animq.length == 1) { // first one, start the animation!
            draw();
        }
    };

    if (game_over) return;
    mX = evt.pageX - cvs_left;
    mY = evt.pageY - cvs_top;
    for (var i = 0; i < polygons.length; i++) {
        if (inPoly(mX, mY, polygons[i])){
            if(leftButtonDown && recentlyIn != -1 && polygons[recentlyIn].scraped
               && !polygons[i].scraped && recentlyScraped == -1  ){
                //scrape!!
                polygons[i].scraped = true;
                eject(polygons[i]); // start animation for this polygon
                num_scraped++;
                recentlyScraped = i;

                play_sound();
                redraw(middleground_ctx);
                
                // potential for additional scrapings
                if (Math.random() < 0.2) {
                    var plusone = crumble(i);
                    if (plusone != -1) {
                        polygons[plusone].scraped = true;
                        eject(polygons[plusone]); // start animation for this polygon
                        num_scraped++;
                        redraw(middleground_ctx);
                    }
                }

            }
            recentlyIn = i;
            //re-allow scrapes if we have left the recently scraped polygon
            if (recentlyScraped != -1 && recentlyIn != recentlyScraped){
                allowScrapes();
            }
        }
    }
    if (num_scraped == polygons.length - 1) 
        win(foreground_ctx, w, h, cvs_left, cvs_top);
}

// does initial setup
function setup() {

    var background = document.getElementById("background");
    var middleground = document.getElementById("middleground");
    var foreground = document.getElementById("foreground");
    var gradient = document.getElementById("gradient");
    var cursor = document.getElementById("cursor");

    cvs_left = $(background).offset().left;
    cvs_top = $(background).offset().top;

    // make canvas full height of page
    h = background.height;
    w = background.width;
    background.height = h;
    middleground.height= h;
    foreground.height = h;
    gradient.height = h;
    cursor.height = h;

	// handler for the icons, mouseout
	$('.paperIcon').mouseout( function() {
			$(this).css("background-image", "url('img/paper-down.png')");
		});

	// handler for the icons, mouseover
	$('.paperIcon').mouseenter( function() {
			$(this).css('background-image', 'url(' + '"img/paper-up.png"' + ')');
		});

    //hack for mouse status
    $(document).mousedown(function(e){
        // Left mouse button was pressed, set flag
        if(e.which === 1) leftButtonDown = true;
    });
    $(document).mouseup(function(e){
        // Left mouse button was released, clear flag
        if(e.which === 1){
            leftButtonDown = false;
            allowScrapes();
        }
    });

    background_ctx = background.getContext("2d");
    middleground_ctx = middleground.getContext("2d");
    foreground_ctx = foreground.getContext("2d");
    cursor_ctx = cursor.getContext("2d");
    var gradient_ctx = gradient.getContext("2d");	

    // load cursor image asset.
    imageObj = new Image();
    imageObj.src = "http://i.imgur.com/nS6TUxb.png";

    // fill the gradient layer
    var grad = gradient_ctx.createRadialGradient(w/2, h/2, 180, w/2, h/2, h);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(1, "#000000");
    gradient_ctx.rect(0, 0, w, h);
    gradient_ctx.fillStyle = grad;
    gradient_ctx.fill();

    // get list of polygons filled		
    setupPolygons(background.width, background.height);

    // fill the middleground, with polygons
    fillMiddleground(middleground_ctx);
    
    //remove random piece
    polygons[Math.floor(Math.random() * polygons.length)].scraped = true;

    // set cursor
    $('#cursor').mousemove( function(e) {
        drawScraper(e);
        gameMouseMove(e);
    });

    // setup timer
    setup_timer();
};


/* Draws one polygon
*/
function drawOne(p,ctx) {
    if (!p.scraped) {
        drawPolygon(p, ctx);
        ctx.fill();
    }
}

/* redraw entire buffer, commiting changes
*/
function redraw(ctx) {
    ctx.clearRect(0,0,w,h);
    for (var i = 0; i < polygons.length; i++) {
        drawOne(polygons[i], ctx);
    }
}

function drawScraper(e) {
    cursor_ctx.clearRect(0, 0, w, h);
    cursor_ctx.drawImage(imageObj, e.pageX - cvs_left - 70, e.pageY - cvs_top - 20);
};

function fillMiddleground(ctx) {
    var imageObj = new Image();

    imageObj.onload = function() {
        //ctx.drawImage(imageObj, 0, 0);
        var pattern = ctx.createPattern(imageObj, "repeat");
        ctx.fillStyle = pattern;
        redraw(ctx);
    };
    imageObj.src = "http://farm4.staticflickr.com/3333/3333171389_35b840e742_o.jpg";
    //imageObj.src = "http://farm3.staticflickr.com/2176/2394924890_02a6b830a7_b.jpg";
};

// contains the functionality for crumbling nearby polygons
// in a domino effect.
// when called, finds an unscraped polygon sharing a border point
// with the given polygon. "polygon" arg is actually an index.
function crumble(polygon) {
    var access_pts = polygons[polygon]["points"];

    for (var pt = 0; pt < access_pts.length; pt++) {
        for (var pg = 0; pg < polygons.length; pg++) {
            // if the polygon has been scraped or is the
            // given polygon, continue.
            if (polygons[pg]["scraped"]) continue;
            if (pg == polygon) continue;

            // find a matching point, return first possibility.
            var poly_pts = polygons[pg]["points"];
            for (var ppt = 0; ppt < poly_pts.length; ppt++) {   
                if (access_pts[pt]["x"] == poly_pts[ppt]["x"] &&
                    access_pts[pt]["y"] == poly_pts[ppt]["y"]) {
                    // note that this returns an index
                    // not a polygon object.
                    return pg; 
                }   
            }   
        }   
    }   
    return -1;
};
