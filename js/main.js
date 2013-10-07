// some global variables, for ease

var leftButtonDown = false;
var recentlyScraped = -1;
var recentlyIn = -1;
var num_scraped = 0;

var background_ctx;
var middleground_shadow_ctx;
var middleground_ctx;
var foreground_ctx;
var cursor_ctx;
var imageObj;
var backgroundImage;

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
var mouseTrail = [{x: 0, y: 0}]; // history of mouse positions. don't append directly
var numTrailEntries = 2; // number of entries to keep track of
var starsRender;

// add {x: ..., y: ...} coord to mouse history
var addMouseHistory = function(point) {
    if (mouseTrail.length >= 5) {
        mouseTrail.shift();
    }
    mouseTrail.push(point);

};



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

/* Returns the point with the minimum x from an array of points 
 */
var minX = function(points) {
    var min = {x: points[0].x, y: points[0].y};
    for (var i = 0; i < points.length; i++) {
        if (points[i].x < min.x) {
            min.x = points[i].x;
            min.y = points[i].y;
        }
    }   
    return min;
};

/* Returns the point with the minimum y from an array of points 
 */
var minY = function(points) {
    var min = {x: points[0].x, y: points[0].y};
    for (var i = 0; i < points.length; i++) {
        if (points[i].y < min.y) {
            min.x = points[i].x;
            min.y = points[i].y;
        }
    }   
    return min;
};

/* Checks if the drawing context for given polygon is
 * out of bounds of viewport
 */ 
var offCanvas = function(polygon) {
    if (polygon.ctx.y > h || polygon.ctx.x > w) {
        return true;
    }
    return false;
};

/* Returns true if polygon.ctx.scalex and polygon.ctx.scaley is 100% or greater
 */
var fullSize = function(polygon) {
    if (polygon.ctx.scalex >= 1 && polygon.ctx.scaley >= 1) {
        return true;
    }
    return false;
};

