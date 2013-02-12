
// remove the no javascript warning
document.getElementById("warning").style.display = "none";
// constants
var COL_NON = 0;
var COL_MAN = 1;
var COL_NEG = 2;
var FILL_MAN = '#ff0';
var FILL_NEG = '#660';
var FILL_PRE = '#110'; // preview column color
var PI = Math.PI;
var PKEYS = { // keys to prevent default event on
    38:'up',40:'dn', 39:'rt', 37:'lt',32:'sp'
};
var KEY = {
    'up':38,
    'dn':40,
    'rt':39,
    'lt':37,
    'sp':32,
    'o':79,
    'm':77,
    'q':81,
    'en':13
};
var DIR_UP = 0;
var DIR_LT = 1;
var DIR_RT = 2;
var DIR_DN = 3;

// create the canvas
var cvs = document.getElementById("sun");
var ctx = cvs.getContext("2d");
cvs.width = 800;
cvs.height = 600;
cvs.ox = cvs.width/2;
cvs.oy = cvs.height*.9;


// utilities
var randN = function (n) { // 0 ... n-1 random num
    return Math.floor(Math.random()*n);
};
var realMod = function(n,m) {
    n = n % m;
    if (n < 0) {
	n += m;
    }
    return n;
};
// classes
var Sprite = function(src) {
    this.ready = false;
    this.image = new Image();
    this.image.parent = this;
    this.image.onload = function() {
	this.parent.ready = true;
    };
    this.image.src = src;
};

var Board = function () {
    this.ncols = 22;
    this.nrows = 15;
    this.rstart = .1; // fraction of outer radius to start board
    this.dtheta = 2*PI/this.ncols;
    this.rs = [];
    this.ts = [];
    for (var i = 0, r=this.rstart ; i < this.nrows+1 ; i++, r += r*this.dtheta*0.73) {
	this.rs.push(r);
    }
    for (var j = 0, theta = 0.0 ; j < this.ncols ; j++, theta += this.dtheta) {
	this.ts.push(theta);
    }
    for (var i = 0 ; i < this.nrows ; i++) {
	this[i] = [];
	for (var j = 0 ; j < this.ncols ; j++) {
	    this[i][j] = 0;
	}
    }
};

