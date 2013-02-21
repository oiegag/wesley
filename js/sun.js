// remove the no javascript warning
document.getElementById("warning").style.display = "none";
// constants
var FRIENDLY = 15;

var COL_NON = 0;
var COL_COR = 1;
var COL_NEG = 2;

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
var css2rgb = function (css) {
    rgb = [];
    if (css.length == 4) {
	for (var i = 0 ; i < 3 ; i++) {
	    rgb.push(css[i+1]+css[i+1]);
	}
    } else {
	for (var i = 0 ; i < 3 ; i++) {
	    rgb.push(css.slice(1+2*i,3+2*i));
	}
    }
    for (var i = 0 ; i < 3 ; i++) {
	rgb[i] = parseInt(rgb[i],16);
    }
    return rgb;
};
var rgb2css = function (rgb) {
    var css = '#';
    for (var i = 0 ; i < 3 ; i++) {
	var val = rgb[i].toString(16);
	if (val.length == 1) {
	    css = css + '0';
	}
	css = css + val;
    }
    return css;
};

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
var repeatN = function (m,n) { // m n times
    var out = [];
    for (var i = 0 ; i < n ; i++) {
	out[i] = m;
    }
    return out;
}

// classes
var Sprite = function(src,origin,sheet) {
    // assume a vertical sprite sheet
    if (origin == undefined) {
	origin = [0,0];
    }
    if (sheet == undefined) {
	sheet = [1,1];
    }
    this.sheet = sheet;
    this.ready = false;
    this.image = new Image();
    this.image.parent = this;
    this.seq = [0];
    this.seqnum = 0;
    this.anispeed = 1000;
    this.last_update = Date.now();
    this.spos = [0,0];
    this.ox = origin[0];
    this.oy = origin[1];
    this.rot = 0;
    this.tilt = 0; // a temporary rotation variable
    this.image.onload = function() {
	this.parent.ready = true;
	this.parent.sw = this.width/this.parent.sheet[0];
	this.parent.sh = this.height/this.parent.sheet[1];
    };
    this.image.src = src;
};
Sprite.prototype.render = function () {
    if (this.fillhook != undefined) {
	this.fillhook();
    }
    ctx.save();
    ctx.translate(this.ox, this.oy);
    ctx.rotate(this.rot+this.tilt*DTHETA);
    ctx.drawImage(this.image,this.spos[0]*this.sw,this.spos[1]*this.sh,this.sw,this.sh,-this.sw/2,-this.sh/2,
		   this.sw, this.sh);
    ctx.restore();
};
Sprite.prototype.animate = function () {
    var now = Date.now();
    
    if ((now - this.last_update) > this.anispeed) {
	this.seqnum = realMod(this.seqnum+1, this.seq.length);
	this.spos[1] = this.seq[this.seqnum];
	this.last_update = Date.now();
    }
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
    };
    this.pats = [];
    this.image.src = src;
};
Pattern.prototype.animate = function () {
    var now = Date.now();
    if (now - this.last_update > 400) {
	this.seqnum = realMod(this.seqnum + 1, this.seq.length);
	this.pat = this.pats[this.seq[this.seqnum]];
	this.last_update = now;
    }
};
Pattern.prototype.makePattern = function () {
    // the image will load early, but make the pattern after the level starts so we
    // can screw with the styling
    this.last_update = Date.now();
    // all patterns are tiled 1 by n rows by cols
    for (var k = 0 ; k < this.sheet[0] ; k++) {
	var pcvs = document.createElement('canvas');
	pcvs.width = this.image.height*2;
	pcvs.height = this.image.height*2;
	var pctx = pcvs.getContext('2d');
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

var Board = function (skiprows,initialstate) {
    this.ncols = NCOLS;
    this.nrows = 15;
    this.ox = cvs.ox;
    this.oy = cvs.oy;
    this.rstart = .1; // fraction of outer radius to start board
    this.dtheta = 2*PI/this.ncols;
    this.rs = [];
    this.ts = [];
    for (var i = 0, r=this.rstart ; i < this.nrows+1 ; i++, r += r*this.dtheta*0.73) {
	this.rs.push(r);
    }
    this.rs = this.rs.slice(skiprows);
    this.nrows -= skiprows;
    for (var j = 0, theta = 0.0 ; j < this.ncols ; j++, theta += this.dtheta) {
	this.ts.push(theta);
    }
    this.load_initial(initialstate);
};
Board.prototype.load_initial = function (initialstate) {
    // build an empty board
    for (var i = 0 ; i < this.nrows ; i++) {
	this[i] = [];
	for (var j = 0 ; j < this.ncols ; j++) {
	    this[i][j] = 0;
	}
    }
    if (initialstate == undefined) {
	return;
    }
    // then fill from the bottom up until you run out of stuff
    for (var i = 0 ; i < this.nrows ; i++) {
	if (initialstate[i] == undefined) {
	    break;
	}
	for (var j = 0 ; j < this.ncols ; j++) {
	    if (initialstate[i][j] == '.') {
		this[i][j] = COL_NON;
	    } else if (initialstate[i][j] == 'c') {
		this[i][j] = COL_COR;
	    } else if (initialstate[i][j] == 'n') {
		this[i][j] = COL_NEG;
	    }
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
Board.prototype.render = function (tilt) {
    if (tilt == undefined) {
	tilt = 0;
    }
    for (var i = 0 ; i < this.nrows ; i++) {
	for (var j = 0 ; j < this.ncols ; j++) {
	    if (board[i][j] == COL_COR) {
		this.draw_box(i,j,lvl.corona,tilt);
		this.draw_box(i,j,lvl.corona_pat.pat,tilt);
	    } else if (board[i][j] == COL_NEG) {
		this.draw_box(i,j,lvl.fire,tilt);
		this.draw_box(i,j,lvl.fire_pat.pat,tilt);
	    }

	}
    }
};
Board.prototype.drawgrid = function () {
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = lvl.grid;

    for (var r in this.rs) {
	this.draw_arc(this.rs[r],0,2*PI);
    }
    for (var t in this.ts) {
	this.draw_rad(this.rs[0],this.rs[this.rs.length-1],this.ts[t]);
    }
};
Board.prototype.draw_arc = function (r,tbegin,tend) {
    ctx.beginPath();
    ctx.arc(this.ox, this.oy, r*cvs.width/2, tbegin, tend);
    ctx.closePath();
    ctx.stroke();
};
Board.prototype.draw_rad = function (r1,r2,t) {
    ctx.beginPath();
    ctx.moveTo(Math.round(this.ox + r1*cvs.width/2*Math.cos(t)),
	       Math.round(this.oy + r1*cvs.width/2*Math.sin(t)));
    ctx.lineTo(Math.round(this.ox + r2*cvs.width/2*Math.cos(t)),
	       Math.round(this.oy + r2*cvs.width/2*Math.sin(t)));
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
Board.prototype.draw_box = function (i,j,fill,tilt) {
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = '#000';
    if (fill == undefined) {
	ctx.fillStyle = lvl.corona;
    } else {
	ctx.fillStyle = fill;
    }
    if (tilt == undefined) {
	tilt = 0;
    }

    ctx.save();
    ctx.translate(this.ox,this.oy);
    ctx.rotate(tilt);
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
	for (var j = 0 ; j < board.ncols && board[i][j] == COL_COR; j++);
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
    lvl.lines -= delrows;
};

Board.prototype.jettison = function () {
    // all negatives with nothing above them are jettisoned off
    var foundcorona = false;
    for (var j = 0 ; j < board.ncols ; j++) {
	foundcorona = false;
	for (var i = board.nrows-1 ; i >= 0 ; i--) {
	    if (board[i][j] == COL_COR) {
		foundcorona = true;
	    } else if (board[i][j] == COL_NEG && ! foundcorona) {
		board[i][j] = COL_NON;
	    } else if (board[i][j] == COL_NON && foundcorona) {
		board[i][j] = COL_NEG;
	    }
	}
    }
};

var ActivePiece = function (color,type) {
    this.i = board.nrows-3; // one below the last
    this.j = -Math.round(board.ncols/4);
    this.type = type;
    this.rot = 0;
    this.color = color;
};
ActivePiece.prototype.fall_howfar = function () {
    var orig = this.i, fellto = 0;
    while (board.check(piece)) {
	this.i = this.i-1;
    }
    fellto = this.i + 1;
    this.i = orig;
    return fellto;
};
ActivePiece.prototype.draw_preview = function () {
    // draw preview column
    var offsets = this.get_offsets();

    var lowest = {};
    for (var i = 0 ; i < offsets.length ; i++) {
	whatj = offsets[i][1];
	if (lowest[whatj] == undefined) {
	    lowest[whatj] = offsets[i][0];
	} else {
	    lowest[whatj] = Math.min(lowest[whatj],offsets[i][0]);
	}
    }

    for (var j in lowest) {
	this.draw_column(parseInt(j)+this.j, board.nrows-2+lowest[j]);
    }
};
ActivePiece.prototype.draw_column = function (j,ending) {
    ctx.fillStyle = lvl.preview;
    ctx.lineWidth = 0.05;
    ctx.strokeStyle = lvl.preview;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();

    ctx.arc(board.ox,board.oy,board.r(0)*cvs.width/2,board.t(j),board.t(j+1));
    ctx.lineTo(Math.round(board.ox + board.r(ending)*cvs.width/2*Math.cos(board.t(j+1))),
	       Math.round(board.oy + board.r(ending)*cvs.width/2*Math.sin(board.t(j+1))));
    ctx.arc(board.ox,board.oy,board.r(ending)*cvs.width/2,board.t(j+1),board.t(j), true);    
    ctx.lineTo(Math.round(board.ox + board.r(0)*cvs.width/2*Math.cos(board.t(j))),
	       Math.round(board.oy + board.r(0)*cvs.width/2*Math.sin(board.t(j))));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
};
ActivePiece.prototype.render = function (offset) {
    if (offset == undefined) {
	offset = 0;
    }
    if (this.color == COL_COR) {
	this.draw_piece(this.i-offset, this.j, lvl.corona);		
	this.draw_piece(this.i-offset, this.j, lvl.corona_pat.pat);	
    } else {
	this.draw_piece(this.i-offset, this.j, lvl.fire);		
	this.draw_piece(this.i-offset, this.j, lvl.fire_pat.pat);	
    }

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
    ['...',
     '**.',
     '.*.'],

    ['***',
     '.*.',
     '.*.'],

    ['.**',
     '**.',
     '.**'],

    ['.*.',
     '.*.',
     '.*.'],

    ['***',
     '*.*',
     '*.*'],
];


var Input = function () {
    this.keyEvent = {};
    this.down = {};
    this.dirs = {
	up:false,
	dn:false,
	rt:false,
	lt:false
    };
};
Input.prototype.parsedirs = function () {
    // so these are my main concerns: a key that's quickly hit should always be
    // recorded. i do that with keyEvent. a left/right key that's held down should register too
    // as long as it's not "confusing"
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
    if (! (KEY.rt in this.down && KEY.lt in this.down)) {
	if (KEY.rt in this.down) {
	    this.dirs.rt = true;
	}
	if (KEY.lt in this.down) {
	    this.dirs.lt = true;
	}
    }
};
Input.prototype.reset = function () {
    this.keyEvent = {};
};

var Game = function () {
    this.gotolater(this.loading);
    this.lvls = [SleepingBaby,SleepingBabyNeg,WakingBaby,WokenBaby,StarMan];
    this.lvl = 0;
    lvl = new this.lvls[this.lvl]();
    setTimeout(this.callback,FRIENDLY);
};
Game.prototype.gotolater = function (state) {
    this.state = [state];
};
Game.prototype.calllater = function (state) {
    this.state.push(state);
};
Game.prototype.returnlater = function () {
    this.state.pop();
};
Game.prototype.callback = function () {
    game.state[game.state.length-1].call(game);
    setTimeout(game.callback,FRIENDLY);
};
Game.prototype.loading = function () {
    if(lvl.load()) {
	lvl.postload();
	lvl.dialog();
	this.gotolater(this.dialog);
    }
};
Game.prototype.dialog = function () {
    if (KEY.en in input.keyEvent) {
	delete input.keyEvent[KEY.en];
	this.gotolater(this.dialog_animation);
	lvl.last_update = Date.now();
	lvl.begin_animation = lvl.last_update;
    }
};
Game.prototype.dialog_animation = function () {
    if (KEY.en in input.keyEvent) {
	delete input.keyEvent[KEY.en];
	lvl.begin_animation -= 2000;
    }
    if (! lvl.dialog_animation()) {
	if (! lvl.dialog()) {
	    this.gotolater(this.waitcmd);
	} else {
	    this.gotolater(this.dialog);
	}
    }
};
Game.prototype.rotate = function () {
    // this function is only called
    var now = Date.now();
    imgs[lvl.sun].tilt -= this.val*(now - this.last_update)*this.speed;
    this.last_update = now;
    if (Math.abs(imgs[lvl.sun].tilt) > 1) {
	input.parsedirs();
	if (this.val == 1 && input.down[KEY.rt]) {
	    while (imgs[lvl.sun].tilt < -1) {
		imgs[lvl.sun].tilt++;
		lvl.rotate(this.val);
	    }
	    this.speed = 1/50;
	} else if (this.val == -1 && input.down[KEY.lt]) {
	    while (imgs[lvl.sun].tilt > 1) {
		imgs[lvl.sun].tilt--;
		lvl.rotate(this.val);
	    }
	    this.speed = 1/50;
	} else {
	    imgs[lvl.sun].tilt = 0;
	    this.returnlater();
	    lvl.rotate(this.val);
	}
	lvl.render_play();
	piece.render();
    } else {
	lvl.render_play();
	piece.render();
    }
    lvl.interp_palette();
};
Game.prototype.startrotate = function (val) {
    this.calllater(this.rotate);
    this.speed = 1/100;
    this.val = val;
    this.last_update = Date.now();
};
Game.prototype.startfall = function () {
    this.calllater(this.fall);
    this.speed = 0.5/85;
    this.last_update = Date.now();
    this.fallen = 0;
    this.fallto = piece.fall_howfar();
};
Game.prototype.fall = function () {
    // this is only called
    var now = Date.now();
    this.fallen += (now - this.last_update)*this.speed;
    this.speed = this.speed*1.2;
    this.last_update = now;
    if (this.fallen > (piece.i - this.fallto)) {
	piece.i = this.fallto;
	board.setto(piece,piece.color);
	board.jettison();
	board.feast();
	piece = new ActivePiece(lvl.color,lvl.newpiece());
	this.returnlater();
	lvl.render_play();
	piece.render();
    } else {
	lvl.render_play(0,false);
	piece.render(this.fallen);
    }
    lvl.interp_palette();
};
Game.prototype.gameover = function () {
};
Game.prototype.handle_leftrightup = function () {
    input.parsedirs();
    if (input.dirs.lt) {
	this.startrotate(-1);
    }
    if (input.dirs.rt) {
	this.startrotate(1);
    }
    if (input.dirs.up) {
	piece.rotate();
    }
};
Game.prototype.waitcmd = function () {
    this.handle_leftrightup();

    if (input.dirs.dn) {
	if (! board.check(piece)) {
	    console.log('game over');
	    this.gotolater(this.gameover);
	} else {
	    this.startfall();
	}
    }
    if (KEY.sp in input.keyEvent || KEY.en in input.keyEvent) {
	lvl.switch_color();
	delete input.keyEvent[KEY.sp];
	delete input.keyEvent[KEY.en];
    }
    
    lvl.animate();
    lvl.render_play();
    piece.render();
    if (lvl.wincondition()) {
	this.lvl++;
	lvl = new this.lvls[realMod(this.lvl,this.lvls.length)]();
	input.reset();
	this.gotolater(this.loading);
	return;
    }

    lvl.interp_palette();
    if (lvl.losecondition()) {
	console.log('game over');
	this.gotolater(this.gameover);
    }
};
Game.prototype.tutorial1 = function () {
    this.handle_leftrightup();

    if (input.dirs.dn) {
	if (piece.fall_howfar() != 1) {
	    imgs.moon.fillhook = function () {
		lvl.moon_dialog("hold on a minute. there's no time limit here. you want to complete the innermost ring to wake him.");
	    };
	} else {
	    this.startfall();
	}
    }

    lvl.animate();
    lvl.render_play();
    piece.render();
    if (lvl.wincondition()) {
	this.lvl++;
	delete imgs.moon.fillhook;
	lvl = new this.lvls[realMod(this.lvl,this.lvls.length)]();
	input.reset();
	this.gotolater(this.loading);
	return;
    }
};
Game.prototype.tutorial2 = function () {
    this.handle_leftrightup();

    if (input.dirs.dn) {
	if (piece.color != COL_NEG) {
	    imgs.moon.fillhook = function () {
		lvl.moon_dialog("you need to press enter to make your piece a clean-up piece.");
	    };
	} else {
	    var offsets = piece.get_offsets(), shouldwork = false;
	    for (var i in offsets) {
		if (board[0][realMod(piece.j+offsets[i][1],NCOLS)] == COL_NEG) {
		    shouldwork = true;
		}
	    }
	    if (shouldwork) {
		this.startfall();
	    } else {
		imgs.moon.fillhook = function () {
		    lvl.moon_dialog("you can try that in a minute, but first clear out that hole.");
		};
	    }
	}
    }

    if (KEY.sp in input.keyEvent || KEY.en in input.keyEvent) {
	lvl.switch_color();
	delete input.keyEvent[KEY.sp];
	delete input.keyEvent[KEY.en];
    }

    lvl.animate();
    lvl.render_play();
    piece.render();
    if (lvl.wincondition()) {
	this.lvl++;
	delete imgs.moon.fillhook;
	lvl = new this.lvls[realMod(this.lvl,this.lvls.length)]();
	input.reset();
	this.gotolater(this.loading);
	return;
    }
};



imgs = {};
pats = {};
input = new Input();
lvl = {};

addEventListener("keydown", function (e) {
    input.keyEvent[e.keyCode] = true;
    input.down[e.keyCode] = true;
    if (e.keyCode in PKEYS) {
	e.preventDefault();
    } // try to prevent scrolling
}, false);

addEventListener("keyup", function (e) {
    delete input.down[e.keyCode];
    if (e.keyCode in PKEYS) {
	e.preventDefault();
    }
}, false);

game = new Game();
