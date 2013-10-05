var game_over;

function win(ctx, cvs_w, cvs_h, cvs_left, cvs_top) {
    console.log("WINNER");
    game_over = true;    
    var box_w = 500;
    var box_h = 200;
    roundedRect(ctx, (cvs_left + cvs_w/2 - box_w/2), (cvs_top + cvs_h/2 - box_h/2),
                box_w, box_h, 25);
}

// from mozilla developer tutorial "drawing shapes with canvas"
// https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Canvas_tutorial/Drawing_shapes
function roundedRect(ctx, x, y, width, height, radius){
  ctx.beginPath();
  ctx.moveTo(x,y+radius);
  ctx.lineTo(x,y+height-radius);
  ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
  ctx.lineTo(x+width-radius,y+height);
  ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
  ctx.lineTo(x+width,y+radius);
  ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
  ctx.lineTo(x+radius,y);
  ctx.quadraticCurveTo(x,y,x,y+radius);
  ctx.stroke();
}

