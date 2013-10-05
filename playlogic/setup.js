
var cvs;
var ctx;
var cvs_w;
var cvs_h;
var cvs_l;
var cvs_t;
var polys;

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
        //points.push({x: (i%sperrow) * squarew, y: whichrow*squareh}); // top left 

        polygons.push(new Polygon(points));
    }

    console.log(polygons);
    return polygons;
};

function Polygon(pointList) {
		this.alive = true;
		this.points = pointList;
}

var drawPolygon = function(polygon, context) {
		context.beginPath();

		console.log(polygon.points);

    context.moveTo(polygon.points[0].x, polygon.points[0].y);
    for (var i = 1; i < polygon.points.length; i++) {
        context.lineTo(polygon.points[i].x, polygon.points[i].y);
    }
    context.closePath();
};

function drawOne(p) {
		ctx.fillStyle="#FF0000";
		//console.log(rect);
		if (p.alive) {
				drawPolygon(p, ctx);
				ctx.fill();
		}
}

function redraw() {
		ctx.clearRect(0,0,cvs_w,cvs_h);
		for (var i = 0; i < polys.length; i++) {
				drawOne(polys[i]);
		}
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/math/is-point-in-poly [rev. #0]

function isPointInPoly(poly, pt){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

function horribleCollision(evt) {

		function inPoly(x,y,rect){
				return isPointInPoly(rect.points, {x:x, y:y});
		}

		mX = evt.pageX - cvs_l;
		mY = evt.pageY - cvs_t;
		console.log([mX,mY]);
		for (var i = 0; i < polys.length; i++) {
				if(polys[i].alive && inPoly(mX, mY, polys[i])){
						polys[i].alive = false;
				}
		}
		redraw();
}

function load_page() {

	// set up global contexts and stuff
	cvs = document.getElementById("canvas");
	ctx = cvs.getContext("2d");
	cvs_w = cvs.width; 
	cvs_h = cvs.height;
	cvs_l = $(cvs).offset().left;
	cvs_t = $(cvs).offset().top;
	console.log(cvs_t);
	testPolygons();
	polys = polygons;//squares(200, 10, 800, 600);
	$(cvs).mousemove(horribleCollision);

	redraw();

}

