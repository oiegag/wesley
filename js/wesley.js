/*
   wesley.js -- main setup

   Copyright 2013 Mike McFadden
   Author: Mike McFadden <compositiongamesdev@gmail.com>
   URL: http://github.com/oiegag/wesley

   This file is part of Raising Wesley.

   Raising Wesley is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 3 of the License, or
   (at your option) any later version.
   
   Raising Wesley is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   
   You should have received a copy of the GNU General Public License
   along with Raising Wesley.  If not, see <http://www.gnu.org/licenses/>.
 */


// remove the no javascript warning
document.getElementById("warning").style.display = "none";
// constants
var FRIENDLY = 15;

var COL_NON = 0;
var COL_COR = 1;
var COL_NEG = 2;

var MENUFILL = '#43190b';
var MENUBG = '#e4ce9a';
var MENUSELECTED = '#a00';
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
var setCookie = function (name, value, days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    var cookie = escape(value) + '; expires=' + date.toUTCString();
    document.cookie = name + '=' + cookie;
};

var getCookie = function (sought) {
    var cookies = document.cookie.split(';');
    for (var i = 0 ; i < cookies.length ; i++) {
	var name = cookies[i].substr(0,cookies[i].indexOf('='));
	var value = cookies[i].substr(cookies[i].indexOf('=')+1);
	if (name == sought) {
	    return value;
	}
    }
    return undefined;
};

var addOne = function (array,what) {
    var where = array.lastIndexOf(what);
    if (where == -1) {
	array.push(what);
    }
};

var removeAll = function(array,ofwhat) {
    return array.filter(function (x) {return x != ofwhat;});
};