Board.prototype.show = function () {
    for (var i = this.nrows-1 ; i >= 0 ; i--) {
	line = '';
	for (var j = 0 ; j < this.ncols ; j++) {
	    if(this[i][j]) {
		line = line + this[i][j];
	    } else {
		line = line + '.';
	    }
	}
	console.log(line);
    }
};
Board.prototype.place = function (piece) {
    if (this.check(piece)) {
	this.setto(piece,piece.color);
	return true;
    } else {
	return false;
    }
};
Board.prototype.setto = function (piece,val) {
    var offsets = piece.get_offsets();

    for (var i = 0 ; i < offsets.length ; i++) {
	ni = piece.i + offsets[i][0];
	nj = realMod(piece.j + offsets[i][1],this.ncols);
	board[ni][nj] = val;
    }
};
Board.prototype.check = function (piece) {
    var offsets = piece.get_offsets();

    for (var i = 0 ; i < offsets.length ; i++) {
	ni = piece.i + offsets[i][0];
	nj = realMod(piece.j + offsets[i][1],this.ncols);
	if (ni < 0 || ni >= this.nrows || (board[ni][nj] == piece.color)) {
	    return false;
	}
    }
    return true;
};
Board.prototype.render = function () {
    this.drawgrid();
    for (var i = 0 ; i < this.nrows ; i++) {
	for (var j = 0 ; j < this.ncols ; j++) {
	    if (board[i][j] == COL_MAN) {
		this.draw_box(i,j,pat);
	    } else if (board[i][j] == COL_NEG) {
		this.draw_box(i,j,FILL_NEG);
	    }

	}
    }
};
Board.prototype.drawgrid = function () {
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = '#222';

    for (var r in this.rs) {
	this.draw_arc(this.rs[r],0,2*PI);
    }
    for (var t in this.ts) {
	this.draw_rad(this.rs[0],this.rs[this.rs.length-1],this.ts[t]);
    }
};
Board.prototype.draw_arc = function (r,tbegin,tend) {
    ctx.beginPath();
    ctx.arc(cvs.ox, cvs.oy, r*cvs.width/2, tbegin, tend);
    ctx.closePath();
    ctx.stroke();
};
Board.prototype.draw_rad = function (r1,r2,t) {
    ctx.beginPath();
    ctx.moveTo(Math.round(cvs.ox + r1*cvs.width/2*Math.cos(t)),
	       Math.round(cvs.oy + r1*cvs.width/2*Math.sin(t)));
    ctx.lineTo(Math.round(cvs.ox + r2*cvs.width/2*Math.cos(t)),
	       Math.round(cvs.oy + r2*cvs.width/2*Math.sin(t)));
    ctx.closePath();
    ctx.stroke();
};
Board.prototype.r = function (i) {
    var ipart = Math.floor(i), fpart = i-ipart;
    if (ipart < 0) {
	ipart = 0;
    }
    if (ipart >= this.rs.length-1) {
	return this.rs[ipart];
    }
    return this.rs[ipart]*(1-fpart) + this.rs[ipart+1]*fpart;
};
Board.prototype.t = function (j) {
    return j*this.dtheta;
};
Board.prototype.draw_box = function (i,j,fill) {
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = '#000';
    if (fill == undefined) {
	ctx.fillStyle = FILL_MAN;
    } else {
	ctx.fillStyle = fill;
    }
    ctx.beginPath();
    ctx.arc(cvs.ox,cvs.oy,this.r(i)*cvs.width/2,this.t(j),this.t(j+1));
    ctx.lineTo(Math.round(cvs.ox + this.r(i+1)*cvs.width/2*Math.cos(this.t(j+1))),
	       Math.round(cvs.oy + this.r(i+1)*cvs.width/2*Math.sin(this.t(j+1))));
    ctx.arc(cvs.ox,cvs.oy,this.r(i+1)*cvs.width/2,(j+1)*this.dtheta,this.t(j), true);    
    ctx.lineTo(Math.round(cvs.ox + this.r(i)*cvs.width/2*Math.cos(this.t(j))),
	       Math.round(cvs.oy + this.r(i)*cvs.width/2*Math.sin(this.t(j))));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};
Board.prototype.rotate = function (off) {
    newboard = [];
    for (var i = 0 ; i < board.nrows ; i++) {
	newboard[i] = [];
	for (var j = 0 ; j < board.ncols ; j++) {
	    newboard[i][j] = board[i][realMod(j+off,board.ncols)];
	}
    }
    for (var i = 0 ; i < board.nrows ; i++) {
	for (var j = 0 ; j < board.ncols ; j++) {
	    board[i][j] = newboard[i][j];
	}
    }
};
Board.prototype.feast = function () {
    // remove bottom rows
    var delrows = 0;
    for (var i = 0 ; i < board.nrows ; i++) {
	for (var j = 0 ; j < board.ncols && board[i][j] == COL_MAN; j++);
	if (j == board.ncols) {
	    delrows++;
	} else {
	    break;
	}
    }
    for (var i = 0 ; i < board.nrows-delrows ; i++) {
	for (var j = 0 ; j < board.ncols ; j++) {
	    board[i][j] = board[i+delrows][j];
	}
    }
};

Board.prototype.jettison = function () {
    // all negatives with nothing above them are jettisoned off
    var foundcorona = false;
    for (var j = 0 ; j < board.ncols ; j++) {
	foundcorona = false;
	for (var i = board.nrows-1 ; i >= 0 ; i--) {
	    if (board[i][j] == COL_MAN) {
		foundcorona = true;
	    } else if (board[i][j] == COL_NEG && foundcorona == false) {
		board[i][j] = COL_NON;
	    }
	}
    }
};

