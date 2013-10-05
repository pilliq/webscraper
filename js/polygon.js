// generate polygons!  And possibly store them here?
var polygons = [];

// draw a polygon
function drawPoly(polygon) {
	var points = polygon["points"];

	var cvs = document.getElementById("canvas");
	var ctx = cvs.getContext("2d");
	
	var r = Math.floor(Math.random()*255);
	var g = Math.floor(Math.random()*255);
	var b = Math.floor(Math.random()*255);
	ctx.lineWidth = 5;
	ctx.strokeStyle = 'rgba('+r+','+g+','+b+', 0.9)';
	ctx.beginPath();
	ctx.moveTo(points[0]["x"], points[0]["y"]);
	for (var i = 0; i < points.length; i++) {
		ctx.lineTo(points[i]["x"], points[i]["y"]);
		ctx.moveTo(points[i]["x"], points[i]["y"]);
	}
	ctx.lineTo(points[0]["x"], points[0]["y"]);
	ctx.stroke();
};

// a stupid test function
function testPolygons() {
	var poly = {};
	var pts = [];

	var w = 600;
	var h = 400;

	// bottom points
	for (var i = 0; i < w; i += 10) {
		pts.push({"x" : i, "y" : 0});
	}

	// right side points
	for (var i = 0; i < h; i += 10) {
		pts.push({"x" : w, "y" : i});
	}

	// top points
	for (var i = w; i > 0; i -= 10) {
		pts.push({"x" : i, "y" : h});
	}

	// left side points
	for (var i = h; i > 0; i -= 10) {
		pts.push({"x" : 0, "y" : i});
	}

	poly["points"] = pts;
	crackle(poly, 4); 
}

// takes an array of coordinates, representing a polygon
// last point should NOT be repeat of first point.
// n is the number of times to recurse
function crackle(polygon, reps) {
	var points = polygon["points"];

	console.log(reps);
	console.log(points);

	// base case?
	if (reps == 0 || points.length < 4) {

		// store polygon properly and return
		var poly = {};
		var poly_pts = [];
		for (var i = 0; i < points.length; i++) {
			poly_pts.push(points[i]);
		}
		poly["points"] = poly_pts;
		polygons.push(poly);

		// draw here for testing
		drawPoly(poly);

		return;
	}

	// divide polygon and return
	var n = points.length;
	var mid = Math.floor(n/2);

	// divide into two "halves"
	// both polygons get first and mid point
	var poly1_pts = points.slice(0, mid + 1);
	var poly2_pts = points.slice(mid, n);
	poly2_pts.push(points[0]); // add first pt

	// generate a crooked line between dividing points
	var crookedPoints = crookedLine(points[0], points[mid]);
	console.log(crookedPoints.length);
	poly2_pts = poly2_pts.concat(crookedPoints);
	crookedPoints.reverse();
	poly1_pts = poly1_pts.concat(crookedPoints);
	
	// IMPORTANT: must 'cycle' the points around some
	// so same first point doesn't get picked every time
	console.log("cycling:");
	console.log(poly1_pts);
	poly1_pts = cycleArray(poly1_pts);
	poly2_pts = cycleArray(poly2_pts);
	console.log(poly1_pts);

	var poly1 = {};
	var poly2 = {};
	poly1["points"] = poly1_pts;
	poly2["points"] = poly2_pts;

	crackle(poly1, reps - 1);
	crackle(poly2, reps - 1);
	return;
};

// generate a crooked, segmented line from pt1 to pt2
// return an array of points 
function crookedLine(pt1, pt2) {
	var x1 = pt1["x"];
	var y1 = pt1["y"];
	var x2 = pt2["x"];
	var y2 = pt2["y"];
	var dev = 50; // deviation from center line

	var Delta_x = Math.abs(x2 - x1);
	var Delta_y = Math.abs(y2 - y1);
	var theta = Math.atan(Delta_y/Delta_x);

	// make sure to go the right direction!
	// find the prime points
	var primes = primePoints(x1, y1, x2, y2);
	var crookedPoints = [];

	// adjust for backwards lines
	var sign_x = 1;
	var sign_y = 1;
	if (x1 > x2) sign_x = -1;
	if (y1 > y2) sign_y = -1;

	// for each prime point
	for (var i = 0; i < primes.length; i++) {
		var x_prime = primes[i]["x"];
		var y_prime = primes[i]["y"];

		var d = Math.random()*dev;
		var dx = sign_x * d * Math.sin(theta);
		var dy = sign_y * d * Math.cos(theta);

		var new_x = x_prime + dx;
		var new_y = y_prime + dy;

		// store the new point
		var new_pt = {};
		new_pt["x"] = new_x;
		new_pt["y"] = new_y;
		crookedPoints.push(new_pt);
	}
	console.log("crooked points:");
	console.log(crookedPoints);
	return crookedPoints;
};

function cycleArray(array) {
	new_array = [];
	var n = Math.floor(Math.random()*array.length);

	for (var i = n; i < array.length; i++) {
		new_array.push(array[i]);
	}

	for (var i = 0; i < n; i++) {
		new_array.push(array[i]);
	}
	return new_array;
};

// finds points along the line, every 'step' pixels.
// return an array of points.
// DO NOT include pt1 and pt2 in the returned array.
function primePoints(x1, y1, x2, y2) {
	var step = 20;
	var t = step;
	var primes = [];

	var Delta_x = Math.abs(x2 - x1);
	var Delta_y = Math.abs(y2 - y1);
	var lineLength = distanceFormula(x1, y1, x2, y2);
	var theta = Math.atan(Delta_y/Delta_x);

	var prev_x = x1;
	var prev_y = y1;
	var dx = (step * Math.cos(theta));
	var dy = (step * Math.sin(theta));

	if (x1 > x2) dx = -dx;
	if (y1 > y2) dy = -dy;

	// find a point every 'step' pixels
	while ((t + step) < lineLength) {

		// find new coordiantes
		var new_x = prev_x + dx;
		var new_y = prev_y + dy;
		var new_pt = {};

		// store new point
		new_pt = {};
		new_pt["x"] = new_x;
		new_pt["y"] = new_y;
		primes.push(new_pt);

		// reset for next iteration
		prev_x = new_x;
		prev_y = new_y;
		t = t + step;
	}
	console.log("primes:");
	console.log(primes);
	return primes;
};

// distance formula.
function distanceFormula(x1, y1, x2, y2) {
	var Dx = Math.abs(x2 - x1);
	var Dy = Math.abs(y2 - y1);
	return Math.sqrt((Dx * Dx) + (Dy * Dy));
};