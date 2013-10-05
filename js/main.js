// some global variables, for ease

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

/* Given the number of squares to make and the with and height of the container
   generates a list of polygons according to polygon spec
 */
var squares = function(numSquares, rows, width, height) {
    var sperrow = Math.ceil(numSquares / rows); // 6 squares per row
    var squarew = width / sperrow; // 116.66667 
    var squareh = height / rows; // 31.25
    
    polygons = [];
    for (var i = 0; i < numSquares; i++) {
        var points = [];
        var whichrow = (i - i%sperrow) / sperrow;
        points.push({x: (i%sperrow) * squarew, y: whichrow*squareh}); // top left 
        points.push({x: ((i%sperrow + 1)*squarew), y: whichrow*squareh}); // top right
        points.push({x: ((i%sperrow + 1)*squarew), y: (whichrow+1)*squareh});// bottom right
        points.push({x: (i%sperrow) * squarew, y: (whichrow+1)*squareh}); // bottom left
        points.push({x: (i%sperrow) * squarew, y: whichrow*squareh}); // top left 

        polygons.push({points: points});
    }

    console.log(polygons);
    return polygons;
};

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
	    h = document.height;
		w = background.width;
		background.height = h;
		middleground.height = h;
		foreground.height = h;
		gradient.height = h;
		cursor.height = h;

		background_ctx = background.getContext("2d");
		middleground_ctx = middleground.getContext("2d");
		foreground_ctx = foreground.getContext("2d");
		cursor_ctx = cursor.getContext("2d");
		var gradient_ctx = gradient.getContext("2d");	

        // load cursor image asset.
	    imageObj = new Image();
	    imageObj.src = "http://i.imgur.com/B8pfNzU.png";

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

        // set cursor
		$('#cursor').mousemove( function(e) {
		    drawScraper(e);
		});
};

function drawScraper(e) {
	cursor_ctx.clearRect(0, 0, w, h);
	console.log("move");
    console.log(imageObj.src + "");
    cursor_ctx.drawImage(imageObj, e.pageX - cvs_left, e.pageY - cvs_top);
};

function fillMiddleground(ctx) {
	var imageObj = new Image();
	
	imageObj.onload = function() {
        //ctx.drawImage(imageObj, 0, 0);
		var pattern = ctx.createPattern(imageObj, "repeat");
		ctx.fillStyle = pattern;
		
		// fill all the polygons!
		for (var i = 0; i < polygons.length; i++) {
			drawPolygon(polygons[i], ctx);
			ctx.fill();
		}
	};
	imageObj.src = "http://farm4.staticflickr.com/3333/3333171389_35b840e742_o.jpg";
	//imageObj.src = "http://farm3.staticflickr.com/2176/2394924890_02a6b830a7_b.jpg";

};