var gaussian = function () {
    // well.. close enough
    var out = 0;
    for (var i = 0 ; i < 4 ; i++) {
	out += Math.random() - 0.5;
    }
    out *= 1/4;
    return out;
};

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
var rangeN = function (begin,end) {
    var out = [];
    if (end < begin) {
	return out;
    }
    for (var i = begin ; i < end ; i++) {
	out.push(i);
    }
    return out;
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
    this.alpha = 1;
    this.rot = 0;
    this.tilt = 0; // a temporary rotation variable
    this.image.onload = function() {
	this.parent.ready = true;
	this.parent.sw = this.width/this.parent.sheet[0];
	this.parent.sh = this.height/this.parent.sheet[1];
    };
    this.image.src = 'images/' + src + '.png';
};
Sprite.prototype.render = function () {
    if (this.fillhook != undefined) {
	this.fillhook();
    }
    ctx.save();
    ctx.translate(this.ox, this.oy);
    ctx.rotate(this.rot+this.tilt*DTHETA);
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(this.image,this.spos[0]*this.sw,this.spos[1]*this.sh,this.sw,this.sh,-this.sw/2,-this.sh/2,
		   this.sw, this.sh);
    ctx.globalAlpha = 1;
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
    this.image.src = 'images/' + src + '.png';
};
Pattern.prototype.animate = function () {
    var now = Date.now();
    if (now - this.last_update > 150) {
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
Board.prototype.tostring = function () {
    lines = [];
    for (var i = 0 ; i < board.nrows ; i++) {
	line = '';
	for (var j = 0 ; j < this.ncols ; j++) {
	    if(this[i][j] == COL_COR) {
		line = line + 'c';
	    } else if (this[i][j] == COL_NEG) {
		line = line + 'n';
	    } else {
		line = line + '.';
	    }
	}
	lines.push(line);
    }
    return lines;
}

Board.prototype.show = function () {
    var lines = this.tostring().reverse();
    for (var i in lines) {
	console.log(lines[i]);
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

Board.prototype.jettison = function () {
    // all negatives with nothing above them are jettisoned off
    var jettisoned = [];
    var foundcorona = false;
    for (var j = 0 ; j < board.ncols ; j++) {
	foundcorona = false;
	for (var i = board.nrows-1 ; i >= 0 ; i--) {
	    if (board[i][j] == COL_COR) {
		foundcorona = true;
	    } else if (board[i][j] == COL_NEG && ! foundcorona) {
		jettisoned.push([i,j]);
		board[i][j] = COL_NON;
	    } else if (board[i][j] == COL_NON && foundcorona) {
		board[i][j] = COL_NEG;
	    }
	}
    }
    return jettisoned;
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
    this.rot = realMod(this.rot - 1,4);
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
	var noi = Math.round(Math.cos(this.rot*PI/2))*oi + Math.round(Math.sin(this.rot*PI/2))*oj;
	var noj = -Math.round(Math.sin(this.rot*PI/2))*oi + Math.round(Math.cos(this.rot*PI/2))*oj;
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
    this.dirs = {
	up:false,
	dn:false,
	rt:false,
	lt:false
    };
};

var Game = function () {
    this.gotolater(this.load_before_levels);
    this.selected = 0;
    this.lvls = [SleepingBaby,SleepingBabyNeg,WakingBaby,WokenBaby,BigBaby,MoonSucks,AnotherDay,AnotherPuzzle,
		 StarMan,WesleyPuzzle,BigMan,BigManPuzzle,
		 Giant,DoublePuzzle,TriplePuzzle,CleanupPuzzle,Waiting];
    this.load_level();
    this.skip_dialog = false;
    this.always_skip_dialog = false; // set skip dialog back to this value on entering a level
    this.music = true;
    this.sfx = true;
    this.always_sfx = true;
    this.invert = true;
    this.soundtrack = [];

    lvl = new this.lvls[this.lvl]();
    setTimeout(this.callback,FRIENDLY);
};
Game.prototype.load_before_levels = function () {
    ctx.fillStyle = MENUBG;
    ctx.fillRect(0,0,cvs.width,cvs.height);
    this.textCenter(['loading'], 20, cvs.width/2, cvs.height*0.6, MENUFILL);

    for (var i in imgs) {
	if (! imgs[i].ready) {
	    return;
	}
    }
    this.began = Date.now();
    imgs.logo.ox = cvs.width/2;
    imgs.logo.oy = cvs.height/2;
    this.gotolater(this.logo);
};
Game.prototype.logo = function () {
    ctx.fillStyle = MENUBG;
    ctx.fillRect(0,0,cvs.width,cvs.height);
    imgs.logo.render();
    if ((Date.now() - this.began) > 2000) {
	this.gotolater(this.mainmenu);
    }
};
Game.prototype.save_level = function () {
    // wrapper for either set cookie or a kongregate api later on
    setCookie('level',this.lvl.toString(),30);
};
Game.prototype.load_level = function () {
    var lvl = getCookie('level');
    if (lvl && parseInt(lvl)) {
	this.lvl = lvl;
    } else {
	this.lvl = 0;
    }
};
Game.prototype.do_clouds = function () {
    // store here so we don't randomly regenerate positions each level
    var now = Date.now();

    if (this.cloud == undefined) {
	this.cloud = {};
	this.cloud.locations = [];
	this.cloud.velocities = [];
	this.cloud.update = Date.now();
	for (var i = 0 ; i < 4 ; i++) {
	    this.cloud.locations.push([Math.round(-cvs.width/2 + Math.random()*cvs.width*2), Math.round(cvs.height*Math.pow(Math.random(),3))]);
	    this.cloud.velocities.push(10*(1 + (Math.random() - .25))/1000);
	}
    }
    for (var i in this.cloud.locations) {
	if (i < 2) {
	    ctx.drawImage(imgs.cloud1.image,Math.round(this.cloud.locations[i][0]), Math.round(this.cloud.locations[i][1]));
	} else {
	    ctx.drawImage(imgs.cloud2.image,Math.round(this.cloud.locations[i][0]), Math.round(this.cloud.locations[i][1]));
	}
	this.cloud.locations[i][0] = this.cloud.locations[i][0] - (now - this.cloud.update)*this.cloud.velocities[i];
	if (this.cloud.locations[i][0] < -cvs.width/2) {
	    this.cloud.locations[i][0] = cvs.width*1.5;
	    this.cloud.locations[i][1] = Math.round(cvs.height*Math.pow(Math.random(),3));
	    this.cloud.velocities[i] = 10*(1 + (Math.random() - .25))/1000;
	}
    }
    this.cloud.update = Date.now();
};
Game.prototype.nextlevel = function () {
    this.lvl++;
    if (this.lvl == this.lvls.length) {
	this.gotolater(this.transition_to_credits);
	input.reset();
	this.began = Date.now();
	return;
    } else {
	this.save_level();
	lvl.began = Date.now();
	lvl.orig_style = lvl.styletype;
	lvl.styletype = 'intermediate';
	for (var i in STYLES.intermediate) {
	    STYLES.intermediate[i] = lvl[i];
	}
	this.gotolater(this.transition_palette);
    }
};
Game.prototype.transition_palette = function () {
    if (! lvl.interp_palette(lvl.orig_style,300)) {
	lvl.animate();
	lvl.render_play(false);
	lvl = this.newlevel;
	delete this.newlevel;
	input.reset();
	snds.winbing.play();
	this.gotolater(this.loading);
    } else {
	lvl.animate();
	lvl.render_play(false);
	if (this.newlevel == undefined) {
	    this.newlevel = new this.lvls[realMod(this.lvl,this.lvls.length)](board.tostring());
	}
    }
};
Game.prototype.transition_to_credits = function () {
    var now = Date.now(), tfrac = (now - this.began)/1000;

    ctx.lineWidth = 1.25;
    ctx.strokeStyle = '#000';
    board.ox = cvs.ox
    board.oy = cvs.oy;
    board.draw_arc(2*tfrac,0,2*PI);
    ctx.fillStyle = '#000';
    ctx.fill();

    if (tfrac > 1) {
	this.draw_credits();
	input.reset();
	this.gotolater(this.mainmenu);
	this.calllater(this.returntomenu);
    }
};

Game.prototype.textLeft = function (strs,font,startx,starty,color) {
    // draw left justified text
    var x = startx, y = starty;
    ctx.font = font + 'px mine';
    if (color == undefined) {
	ctx.fillStyle = '#fff';
    } else {
	ctx.fillStyle = color;
    }
    for (var i in strs) {
	ctx.fillText(strs[i], x, y+font);
	y += font;
    }
};
Game.prototype.textCenter = function (strs,font,startx,starty,color) {
    // draw left justified text
    var x = startx, y = starty;
    ctx.font = font + 'px mine';
    if (color == undefined) {
	ctx.fillStyle = '#fff';
    } else {
	ctx.fillStyle = color;
    }
    for (var i in strs) {
	var val = ctx.measureText(strs[i]);
	ctx.fillText(strs[i], x-val.width/2, y+font);
	y += font;
    }
};
Game.prototype.textRight = function (strs,font,endx,starty,color) {
    // draw left justified text
    var x = endx, y = starty;
    ctx.font = font + 'px mine';

    if (color == undefined) {
	ctx.fillStyle = '#fff';
    } else {
	ctx.fillStyle = color;
    }
    for (var i in strs) {
	var val = ctx.measureText(strs[i]);
	ctx.fillText(strs[i], x-val.width, y+font);
	y += font;
    }
};
Game.prototype.draw_credits = function () {
    ctx.fillStyle = MENUBG;
    ctx.fillRect(0,0,cvs.width,cvs.height);
    this.textLeft(['mike mcfadden','kate mcfadden','mike and kate'],25,60,100,MENUFILL);
    this.textRight(['code, music','art','story, sound effects'],25,cvs.width-60,100,MENUFILL);
    this.textCenter(['freesound.org field recordings'],25,cvs.width/2,250,MENUFILL);
    this.textLeft(['strangy','kyster','corsica_s'],25,60,300,MENUFILL);
    this.textRight(['wind in the grass small town','henne beach waves and seagulls','toronto_chinatown'],25,cvs.width-60,300,MENUFILL);
    this.textCenter(['thanks to the maintainers', 'of inkscape and fontforge'], 25, cvs.width/2, 450, MENUFILL);
};
Game.prototype.mainmenu = function () {
    var selections = ['continue','new game','options','credits'];

    ctx.fillStyle = MENUBG;
    ctx.fillRect(0,0,cvs.width,cvs.height);
    this.do_clouds();
    this.textCenter(selections, 40, cvs.width/2, cvs.height*0.6, MENUFILL);
    this.textCenter(['raising wesley'], 80, cvs.width/2, cvs.height*0.3, MENUFILL);
    this.textCenter(['use +,=,enter to select'],25,cvs.width/2,cvs.height*0.9, MENUFILL);
    if (this.lvl == 0) {
	this.textCenter(['continue'], 40, cvs.width/2,cvs.height*0.6, '#a86');
	if (this.selected == 0) {
	    this.selected = 1;
	}
    }
    this.textCenter([selections[this.selected]],40, cvs.width/2,cvs.height*0.6+40*this.selected, MENUSELECTED);
    if (KEY.dn in input.keyEvent) {
	delete input.keyEvent[KEY.dn];
	this.selected = realMod(this.selected+1,4);
    }
    if (KEY.up in input.keyEvent) {
	delete input.keyEvent[KEY.up];
	this.selected = realMod(this.selected-1,4);
    }
    if (KEY.en in input.keyEvent) {
	delete input.keyEvent[KEY.en];
	if (this.selected == 0) { // continue
	    this.apply_options();
	    this.gotolater(this.loading);
	} else if (this.selected == 1) { // new game
	    this.lvl = 0;
	    lvl = new this.lvls[this.lvl]();
	    this.apply_options();
	    this.gotolater(this.loading);
	} else if (this.selected == 2) { // options
	    this.selected = 0;
	    this.calllater(this.options);
	} else if (this.selected == 3) { // credits
	    this.draw_credits();
	    this.calllater(this.returntomenu);
	}
    }
};
Game.prototype.apply_options = function () {
    this.skip_dialog = this.always_skip_dialog;
    this.sfx = this.always_sfx;
    if (this.invert) {
	KEY.rt = 39;
	KEY.lt = 37;
    } else {
	KEY.rt = 37;
	KEY.lt = 39;
    }
};
Game.prototype.options = function () {
    var booltotext = {true:'on',false:'off'};
    var values = [booltotext[!this.always_skip_dialog],booltotext[this.always_sfx],booltotext[this.music],booltotext[this.invert]];
    var highlightables = values.concat(['return to menu']);
    var locations = [[550,0],[550,30],[550,60],[550,90],[400,200]], starty = 280;

    ctx.fillStyle = MENUBG;
    ctx.fillRect(0,0,cvs.width,cvs.height);

    this.textLeft(['story','sound effects','music','invert </>'], 30, 200, starty, MENUFILL);
    this.textCenter(values, 30, 550, starty, MENUFILL);
    this.textCenter(['return to menu'], 30, locations[values.length][0], locations[values.length][1]+starty, MENUFILL);
    this.textCenter([highlightables[this.selected]],30,locations[this.selected][0],locations[this.selected][1] + starty, MENUSELECTED);
    this.textCenter(['use +, =, and enter to change options'],30,400,100,MENUFILL);
    if (KEY.dn in input.keyEvent) {
	delete input.keyEvent[KEY.dn];
	this.selected = realMod(this.selected+1,highlightables.length);
    }
    if (KEY.up in input.keyEvent) {
	delete input.keyEvent[KEY.up];
	this.selected = realMod(this.selected-1,highlightables.length);
    }
    if (KEY.en in input.keyEvent) {
	delete input.keyEvent[KEY.en];
	if (this.selected == 0) { // dialog
	    this.always_skip_dialog = ! this.always_skip_dialog;
	} else if (this.selected == 1) { // sfx
	    this.always_sfx = ! this.always_sfx;
	} else if (this.selected == 2) { // music
	    this.music = ! this.music;
	} else if (this.selected == 3) { // invert
	    this.invert = ! this.invert;
	} else if (this.selected == 4) { // return
	    this.selected = 0;
	    this.returnlater();
	}
    }

};
Game.prototype.returntomenu = function () {
    if (KEY.en in input.keyEvent || this.skip_dialog) {
	delete input.keyEvent[KEY.en];
	this.returnlater();
    }
};
Game.prototype.gotolater = function (state) {
    this.state = [state];
};
Game.prototype.goto_over = function (state) { // like goto but keeps stack the same
    this.state[this.state.length-1] = state;
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
    ctx.fillStyle = MENUBG;
    ctx.fillRect(cvs.width/2-60,cvs.height/2,120,25);
    this.textCenter(['loading'], 25, cvs.width/2, cvs.height/2-3, MENUFILL);
    if(lvl.load()) {
	lvl.postload();
	input.reset();
	this.cloud.update = Date.now();
	lvl.dialog(false);
	this.gotolater(this.dialog);
    }
    if (this.skip_dialog) {
	this.censor();
    }
};
Game.prototype.censor = function () {
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,cvs.width,cvs.height);
};
Game.prototype.dialog = function () {
    lvl.animate();
    if (KEY.en in input.keyEvent || KEY.sp in input.keyEvent || this.skip_dialog) {
	delete input.keyEvent[KEY.en];
	delete input.keyEvent[KEY.sp];
	this.gotolater(this.dialog_animation);
	lvl.last_update = Date.now();
	lvl.began = lvl.last_update;
    }
    lvl.dialog(false);
    if (this.skip_dialog) {
	this.censor();
    }
};
Game.prototype.dialog_animation = function () {
    lvl.animate();
    if (KEY.en in input.keyEvent || KEY.sp in input.keyEvent || this.skip_dialog) {
	delete input.keyEvent[KEY.en];
	delete input.keyEvent[KEY.sp];
	lvl.began -= 2000;
    }
    if (! lvl.dialog_animation()) {
	if (! lvl.dialog(true)) {
	    this.skip_dialog = this.always_skip_dialog;
	    this.sfx = this.always_sfx;
	    lvl.total_lines = lvl.lines;
	    input.reset();
	    this.gotolater(this.waitcmd);
	} else {
	    this.gotolater(this.dialog);
	}
    }
    if (this.skip_dialog) {
	this.censor();
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
	    snds.thud.play();
	    this.returnlater();
	    lvl.rotate(this.val);
	}
	lvl.render_play();
	piece.render();
    } else {
	lvl.render_play();
	piece.render();
    }
    lvl.animate();
    lvl.interp_palette('dying',(lvl.timer-30)*1000);
};
Game.prototype.enqueue = function(soundtrack) {
    playnext = function () {
	game.soundtrack.pop();
	if (game.soundtrack.length == 0) {
	    game.soundtrack = [snds.ambient];
	}
	var newbie = game.soundtrack[game.soundtrack.length-1];
	newbie.play();
	newbie.set_callback(playnext);
    };
    this.soundtrack.push(soundtrack);
    if (this.soundtrack.length == 1) {
	soundtrack.play();
	this.soundtrack[this.soundtrack.length-1].set_callback(playnext);
    }
};

Game.prototype.startrotate = function (val) {
    this.calllater(this.rotate);
    this.speed = 1/120;
    this.val = val;
    this.last_update = Date.now();
    this.began = Date.now();
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
	this.jettison_me = board.jettison();
	lvl.render_play(false);
	if (this.jettison_me.length == 0) {
	    this.end_of_fall();
	} else {
	    this.last_update = Date.now();
	    this.jetsetter(0);
	    this.goto_over(this.jettison_animate);
	}
	if (lvl.color == COL_COR) {
	    snds.fallen.play();
	} else {
	    snds.cfallen.play();
	}
    } else {
	lvl.render_play(false);
	piece.render(this.fallen);
    }
    lvl.animate();
    lvl.interp_palette('dying',(lvl.timer-30)*1000);
};
Game.prototype.jetsetter = function (tfrac) {
    ctx.globalAlpha = 1 - tfrac;
    for (var i in this.jettison_me) {
	board.draw_box(this.jettison_me[i][0],this.jettison_me[i][1],lvl.fire);
	board.draw_box(this.jettison_me[i][0],this.jettison_me[i][1],lvl.fire_pat.pat);
    }
    ctx.globalAlpha = 1;
};
Game.prototype.jettison_animate = function () {
    var now = Date.now(), tfrac = (now - this.last_update)/250;
    lvl.render_play(false);
    if (tfrac < 1) {
	this.jetsetter(tfrac);
    } else {
	this.end_of_fall();
	lvl.render_play(false);
    }
};
Game.prototype.end_of_fall = function () {
    var reduced = lvl.feast();
    if (reduced > 0) {
	lvl.lines -= reduced;
	snds.feast.play();
    }
    piece = new ActivePiece(lvl.color,lvl.newpiece());
    this.returnlater();
};
Game.prototype.gameover = function () {
    lvl.narrate(lvl.gameovertext);
    if (KEY.en in input.keyEvent || KEY.sp in input.keyEvent) {
	lvl = new this.lvls[this.lvl]();
	this.skip_dialog = true;
	this.sfx = false;
	globalInit();
	input.reset();
	this.gotolater(this.loading);
    }
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
    if (lvl.wincondition()) {
	this.nextlevel();
	return;
    }

    if (lvl.losecondition()) {
	this.gotolater(this.gameover);
	return;
    }

    this.handle_leftrightup();

    if (input.dirs.dn) {
	if (! board.check(piece)) {
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

    lvl.interp_palette('dying',(lvl.timer-30)*1000);
    lvl.animate();
    lvl.render_play();
    piece.render();
};
Game.prototype.tutorial1 = function () {
    this.handle_leftrightup();

    if (input.dirs.dn) {
	if (piece.fall_howfar() != 1) {
	    lvl.tutorial_dialog = "use + to rotate your piece. then, use < or > to rotate the star until those two holes on the surface are in the shadow of the piece. next, launch with =."
	} else {
	    this.startfall();
	}
    }

    if (lvl.wincondition()) {
	this.nextlevel();
	return;
    }
    lvl.animate();
    lvl.render_play();
    piece.render();
};
Game.prototype.tutorial2 = function () {
    this.handle_leftrightup();

    if (input.dirs.dn) {
	if (piece.color != COL_NEG) {
	    lvl.tutorial_dialog = "you need to press enter or space to make your piece a gas piece.";
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
		lvl.tutorial_dialog = "gas pieces land on gas pockets but pass through normal star food. place the piece above the hole to clear your way.";
	    }
	}
    }

    if (KEY.sp in input.keyEvent || KEY.en in input.keyEvent) {
	lvl.switch_color();
	delete input.keyEvent[KEY.sp];
	delete input.keyEvent[KEY.en];
    }

    if (lvl.wincondition()) {
	this.nextlevel();
	return;
    }
    lvl.animate();
    lvl.render_play();
    piece.render();
};

var globalInit = function () {
    imgs = {cloud1:new Sprite('cloud1'),cloud2:new Sprite('cloud2'),logo:new Sprite('logo')};
    pats = {};
    snds = {};
};
globalInit();
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