var ActivePiece = function (color) {
    this.i = board.nrows-3; // one below the last
    this.j = -Math.round(board.ncols/4);
    this.type = randN(ActivePiece.prototype.pics.length);
    this.rot = 0;
    this.color = color;
    if (board.check(this)) {
	this.immobile = false;
    } else {
	this.immobile = true;
    }
};
ActivePiece.prototype.fall = function () {
    board.setto(this,COL_NON);
    while (board.check(piece)) {
	this.i = this.i-1;
    }
    this.i = this.i+1;
    board.setto(this,this.color);
};
ActivePiece.prototype.draw_column = function () {
    // draw preview column
    var offsets = this.get_offsets();

    var thetas = offsets.map(function (x) {return x[1];});
    var ltheta = Math.min.apply(null,thetas), utheta = Math.max.apply(null,thetas);
    
    ctx.fillStyle = FILL_PRE;
    ctx.beginPath();
    ctx.arc(cvs.ox,cvs.oy,board.r(0)*cvs.width/2,board.t(this.j+ltheta),board.t(this.j+utheta+1));
    ctx.lineTo(Math.round(cvs.ox + board.r(board.nrows-1)*cvs.width/2*Math.cos(board.t(this.j+utheta+1))),
	       Math.round(cvs.oy + board.r(board.nrows-1)*cvs.width/2*Math.sin(board.t(this.j+utheta+1))));
    ctx.arc(cvs.ox,cvs.oy,board.r(board.nrows-1)*cvs.width/2,board.t(this.j+1),board.t(this.j+ltheta), true);    
    ctx.lineTo(Math.round(cvs.ox + board.r(0)*cvs.width/2*Math.cos(board.t(this.j+ltheta))),
	       Math.round(cvs.oy + board.r(0)*cvs.width/2*Math.sin(board.t(this.j+ltheta))));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};
ActivePiece.prototype.render = function () {
    if (this.color == COL_MAN) {
	var color = pat;
    } else {
	var color = FILL_NEG;
    }
    this.draw_piece(this.i, this.j, color);
};
ActivePiece.prototype.rotate = function () {
    this.rot = this.rot -= PI/2;
    if (Math.abs(this.rot - 2*PI) < 1e-3) {
	this.rot = 0;
    }
};
ActivePiece.prototype.draw_piece = function (r,t,color) {
    var offsets = piece.get_offsets();
    for (var i in offsets) {
	var noffr = offsets[i][0], nofft = offsets[i][1];
	board.draw_box(r+noffr,t+nofft,color);
    }
};
ActivePiece.prototype.get_offsets = function () {
    var out = [];
    for (var i = 0 ; i < this.types[this.type].length ; i++) {
	var oi = this.types[this.type][i][0];
	var oj = this.types[this.type][i][1];
	var noi = Math.round(Math.cos(this.rot))*oi + Math.round(Math.sin(this.rot))*oj;
	var noj = -Math.round(Math.sin(this.rot))*oi + Math.round(Math.cos(this.rot))*oj;
	out.push([Math.round(noi),Math.round(noj)]);
    }
    return out;
};

ActivePiece.buildtypes = function () {
    this.prototype.types = [];
    for (var i = 0 ; i < this.prototype.pics.length ; i++) {
	var thisone = [];
	for (j = 0 ; j < 3 ; j++) {
	    for (k = 0 ; k < 3 ; k++) {
		if (this.prototype.pics[i][j][k] == '*') {
		    thisone.push([j-1,k-1]);
		}
	    }
	}
	if (thisone.length > 0) {
	    this.prototype.types.push(thisone);
	}
    }
};

