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
	var crooked_line = crookedLine(points[0], points[mid]);
	crackle(poly1, n - 1);
	crackle(poly2, n - 1);
	return;
};

function crooked_line(pt1, pt2) {
	var x1 = pt1["x"];
	var y1 = pt1["y"];
	var x2 = pt2["x"];
	var y2 = pt2["y"];

	var Dx = Math.abs(x2 - x1);
	var Dy = Math.abs(y2 - y1);

	// find the prime points
	// for each prime point
	// 

}