
// remove the no javascript warning
document.getElementById("warning").style.display = "none";
// constants
var FRIENDLY = 15;

var COL_NON = 0;
var COL_MAN = 1;
var COL_NEG = 2;

var FILL_MAN = '#ff0';
var FILL_NEG = '#660';
var FILL_PRE = '#110'; // preview column color

var PI = Math.PI;
var NCOLS = 22;
var DTHETA = 2*PI/NCOLS;
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

var Pattern = function(src,sheet,seq) {
    if (sheet == undefined) {
	this.sheet = [1,1];
    } else {
	this.sheet = sheet;
    }
    if (seq == undefined) {
	this.seq = [];
	for (var i = 0 ; i < this.sheet[0] ; i++) {
	    this.seq[i] = i;
	}
    } else {
	this.seq = seq;
    }
    this.seqnum = 0;
    this.ready = false;
    this.image = new Image();
    this.image.parent = this;
    this.image.onload = function () {
	this.parent.ready = true;
	this.parent.sw = this.width/this.parent.sheet[0];
	this.parent.sh = this.height/this.parent.sheet[1];
	this.parent.makePattern();
    };
    this.pats = [];
    this.image.src = src;
};
Pattern.prototype.animate = function () {
    now = Date.now();
    if (now - this.last_update > 400) {
	this.seqnum = realMod(this.seqnum + 1, this.seq.length);
	this.pat = this.pats[this.seq[this.seqnum]];
	this.last_update = now;
    }
};
Pattern.prototype.makePattern = function () {
    this.last_update = Date.now();
    // all patterns are tiled 1 by n rows by cols
    for (var k = 0 ; k < this.sheet[0] ; k++) {
	var pcvs = document.createElement('canvas');
	pcvs.width = this.image.height*2;
	pcvs.height = this.image.height*2;
	var pctx = pcvs.getContext('2d');
	pctx.fillStyle = FILL_MAN;
	pctx.fillRect(0,0,pcvs.width,pcvs.height);
	var pos = [[0,0],[pcvs.width,0],[pcvs.width,pcvs.height],[0,pcvs.height]];
	// splay the rays around in a pattern centered at the origin
	for (var i = 0 ; i < 4 ; i++) {
	    pctx.save();
	    pctx.translate(pos[i][0],pos[i][1]);
	    for (var j = 0 ; j < NCOLS ; j++) {
		pctx.rotate(DTHETA);
		pctx.drawImage(this.image,k*this.sw,0,this.sw,this.sh,-this.sw/2,-this.sh,
			       this.sw, this.sh);
	    }
	    pctx.restore();
	}
	this.pats[k] = ctx.createPattern(pcvs,'repeat');
    }
    this.pat = this.pats[0];
};

var Board = function () {
    this.ncols = NCOLS;
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
		this.draw_box(i,j,lvl.manpat.pat);
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
    ctx.save();
    ctx.translate(cvs.ox,cvs.oy);
    ctx.beginPath();
    ctx.arc(0,0,this.r(i)*cvs.width/2,this.t(j),this.t(j+1));
    ctx.lineTo(Math.round(this.r(i+1)*cvs.width/2*Math.cos(this.t(j+1))),
	       Math.round(this.r(i+1)*cvs.width/2*Math.sin(this.t(j+1))));
    ctx.arc(0,0,this.r(i+1)*cvs.width/2,(j+1)*this.dtheta,this.t(j), true);    
    ctx.lineTo(Math.round(this.r(i)*cvs.width/2*Math.cos(this.t(j))),
	       Math.round(this.r(i)*cvs.width/2*Math.sin(this.t(j))));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
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
	var color = lvl.manpat.pat;
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
	up:false,
	dn:false,
	rt:false,
	lt:false
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
    dirs = ['up','dn','rt','lt'];
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
    this.manpat = pats.rays_sun;
};
Level.prototype.render = function() {
    ctx.drawImage(imgs.blackbox.image,0,0);

    ctx.save();
    ctx.translate(cvs.ox,cvs.oy);
    ctx.rotate(this.rot);
    ctx.drawImage(imgs.sun.image,-imgs.sun.image.width/2,-imgs.sun.image.height/2);
    ctx.restore();

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

var Game = function () {
    this.state = this.loading;
    setTimeout(this.callback,FRIENDLY);
};
Game.prototype.callback = function () {
    game.state.call(game);
    setTimeout(game.callback,FRIENDLY);
};
Game.prototype.loading = function () {
    var newimgs = [['blackbox'],['sun']];
    var newpats = [['rays_sun',[2,1]]];
    var iloaded = this.startloading(newimgs,Sprite,imgs);
    var ploaded = this.startloading(newpats,Pattern,pats);
    if (iloaded == newimgs.length && ploaded == newpats.length) {
	lvl = new Level();
	this.state = this.waitcmd;
    }
};
Game.prototype.startloading = function (these,constructor,where) {
    var loaded = 0;
    for (var i in these) {
	if (! (these[i][0] in where)) {
	    where[these[i][0]] = new constructor('images/'+these[i][0]+'.png',these[i][1]);
	} else if (where[these[i][0]].ready) {
	    loaded++;
	}
    }
    return loaded;
};
Game.prototype.waitcmd = function () {
    input.parsedirs();
    if (input.dirs.lt) {
	lvl.rotate(-1);
    }
    if (input.dirs.rt) {
	lvl.rotate(1);
    }
    if (input.dirs.dn) {
	if (! board.place(piece)) {
	    console.log('game over');
	}
	piece.fall();
	board.jettison();
	board.feast();
	piece = new ActivePiece(lvl.color);
    }
    if (input.dirs.up) {
	piece.rotate();
    }
    if (KEY.sp in input.keyEvent || KEY.en in input.keyEvent) {
	lvl.switch_color();
	delete input.keyEvent[KEY.sp];
	delete input.keyEvent[KEY.en];
    }
    
    for (var p in pats) {
	pats[p].animate();
    }

    lvl.render();
};

imgs = {};
pats = {};
input = new Input();
lvl = {};

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

game = new Game();
