
var cvs;
var ctx;
var cvs_w;
var cvs_h;
var cvs_l;
var cvs_t;
var rects;


function Rectangle(x1,y1,x2,y2){
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.alive = true;
}

function drawRect(rect) {
		ctx.fillStyle="#FF0000";
		console.log(rect);
		if (rect.alive) {
				ctx.fillRect(rect.x1, rect.y1, rect.x2-rect.x1, rect.y2-rect.y1);
		}
}

function redraw() {
		ctx.clearRect(0,0,cvs_w,cvs_h);
		for (var i = 0; i < rects.length; i++) {
				drawRect(rects[i]);
		}
}

function horribleCollision(evt) {

		function inRect(x,y,rect){
				return ((x <= rect.x2 && x >= rect.x1) && (y >= rect.y1 && y <= rect.y2))
		}

		mX = evt.pageX - cvs_l;
		mY = evt.pageY - cvs_t;
		console.log([mX,mY]);
		for (var i = 0; i < rects.length; i++) {
				if(inRect(mX, mY, rects[i])){
						rects[i].alive = false;
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
	rects = [new Rectangle(0,0,25,25),
				   new Rectangle(500,400,700,550)];
  
	ctx.fillStyle="#FF0000";

	$(cvs).mousemove(horribleCollision);

	redraw();

}