/* The main game "loop", called wheneverthe mouse is moved
*/
function gameMouseMove(evt) {
    function inPoly(x,y,p){
        return isPointInPoly(p.points, {x:x, y:y});
    }

    /* Draws a polygon onto a blank canvas in the renderCache div.
       Returns a selected HTML element of that canvas
     */
    var preRenderPolygon = function(polygon) {
        // setup canvas
        var canvas = $("<canvas></canvas>");
        canvas.attr("width", w);
        canvas.attr("height", h);
        $("#renderCache").append(canvas);

        // render polygon
        var ctx = canvas[0].getContext("2d");
        var pattern = ctx.createPattern(backgroundImage, "no-repeat");
        ctx.fillStyle = pattern;
        drawPolygon(polygon, ctx);
        ctx.fill();
        
        // save reference to the rendered canvas
        polygon.cachedRender = canvas[0];
    };

    var render = function(polygon) { // draws polygon
        foreground_ctx.save();
            foreground_ctx.translate(polygon.ctx.x, polygon.ctx.y);
            foreground_ctx.rotate(polygon.ctx.angle);
            foreground_ctx.scale(polygon.ctx.scalex, polygon.ctx.scaley);
            foreground_ctx.drawImage(polygon.cachedRender, 0, 0);
        foreground_ctx.restore();
    }
    
    var update = function(polygon) { // updates position of polygon for animation
        polygon.ctx.x += polygon.trajectory.x * polygon.speed.x;
        polygon.ctx.y += polygon.trajectory.y * polygon.speed.y;
        polygon.speed.y += (polygon.trajectory.y > 0) ? .2:-0.3;
        polygon.ctx.angle += polygon.angularSpeed;
        render(polygon);
    };

    var updateImage = function(polygon) { // used to update scale of starsRender
        polygon.ctx.scalex += 0.1;
        polygon.ctx.scaley += 0.1;
        render(polygon);
    };

    var draw = function() {
        foreground_ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < animq.length; i++) {
            if (animq[i].image) {
                updateImage(animq[i]);
                if (fullSize(animq[i])) {
                    animq.splice(i,1);
                }
            } else {
                update(animq[i]);
                if (offCanvas(animq[i])) {
                    var deletedPolygon = animq.splice(i,1)[0]; 
                    $(deletedPolygon.cachedRender).remove();
                    i--;
                } 
            }
        }

        if (animq.length != 0) {
            requestAnimationFrame(draw);
        }
    }

    var calcCurrentTrajectory = function() {
        var p1 = mouseTrail[mouseTrail.length-2];
        var p2 = mouseTrail[mouseTrail.length-1];
        return {x: p2.x-p1.x, y: p2.y-p1.y};
    };

    var eject = function(polygon) { // push onto the queue for animating
        var animpoly;
        if (polygon.image) {
            polygon.ctx.scalex = 0;
            polygon.ctx.scaley = 0;
            polygon.ctx.angle = 0;
            polygon.ctx.angularSpeed = 0;
            animpoly = polygon;
        } else {
            animpoly = clone(polygon);
            animpoly.image = false;
            animpoly.speed = {x: 2 + Math.random() * .4, y: 2 + Math.random() * .4}; //random speed
            animpoly.angularSpeed = 0;
            animpoly.ctx = {x: 0, y: 0, angle: 0, scalex: 1, scaley: 1};
            animpoly.trajectory = calcCurrentTrajectory();
            preRenderPolygon(animpoly);
        }
        animq.push(animpoly);
        if (animq.length == 1) { // first one, start the animation!
            draw();
        }
    };

    if (game_over) return;
    mX = evt.pageX - cvs_left;
    mY = evt.pageY - cvs_top;
    addMouseHistory({x: mX, y: mY});

    for (var i = 0; i < polygons.length; i++) {
        if (inPoly(mX, mY, polygons[i])){
            if(leftButtonDown && recentlyIn != -1 && polygons[recentlyIn].scraped
               && !polygons[i].scraped && recentlyScraped == -1  ){
                //scrape!!
                polygons[i].scraped = true;
                eject(polygons[i]); // start animation for this polygon
                num_scraped++;
                recentlyScraped = i;

                if (!start_time) setup_timer();

                play_sound();
                redraw(middleground_ctx);
                
                // potential for additional scrapings
                if (Math.random() < 0.08) {
                    var plusone = crumble(i);
                    if (plusone != -1) {
                        polygons[plusone].scraped = true;
                        eject(polygons[plusone]); // start animation for this polygon
                        eject({image: true, cachedRender: starsRender, ctx: {x: mX, y: mY} });
                        play_ding();
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
        win(middleground_ctx, w, h, cvs_left, cvs_top);
}

// does initial setup
function setup() {
    game_over = false;
    start_time=null;
    $("#wintoast").hide();

    var background = document.getElementById("background");
    var middleground_shadow = document.getElementById("middleground-shadow");
    var middleground = document.getElementById("middleground");
    var foreground = document.getElementById("foreground");
    var gradient = document.getElementById("gradient");
    var cursor = document.getElementById("cursor");

    fb_string = "";
    num_scraped = 0;

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
            scrape4.play();
			$(this).css('background-image', 'url(' + '"img/paper-up.png"' + ')');
		});

    //hack for mouse status
    $(document).mousedown(function(e){
        e.originalEvent.preventDefault();
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
    middleground_shadow_ctx = middleground_shadow.getContext("2d");
    middleground_ctx = middleground.getContext("2d");
    foreground_ctx = foreground.getContext("2d");
    cursor_ctx = cursor.getContext("2d");
    var gradient_ctx = gradient.getContext("2d");	

    // load cursor image asset.
    imageObj = new Image();
    imageObj.src = "img/scraper3.png";

    var stars = new Image();
    stars.onload = function() {
        // pre render double scrape stars
        var canvas = $("<canvas></canvas>");
        canvas.attr("width", w);
        canvas.attr("height", h);
        canvas.attr("id", "scrapeStar");
        $("#renderCache").append(canvas);

        var star_ctx = canvas[0].getContext("2d");
        star_ctx.drawImage(stars, 0, 0);
        starsRender = canvas[0];
    };
    stars.src = "img/stars.png";

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
    middleground_shadow_ctx.clearRect(0,0,w,h);
    middleground_shadow_ctx.shadowColor = '#555';
    middleground_shadow_ctx.shadowOffsetY = 2;
    middleground_shadow_ctx.shadowBlur = 2;
    for (var i = 0; i < polygons.length; i++) {
        drawOne(polygons[i], middleground_shadow_ctx);
    }
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
        var pattern = ctx.createPattern(imageObj, "no-repeat");
        backgroundImage = imageObj;
        ctx.fillStyle = pattern;
        redraw(ctx);
    };

    // randomly choose paint texture.
	var num = 33; // change only this when adding more textures

    imageObj.src = "img/paint/paint" + Math.floor((Math.random() * num)) + ".jpg";
};

// opens the info div and black
function openInfo() {
	console.log("open");
	$('#allBlackDiv').css('visibility', 'visible');
	$('#aboutDiv').css('visibility', 'visible');
}

// closes the info div and black
function closeInfo() {
	console.log("close");
	$('#allBlackDiv').css('visibility', 'hidden');
	$('#aboutDiv').css('visibility', 'hidden');
}

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
