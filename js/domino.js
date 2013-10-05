// contains the functionality for crumbling nearby polygons
// in a domino effect.

// when called, finds an unscraped polygon sharing a border point
// with the given polygon. "polygon" arg is actually an index.
function crumble(polygons, polygon) {
    var access_pts = polygons[polygon]["points"];

    for (var pt = 0; pt < access_pts.length; pt++) {
        for (var pg = 0; pg < polygons.length; pg++) {
            // if the polygon has been scraped or is the
            // given polygon, continue.
            if (polygons[pg]["scraped"]) continue;
            if (pg == polygon) continue;

            // find a matching point, return first possibility.
            var poly_pts = polygons[pg];
            for (var ppt = 0; ppt < poly_pts.length; ppt++) {
                if (access_pts[pt]["x"] == poly_pts[ppt]["x"] &&
                    access_pts[pt]["y"] == poly_pts[ppt]["y"]) {
                    // note that this returns an index
                    // not a polygon object.
                    console.log( "polygon index " + pg );
                    return pg;
                }
            }
        }
    } 
}

