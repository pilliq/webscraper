var drawPolygon = function(polygon, context) {
    context.beginPath();

    context.moveTo(polygon.points[0].x, polygon.points[0].y);
    for (var i = 1; i < polygon.points.length; i++) {
        context.lineTo(polygon.points[i].x, polygon.points[i].y);
    }
    context.closePath();
};

/* Given the number of squares to make and the with and height of the container
   generates a list of polygons according to polygon spec
 */
var squares = function(numSquares, rows, width, height) {
    var sperrow = Math.ceil(numSquares / rows); // 6
    var squarew = width / sperrow; // 116.66667
    var squareh = height / rows; // 31.25
    
    polygons = [];
    for (var i = 0; i < numSquares; i++) {
        var points = [];
        points.push({x: i * squarew, y: (i%sperrow)*squareh}); // top left 
        points.push({x: (i*squarew)+squarew, y: (i%sperrow)*squareh}); // top right
        points.push({x: (i*squarew)+squarew, y: ((i%sperrow)*squareh)+squareh}); // bottom right
        points.push({x: i * squarew, y: (i%sperrow)+squareh}); // bottom left
        points.push({x: i * squarew, y: i % sperrow}); // top left 

        polygons.push({points: points});
    }

    console.log(polygons);
    return polygons;
};

$(document).ready(function() {
    var background = document.getElementById("background").getContext("2d");
    var middleground = document.getElementById("middleground").getContext("2d");
    //middleground.fillStyle = "#FF0000";
    //middleground.fillRect(10, 10, 150, 180);

    var polygons = squares(16, 3, 700, 500);
    console.log(polygons);

    var square = {points: [{x: 0, y: 0}, {x: 150, y: 0}, { x: 150, y: 180}, {x: 0, y: 180}, {x: 0, y:0}]};
    /* Draw a polygon */
    for (var i = 0; i < polygons.length; i++) {
        middleground.fillStyle = "#FF0000";
        drawPolygon(polygons[i], middleground);
        middleground.fill();
    }

});