ActivePiece.prototype.pics = [
    ['.*.',
     '.*.',
     '***'],

    ['*.*',
     '***',
     '.*.'],

    ['.*.',
     '.*.',
     '.*.'],

    ['.*.',
     '***',
     '.*.'],

    ['***',
     '*.*',
     '*.*'],
];


var Input = function () {
    this.keyEvent = {};
    this.dirs = {
	DIR_UP:false,
	DIR_DN:false,
	DIR_RT:false,
	DIR_LT:false
    };
};
Input.prototype.parsedirs = function () {
    // block confusing combinations of keys
    if (KEY.up in this.keyEvent && KEY.dn in this.keyEvent) {
	delete this.keyEvent[KEY.up];
	delete this.keyEvent[KEY.dn];
    }
    if (KEY.rt in this.keyEvent && KEY.lt in this.keyEvent) {
	delete this.keyEvent[KEY.rt];
	delete this.keyEvent[KEY.lt];
    }
    keys = [KEY.up, KEY.dn, KEY.rt, KEY.lt];
    dirs = [DIR_UP, DIR_DN, DIR_RT, DIR_LT];
    for (var i in keys) {
	if (keys[i] in this.keyEvent) {
	    delete this.keyEvent[keys[i]];
	    this.dirs[dirs[i]] = true;
	} else {
	    this.dirs[dirs[i]] = false;
	}
    }
};

var Level = function () {
    board = new Board();
    ActivePiece.buildtypes();
    piece = new ActivePiece(COL_MAN);
    this.color = COL_MAN;
    this.rot = 0;
};
Level.prototype.render = function() {
    if(bgs[0].ready) {
	ctx.drawImage(bgs[0].image,0,0);
    }
    if(sprites[0].ready) {
	ctx.save();
	ctx.translate(cvs.ox,cvs.oy);
	ctx.rotate(this.rot);
	ctx.drawImage(sprites[0].image,-sprites[0].image.width/2,-sprites[0].image.height/2);
	ctx.restore();
    }
    piece.draw_column();
    board.render();
    piece.render();
};
Level.prototype.switch_color = function () {
    if (this.color == COL_MAN) {
	this.color = COL_NEG;
	piece.color = COL_NEG;
    } else {
	this.color = COL_MAN;
	piece.color = COL_MAN;
    }
};
Level.prototype.rotate = function (rot) {
    board.rotate(rot);
    this.rot -= rot*board.dtheta;
};

bgs = [new Sprite('images/blackbox.png'), new Sprite('images/corona.png')];
sprites = [new Sprite('images/sun.png')];
pat = COL_MAN;
input = new Input();

addEventListener("keydown", function (e) {
    input.keyEvent[e.keyCode] = true;
    if (e.keyCode in PKEYS) {
	e.preventDefault();
    } // try to prevent scrolling
}, false);

addEventListener("keyup", function (e) {
    if (e.keyCode in PKEYS) {
	e.preventDefault();
    }
}, false);

var lvl = new Level();

fallwait = function () {
    input.parsedirs();
    if (pat == COL_MAN && bgs[1].ready) {
	pat = ctx.createPattern(bgs[1].image,"no-repeat");
    }
    if (input.dirs[DIR_LT]) {
	lvl.rotate(-1);
    }
    if (input.dirs[DIR_RT]) {
	lvl.rotate(1);
    }
    if (input.dirs[DIR_DN]) {
	if (! board.place(piece)) {
	    console.log('game over');
	}
	piece.fall();
	board.jettison();
	board.feast();
	piece = new ActivePiece(lvl.color);
    }
    if (input.dirs[DIR_UP]) {
	piece.rotate();
    }
    if (KEY.sp in input.keyEvent || KEY.en in input.keyEvent) {
	lvl.switch_color();
	delete input.keyEvent[KEY.sp];
	delete input.keyEvent[KEY.en];
    }
    
    lvl.render();
    setTimeout(fallwait,25);
};

last_update = Date.now();
setTimeout(fallwait,25);
