// generate polygons!  And possibly store them here?
var polygons = [];

// takes an array of coordinates, representing a polygon
// last point should NOT be repeat of first point.
// n is the number of times to recurse
function crackle(polygon, n) {
	var points = polygon["points"];

	// base case?
	if (n == 0 || points.length < 4) {

		// store polygon properly and return
		var poly = {};
		var poly_pts = {};
		for (var i = 0; i < points.length; i++) {
			poly_pts.push(points[i]);
		}
		poly["points"] = poly_pts;
		polygons.push(poly);
		return;
	}

	// divide polygon and return
	var n = points.length;
	var mid = Math.floor(n/2);

	// divide into two "halves"
	// both polygons get first and mid point
	var poly1 = points.slice(0, mid + 1);
	var poly2 = points.slice(mid, n);
	poly2.push(points[0]); // add first pt

	// generate a crooked line between dividing points
	// TEST ME PLEASE
	var crookedPoints = crookedLine(points[0], points[mid]);
	poly1.concat(crookedPoints);
	crookedPoints.reverse();
	poly2.concat(crookedPoints);

	crackle(poly1, n - 1);
	crackle(poly2, n - 1);
	return;
};


// generate a crooked, segmented line from pt1 to pt2
// return an array of points 
function crookedLine(pt1, pt2) {
	var x1 = pt1["x"];
	var y1 = pt1["y"];
	var x2 = pt2["x"];
	var y2 = pt2["y"];
	var dev = 20; // deviation from center line

	var Dx = Math.abs(x2 - x1);
	var Dy = Math.abs(y2 - y1);
	var theta = Math.atan(Dy/Dx);

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
	return crookedPoints;
};

// finds points along the line, every 'step' pixels.
// return an array of points.
// DO NOT include pt1 and pt2 in the returned array.
function primePoints(x1, y1, x2, y2) {
	var step = 40;
	var t = 0;
	var primes = [];

	var Dx = Math.abs(x2 - x1);
	var Dy = Math.abs(y2 - y1);
	var lineLength = distanceFormula(x1, y1, x2, y2);
	var theta = Math.atan(Dy/Dx);

	var prev_x = x1;
	var prev_y = y1;

	// find a point every 'step' pixels
	while ((t + step) < lineLength) {

		// find new coordiantes
		var new_x = prev_x + (step * Math.cos(theta));
		var new_y = prev_y + (step * Math.sin(theta));
		var new_pt = {};

		// store new point
		new_pt = {};
		new_pt["x"] = new_x;
		new_pt["y"] = new_y;
		primes.push(new_pt);

		// reset for next iteration
		prev_x = new_x;
		prev_y = new_y;
	}
	return primes;
};

// distance formula.
function distanceFormula(x1, y1, x2, y2) {
	var Dx = Math.abs(x2 - x1);
	var Dy = Math.abs(y2 - y1);
	return Math.sqrt((Dx * Dx) + (Dy * Dy));
};