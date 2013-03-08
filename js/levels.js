/*
   levels.js -- all of the levels

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


var STYLES = {
    sleepingbaby:{
	sky:'#001',
	sunfill: '#fff7ad',
	moonfill: '#cff',
	corona:'#fff7ad',
	outer:'#ffd800',
	fire:'#660',
	preview: '#8383f9',
	grid:'#222',
    },
    babyface:{
	sky:'#025',
	sunfill: '#ffe16c',
	moonfill: '#cff',
	corona:'#e6c440',
	outer:'#f30',
	fire:'#660',
	preview: '#8383f9',
	grid:'#037',
    },
    bigbaby:{
	sky:'#035',
	sunfill: '#ffe16c',
	moonfill: '#cff',
	outer:'#f30',
	corona:'#e6c440',
	fire:'#660',
	preview: '#8383f9',
	grid:'#037',
    },
    manface:{
	sky:'#add6ff',
	sunfill: '#fb0',
	moonfill: '#eee',
	outer:'#ffd800',
	corona:'#fc0',
	fire:'#660',
	preview: '#8383f9',
	grid:'#aaa',
    },
    bigman:{
	sky:'#fc9',
	sunfill: '#fa0',
	moonfill: '#eca',
	outer:'#ffd800',
	corona:'#fb0',
	fire:'#660',
	preview: '#c96',
	grid:'#aaa',
    },
    giant:{
	sky:'#f70',
	sunfill: '#f20',
	moonfill: '#fb9',
	outer:'#ffd800',
	corona:'#f30',
	fire:'#660',
	preview: '#8383f9',
	grid:'#a20',
    },
    biggiant:{
	sky:'#f70',
	sunfill: '#f20',
	moonfill: '#fb9',
	outer:'#ffd800',
	corona:'#f30',
	fire:'#660',
	preview: '#8383f9',
	grid:'#a20',
    },
    deadmoon:{
	sky:'#f70',
	sunfill: '#f20',
	moonfill: '#520',
	outer:'#ffd800',
	corona:'#f30',
	fire:'#660',
	preview: '#8383f9',
	grid:'#a20',
    },
    skull:{
	sky:'#001',
	sunfill: '#eff',
	moonfill: '#cff',
	outer:'#ffd800',
	corona:'#030',
	fire:'#660',
	preview: '#8383f9',
	grid:'#222',
    },
    skull_nontoxic:{
	sky:'#001',
	sunfill: '#eff',
	moonfill: '#cff',
	outer:'#ffd800',
	corona:'#eff',
	fire:'#660',
	preview: '#8383f9',
	grid:'#222',
    },
    dying:{
	sky:'#f70',
	sunfill: '#f30',
	moonfill: '#cff',
	outer:'#ffd800',
	corona:'#f30',
	fire:'#660',
	preview: '#8383f9',
	grid:'#a20',
    },
    intermediate:{ // filler style for interpolation
	sky:'#f70',
	sunfill: '#f30',
	moonfill: '#cff',
	outer:'#ffd800',
	corona:'#f30',
	fire:'#660',
	preview: '#8383f9',
	grid:'#a20',
    }
};

var SETTINGS = {
    baby:{
	sun:'baby',
	corona_nm:'rays_sun',
	fire_nm:'fire',
	skip:0,
	timer:1/0,
	lines:1
    },
    bigbaby:{
	sun:'bigbaby',
	corona_nm:'rays_sun',
	fire_nm:'fire',
	skip:1,
	timer:2*60,
	lines:4
    },
    man:{
	sun:'man',
	corona_nm:'rays_sun',
	fire_nm:'fire',
	skip:2,
	lines:6,
	timer:60*3
    },
    bigman:{
	sun:'bigman',
	corona_nm:'rays_sun',
	fire_nm:'fire',
	skip:3,
	lines:8,
	timer:200
    },
    giant:{
	sun:'giant',
	corona_nm:'rays_sun',
	fire_nm:'fire',
	skip:4,
	lines:4,
	timer:60*3
    },
    biggiant:{
	sun:'biggiant',
	corona_nm:'rays_sun',
	fire_nm:'fire',
	skip:5,
	lines:10,
	timer:60*5
    },
    skull:{
	sun:'skull',
	corona_nm:'rays_sun',
	fire_nm:'fire',
	skip:0,
	timer:80
    },
};


var Level = function () {
};
Level.prototype.preload = function () {
    this.newimgs = this.newimgs.concat([['nar_mid'],['nar_head'],['nar_foot'],['moon_head'],['moon_mid'],['moon_foot'],
					['sun_head'],['sun_mid'],['sun_foot'],['moon',[0.08*cvs.width,0.9*cvs.height]],
				        ['lefty'],['righty'],['piece_t'],['piece_straight'],['piece_l'],['piece_cup'],
				        ['piece_u'],['objectives',[0,0],[17,1]]]);
    if (this.newpats == undefined) {
	this.newpats = [];
    }
    if (this.newsnds == undefined) {
	this.newsnds = [];
    }
    this.newpats = this.newpats.concat([['rays_sun',[5,1],[0,1,2,3,4,3,2,1]],['fire',[1,1]]]);
    this.newsnds = this.newsnds.concat([['fallen'],['cfallen'],['feast'],['wheelin'],['moondeath'],['shakeout'],['winbing']]);

    this.reset_style();
    this.reset_settings();

    this.color = COL_COR; // stores what the new pieces come in as
    this.inscene = [];
    this.rot = 0;
};
Level.prototype.refresh_board = function () {
    board = new Board(this.skip,this.initialstate);
    piece = new ActivePiece(COL_COR,this.newpiece()); // when the board changes size the piece's value can change.
};
Level.prototype.feast = function (feastwhat) {
    // remove bottom rows
    if (feastwhat == undefined) {
	feastwhat = COL_COR;
    }
    var delrows = 0;
    for (var i = 0 ; i < board.nrows ; i++) {
	for (var j = 0 ; j < board.ncols && board[i][j] == feastwhat; j++);
	if (j == board.ncols) {
	    delrows++;
	} else {
	    break;
	}
    }
    // now delete the bottom rows and clear the top ones
    for (var i = 0 ; i < board.nrows-delrows ; i++) {
	for (var j = 0 ; j < board.ncols ; j++) {
	    board[i][j] = board[i+delrows][j];
	}
    }
    for (var i = board.nrows-delrows ; i < board.nrows ; i++) {
	for (var j = 0 ; j < board.ncols ; j++) {
	    board[i][j] = COL_NON;
	}
    }
    return delrows;
};
Level.prototype.reset_settings = function () {
    for (var i in SETTINGS[this.settingtype]) {
	this[i] = SETTINGS[this.settingtype][i];
    }
};
Level.prototype.reset_style = function() {
    for (var i in STYLES[this.styletype]) {
	this[i] = STYLES[this.styletype][i];
    }

};
Level.prototype.gameovertext = "that won't work. you may continue from your last save state.";
Level.prototype.startloading = function (these,constructor,where) {
    var loaded = 0;
    for (var i in these) {
	if (! (these[i][0] in where)) {
	    where[these[i][0]] = new constructor(these[i][0],these[i][1],these[i][2]);
	} else if (where[these[i][0]].ready) {
	    loaded++;
	}
    }
    return loaded;
};
Level.prototype.moons_hook = function () {
    ctx.lineWidth = 1.25;
    ctx.fillStyle = lvl.moonfill;
    ctx.beginPath();
    ctx.arc(this.ox, this.oy, 78, 0, 2*PI);
    ctx.fill();
};
Level.prototype.they_hooks = function (cenx) {
    return function () {
	var ceny=75,rado=47,radi=33;

	ctx.lineWidth = 1.25;

	ctx.fillStyle = lvl.corona;
	ctx.beginPath();
	ctx.arc(cenx,ceny,rado,0,2*PI);
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = lvl.fire;
	ctx.arc(cenx,ceny,rado,-PI/2,-PI/2+this.blackchunk,false);
	ctx.lineTo(cenx,ceny);
	ctx.closePath();
	ctx.fill();

	ctx.fillStyle = lvl.fire;
	ctx.beginPath();
	ctx.arc(cenx,ceny,radi, 0, 2*PI);
	ctx.fill();
    };
};
Level.prototype.add_fill_hooks = function () {
    imgs[this.sun].fillhook = function () {
	ctx.lineWidth = 1.25;
	ctx.strokeStyle = lvl.sunfill;
	board.ox = this.ox;
	board.oy = this.oy;
	board.draw_arc(board.rs[0]-2/cvs.width,0,2*PI);
	ctx.fillStyle = lvl.sunfill;
	ctx.fill();

	board.render(this.tilt*DTHETA);
    };
    imgs.moon.fillhook = Level.prototype.moons_hook;
    imgs.lefty.blackchunk = 0;
    imgs.lefty.fillhook = this.they_hooks(103);
    imgs.righty.fillhook = this.they_hooks(cvs.width-103);
};
Level.prototype.load = function() {
    // generic load of the newimgs/newpats things
    var iloaded = this.startloading(this.newimgs,Sprite,imgs);
    var ploaded = this.startloading(this.newpats,Pattern,pats);
    var sloaded = this.startloading(this.newsnds,Sound,snds);
    if ((iloaded == this.newimgs.length) && (ploaded == this.newpats.length)) {
	return true;
    } else {
	return false;
    }
};
Level.prototype.postload = function () {
    this.began = Date.now();
    board = new Board(this.skip,this.initialstate);
    ActivePiece.buildtypes();
    piece = new ActivePiece(COL_COR,this.newpiece());

    imgs.lefty.ox = imgs.lefty.image.width/2;
    imgs.lefty.oy = imgs.lefty.image.height/2;
    imgs.righty.ox = cvs.width - imgs.righty.image.width/2;
    imgs.righty.oy = imgs.righty.image.height/2;

    imgs.objectives.ox = imgs.objectives.image.width/(2*imgs.objectives.sheet[0]);
    imgs.objectives.oy = imgs.objectives.image.height/2;
    imgs.objectives.spos[0] = game.lvl;

    this.add_fill_hooks();

    this.piece_pics = [imgs.piece_l,imgs.piece_t,imgs.piece_cup,imgs.piece_straight,imgs.piece_u];

    this.corona_pat = pats[this.corona_nm];
    this.corona_pat.makePattern();
    this.fire_pat = pats[this.fire_nm];
    this.fire_pat.makePattern();
};
Level.prototype.background = function (grid) {
    if (grid == undefined) {
	grid = true;
    }

    ctx.fillStyle = this.sky;
    ctx.fillRect(0,0,cvs.width,cvs.height);

    if (grid) {
	board.drawgrid();
    }

    this.bg.render();
    game.do_clouds();
};
Level.prototype.pdict = {
    l:0,
    t:1,
    cup:2,
    straight:3,
    u:4
};
Level.prototype.newpiece = function () {
    if (this.pieces == undefined) {
	this.pieces = [];
	for (var i = 0 ; i < 13 ; i++) {
	    this.pieces = [this.nextpiece()].concat(this.pieces);
	}
    }
    this.pieces = [this.nextpiece()].concat(this.pieces);
    return this.pieces.pop();
};
Level.prototype.nextpiece = function () {
    return randN(ActivePiece.prototype.pics.length);
};

Level.prototype.draw_piece_pics = function () {
    var locs = [[754,316],[754,287],[753,258],[753,232],[753,203],[755,177],[758,152],[760,122],
		[760,97],[755,67],[745,37],[723,18],[695,10]]


    for (var i in this.pieces) {
	if (this.pieces[i] != undefined) {
	    ctx.drawImage(this.piece_pics[this.pieces[i]].image, locs[i][0], locs[i][1]);
	}
    }
};
Level.prototype.render_play = function(showprev) {
    // render the whole scene for when you're playing the game
    if (showprev == undefined) {
	showprev = true;
    }

    this.background(true);

    if (showprev) {
	piece.draw_preview();
    }

    imgs.righty.blackchunk = Math.round(((Date.now() - this.began)/(this.timer*1000))*16)*PI/8;
    imgs.lefty.blackchunk = Math.round((this.lines/this.total_lines)*16)*PI/8;

    this.draw_scene();
    imgs.objectives.render();
    this.draw_piece_pics();
};
Level.prototype.switch_color = function () {
    if (this.color == COL_COR) {
	this.color = COL_NEG;
	piece.color = COL_NEG;
    } else {
	this.color = COL_COR;
	piece.color = COL_COR;
    }
};
Level.prototype.rotate = function (rot) {
    board.rotate(rot);
    imgs[this.sun].rot -= rot*board.dtheta;
};
Level.prototype.wincondition = function () {
    if (this.lines <= 0) {
	return true;
    } else {
	return false;
    }
};
Level.prototype.losecondition = function () {
    var now = Date.now();
    if (piece.type == undefined) {
	return true;
    }
    if ((now - this.began)/1000 > this.timer) {
	return true;
    } else {
	return false;
    }
};
Level.prototype.animate = function () {
    for (var i in imgs) {
	imgs[i].animate();
    }

    for (var p in pats) {
	pats[p].animate();
    }
};
Level.prototype.interp_palette = function (tostyle,timelength) {
    var now = Date.now();
    if (this.styletype != tostyle) {
	if ((now - this.began) > timelength) {
	    this.styletype = tostyle;
	    for (var i in STYLES[tostyle]) {
		this[i] = STYLES[tostyle][i];
	    }
	} else {
	    for (var i in STYLES[tostyle]) {
		var endrgb = css2rgb(STYLES[tostyle][i]);
		var startrgb = css2rgb(STYLES[this.styletype][i]);
		var frac = (now - this.began)/timelength;
		var curr = [];
		for (var j = 0 ; j < 3 ; j++) {
		    curr[j] = Math.round(startrgb[j]*(1-frac) + endrgb[j]*frac);
		}
		this[i] = rgb2css(curr);
	    }
	}
	return true;
    } else {
	return false;
    }
};
Level.prototype.wrapText = function (text,width) {
    // return the lines to use for text to make it width
    words = text.split(' ');
    lines = [];
    thisline = words[0];
    ctx.font = '19px mine';
    for (var i = 1 ; i < words.length ; i++) {
	if (ctx.measureText(thisline + ' ' + words[i]).width > width) {
	    lines.push([thisline, ctx.measureText(thisline).width]);
	    thisline = words[i];
	} else {
	    thisline = thisline + ' ' + words[i];
	}
	if (thisline[thisline.length-1] == '\n') {
	    lines.push([thisline, ctx.measureText(thisline).width]);
	    thisline = '';
	}
    }
    if (thisline.length > 0) {
	lines.push([thisline, ctx.measureText(thisline).width]);
    }
    return lines;
};
Level.prototype.draw_dialog = function (text, startx, endy, head, mid, foot, textwidth) {
    var lines = this.wrapText(text,textwidth);
    var sofar = 0, fontsz = 19, linesz = mid.image.height;
    var heady = head.image.height, footy = foot.image.height;
    ctx.fillStyle = '#000';
    sofar += footy;
    ctx.drawImage(foot.image, startx-foot.image.width/2, endy-sofar);
    if (lines.length > 0) {
	while ((sofar - heady - footy)  <= fontsz*lines.length) {
	    sofar += linesz;
	    ctx.drawImage(mid.image, startx-mid.image.width/2, endy-sofar);
	}
    }
    sofar += heady;
    ctx.drawImage(head.image, startx-head.image.width/2, endy-sofar);
    var offset = (endy - sofar + heady) + (sofar - heady - footy - fontsz*lines.length)/2 + fontsz;
    for (var i = 0 ; i < lines.length ; i++) {
	ctx.fillText(lines[i][0], startx - lines[i][1]/2, offset + i*fontsz);
    }
};
Level.prototype.narrate = function (text) {
    this.draw_dialog(text, 650, 580, imgs.nar_head, imgs.nar_mid, imgs.nar_foot, 230);
};
Level.prototype.moon_dialog = function (text) {
    this.draw_dialog(text, 140, 445, imgs.moon_head, imgs.moon_mid, imgs.moon_foot, 210);
};
Level.prototype.sun_dialog = function (text) {
    this.draw_dialog(text, 400, 445, imgs.sun_head, imgs.sun_mid, imgs.sun_foot, 180);
};
Level.prototype.dialog = function () {
    this.narrate('');
    return false;
};
Level.prototype.dialog_animation = function () {
    return false;
};
Level.prototype.animate_rise = function (risewhat,from,to,inthesems) {
    this.background(false);

    var now = Date.now(), tfrac = (now - this.began)/inthesems;

    if (this.played_wheelie == undefined) {
	this.played_wheelie = true;
	snds.wheelin.play();
    }

    sfrac = 1 - Math.exp(-(tfrac*5))*Math.cos(10*tfrac);
    risewhat.ox = Math.round((1-sfrac)*from[0] + sfrac*to[0]);
    risewhat.oy = Math.round((1-sfrac)*from[1] + sfrac*to[1]);
    this.draw_scene();

    if (tfrac >= 1) {
	delete this.played_wheelie;
    }

    return (tfrac < 1);
};
Level.prototype.animate_set = function (setwhat,from,to,inthesems) {
    this.background(false);

    var now = Date.now(), tfrac = (now - this.began)/inthesems;

    sfrac = tfrac*tfrac;

    if (sfrac > 1) {
	sfrac = 1;
    }

    setwhat.ox = Math.round((1-sfrac)*from[0] + sfrac*to[0]);
    setwhat.oy = Math.round((1-sfrac)*from[1] + sfrac*to[1]);
    this.draw_scene();

    if (tfrac >= 1) {
	delete this.played_wheelie;
    }

    return (tfrac < 1);
};
Level.prototype.shakeout = function () {
    var now = Date.now(), tfrac = (now - this.began)/1000;
    this.background(false);
    this.draw_scene();

    if (tfrac < 1) {
	ctx.fillStyle = '#fff'
	ctx.globalAlpha = 1-tfrac;
	ctx.fillRect(0,0,cvs.width,cvs.height);
	ctx.globalAlpha = 1;
    }
    return (tfrac < 1);
};
Level.prototype.shakenbake = function (changescene) {
    this.background(false);
    this.draw_scene();

    var now = Date.now(), tfrac = (now - this.began)/2500;
    var sfrac = tfrac*tfrac;

    if (this.shakeout_sound == undefined) {
	this.shakeout_sound = true;
	snds.shakeout.play();
    }

    ctx.fillStyle = '#fff'
    ctx.globalAlpha = sfrac;
    ctx.fillRect(0,0,cvs.width,cvs.height);
    ctx.globalAlpha = 1;


    if (sfrac > 1) {
	sfrac = 1;
    }

    imgs[this.sun].ox = cvs.ox + gaussian()*100*sfrac;
    imgs[this.sun].oy = cvs.oy + gaussian()*100*sfrac;

    if (tfrac > 1) {
	changescene.call(this);
	delete this.shakeout_sound;
    }
    return (tfrac < 1);
};
Level.prototype.draw_scene = function () {
    for (var i in this.inscene) {
	this.inscene[i].render();
    }
    // and the curtain
    imgs.lefty.render();
    imgs.righty.render();
};
Level.prototype.moon_rise = function () {
    addOne(this.inscene,imgs.moon);
    return this.animate_rise(imgs.moon, [0.08*cvs.width,1.3*cvs.height],
			     [0.08*cvs.width,0.9*cvs.height], 800);
};
Level.prototype.moon_set = function () {
    var ret = this.animate_set(imgs.moon, [0.08*cvs.width,0.9*cvs.height],
				[0.08*cvs.width,1.3*cvs.height], 800);
    if (ret == false) {
	this.inscene = removeAll(this.inscene,imgs.moon);
    }
    return ret;
};
Level.prototype.sun_rise = function () {
    addOne(this.inscene,imgs[this.sun]);
    return this.animate_rise(imgs[this.sun], [cvs.width/2,1.3*cvs.height],
			     [cvs.width/2,0.9*cvs.height], 600);
};
Level.prototype.sun_set = function () {
    var ret = this.animate_set(imgs[this.sun], [cvs.width/2,0.9*cvs.height],
				[cvs.width/2,1.3*cvs.height],800);
    if (ret == false) {
	this.inscene = removeAll(this.inscene,imgs[this.sun]);
    }
    return ret;
};
Level.prototype.moon_burn = function () {
    return this.animate_set(imgs[this.sun], [cvs.ox, cvs.oy], [0.35*cvs.width,cvs.oy],1200);
};
Level.prototype.moon_burn2 = function () {
    if (this.moon_death == undefined) {
	this.moon_death = true;
	snds.moondeath.play();
    }
    var ret = this.dialog_palette_change('deadmoon');
    if (!ret) {
	delete this.moon_death;
    }
    return ret;
};
Level.prototype.moon_burn3 = function () {
    return this.animate_set(imgs[this.sun],  [0.35*cvs.width,cvs.oy], [cvs.ox, cvs.oy],1200);
};
Level.prototype.dialog_palette_change = function (to) {
    var ret = this.interp_palette(to,500);
    this.background(false);
    this.draw_scene();
    return ret;
};
Level.prototype.fade_out = function (changescene) {
    var now = Date.now();
    if ((now - this.began) < 150) {
	ctx.fillStyle = '#000'
	ctx.globalAlpha = (now - this.began)/250;
	ctx.fillRect(0,0,cvs.width,cvs.height);
	ctx.globalAlpha = 1;
    } else {
	this.dialog_animation = this.fade_in;
	this.began = now;
	changescene.call(this);
    }
    return true;
};
Level.prototype.fade_in = function () {
    var now = Date.now();
    this.background(false);
    this.draw_scene();
    if ((now - this.began) < 500) {
	ctx.fillStyle = '#000';
	ctx.globalAlpha = 1;
	ctx.fillRect(0,0,cvs.width,cvs.height);
	ctx.globalAlpha = 1;
	return true;
    } else if ((now - this.began) < 650) {
	ctx.fillStyle = '#000';
	var delay = (now - this.began - 500);
	ctx.globalAlpha = 1 - delay/150;
	ctx.fillRect(0,0,cvs.width,cvs.height);
	ctx.globalAlpha = 1;
	return true;
    } else {
	return false;
    }
};


// level building utils
var makeDialog = function (description,next) {
    return function (update) {
	if (update) {
	    if (description.hook != undefined) {
		description.hook.call(this);
	    }
	    if (next != undefined) {
		this.dialog = this.dialogs[next];
		return true;
	    } else {
		delete this.dialog;
		return false;
	    }
	}
	this.background(false);
	this.draw_scene();

	if (description.narrate == undefined) {
	    description.narrate = "";
	}
	this.narrate(description.narrate);

	if (description.moon != undefined) {
	    this.moon_dialog(description.moon);
	}
	if (description.sun != undefined) {
	    this.sun_dialog(description.sun);
	}
	if (description.action == undefined) {
	    delete this.dialog_animation;
	} else if (description.action.constructor == Array) {
	    this.actions = [].concat(description.action); // make a copy of this array
	    this.dialog_animation = function () {
		if (this.actions.length == 0) {
		    return false;
		}
		var ret = this[this.actions[this.actions.length-1]](description.args);
		if (! ret) {
		    this.actions.pop();
		    this.began = Date.now();
		}
		return true;
	    }
	} else {
	    this.dialog_animation = function () {return this[description.action](description.args);}
	}
	return true;
    };
};
var makeScene = function (dialogs,description,continuation) {
    // make sure you pass makeScene something that exists.
    // dialogs points to the current set of dialogs.
    // description is a bunch of tables describing the new dialogs to add
    // continuation is whether there should be more in dialogs after this.
    for (var i in description) {
	if (i == description.length-1 && !continuation) {
	    next = undefined;
	} else {
	    next = dialogs.length+1;
	}
	dialogs.push(makeDialog(description[i], next));
    }
};
		     

// ****************************** BEGIN LEVELS ***********************************************



// sleeping baby level tutorial 1
var SleepingBaby = function () {
    this.newimgs = [['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]]];
    this.newsnds = [['sleeping']];
    this.styletype = 'sleepingbaby';
    this.settingtype = 'baby';
    this.preload();
    this.dialog = this.dialogs[0];
};
SleepingBaby.prototype = new Level();
SleepingBaby.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.stars;
    this.bg.seq = [0,1,0,2];
    this.bg.anispeed = 200;
    snds.sleeping.play();
};
SleepingBaby.prototype.render_play = function (arg1) {
    Level.prototype.render_play.call(this,arg1);
    this.moon_dialog(this.tutorial_dialog);
};
SleepingBaby.prototype.nextpiece = function () {
    return 4; // cup piece
};
SleepingBaby.prototype.initialstate = [
    ".c.ccccccccccccccccccc",
    "....................c.",
];
SleepingBaby.prototype.dialogs = [];
makeScene(SleepingBaby.prototype.dialogs,
	  [
	      {
		  narrate:"you wake before moonrise. it's cold and dark. all you see is a few twinkling stars.\n \n you bide your time counting puzzle pieces while you wait for moon.",
		  action: 'moon_rise'
	      },
	      {
		  narrate:"when moon comes, he talks a while. you listen, but something is on your mind.\n \n [moon, it's cold and dark, and there's not much to do here. in all of your travels, have you found some way to make things better?]\n \n moon is quiet a moment and looks thoughtful, like moons do."
	      },
	      {
		  moon:"there is a way... a star can bring warmth and light. your star sleeps, but i can tell you how to wake it. should i?",
		  action: 'sun_rise'
	      },
	      {
		  narrate:"you consider the star baby a while. it's strange you've never thought about it before. [all right moon. how do i wake a star baby?]",
	      },
	      {
		  moon:"stars need food to live. surround a star by a ring of food, and it will burn. feed it enough, and it will shine.",
		  narrate:"[where do you get this food?] you ask."
	      }
	  ],true);
SleepingBaby.prototype.enter_tutorial = function (update) {
    if (update) {
	delete this.dialog;
	return true;
    }
    this.background(false);
    this.narrate("");
    this.draw_scene();
    this.moon_dialog("have you ever wondered about those puzzle pieces you like to count? \n star food!");
    this.tutorial_dialog = "try feeding him this one. \n \n use + to rotate the piece. use < and > to spin the star. when you like your position, press = to launch.";
    this.dialog_animation = function () {
	game.gotolater(game.tutorial1);
	delete this.dialog_animation;
	return true;
    };
    return true;
};
SleepingBaby.prototype.dialogs.push(SleepingBaby.prototype.enter_tutorial);



// sleeping baby negatives, tutorial 2
var SleepingBabyNeg = function () {
    this.newimgs = [['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]],
		   ['arrow']];
    this.styletype = 'sleepingbaby';
    this.settingtype = 'baby';
    this.preload();
    this.dialog = this.dialogs[0];
};
SleepingBabyNeg.prototype = new Level();
SleepingBabyNeg.prototype.wincondition = function () {
    for (var i = 0 ; i < board.nrows ; i++) {
	for (var j = 0 ; j < board.ncols ; j++) {
	    if (board[i][j] == COL_NEG) {
		return false;
	    }
	}
    }
    return true;
};
SleepingBabyNeg.prototype.nextpiece = function () {
    return 3; // straight
};
SleepingBabyNeg.prototype.initialstate = [
    ".............c.cnc.....",
    "...............ccc.....",
];
SleepingBabyNeg.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.inscene.push(imgs[this.sun]);
    this.inscene.push(imgs.moon);
    this.bg = imgs.stars;
    this.bg.seq = [0,1,0,2];
    this.bg.anispeed = 200;
    imgs.arrow.ox = 400;
    imgs.arrow.oy = 420;
};
SleepingBabyNeg.prototype.render_play = function (arg1) {
    Level.prototype.render_play.call(this,arg1);
    this.moon_dialog(this.tutorial_dialog);
};
SleepingBabyNeg.prototype.enter_tutorial = function (update) {
    if (update) {
	delete this.dialog;
	return true;
    }
    this.background(false);
    this.narrate("");
    this.draw_scene();
    this.moon_dialog("good, but look at this. you created a hole in the bottom ring that is covered with star food. stars can only eat rings at their surfaces, so it will not be useful to  go on until you clear that hole.");
    imgs.arrow.render();
    this.tutorial_dialog = "use a clean-up piece to fix your mess.\n \n press enter or space to switch between normal pieces and clean-up pieces, then open up that hole.";
    this.dialog_animation = function () {
	game.gotolater(game.tutorial2);
	delete this.dialog_animation;
	return true;
    };
    return true;
};

SleepingBabyNeg.prototype.dialogs = [SleepingBabyNeg.prototype.enter_tutorial];



// waking the baby up
var WakingBaby = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]]];
    this.styletype = 'sleepingbaby';
    this.settingtype = 'baby';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 3;
};
WakingBaby.prototype = new Level();
WakingBaby.prototype.gameovertext = "while stacking the pieces high does seem entertaining, you have to feed the baby complete rings to wake it up.";
WakingBaby.prototype.initialstate = [
    ".............c.c.c.....",
    "...............c.c.....",
];
WakingBaby.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.inscene.push(imgs.moon);
    this.inscene.push(imgs[this.sun]);
    this.bg = imgs.stars;
    this.bg.seq = [0,1,0,2];
    this.bg.anispeed = 200;
};
WakingBaby.prototype.dialogs = [];
makeScene(WakingBaby.prototype.dialogs,
	  [
	      {
		  moon: "there you go. i think if you feed this baby three rings it should wake up. then it will be bright and warm."
	      },
	  ],false);




// it turns out the baby requires work
var WokenBaby = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]]];
    this.newsnds = [['wakinbabies']];
    this.styletype = 'sleepingbaby';
    this.settingtype = 'baby';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 3;
    this.piececount = 0;
};
WokenBaby.prototype = new Level();
WokenBaby.prototype.nextpiece = function () {
    var pieces = [this.pdict.straight,this.pdict.t,this.pdict.t];
    return pieces[this.piececount++]; // cup piece
};
WokenBaby.prototype.gameovertext = "when you look around, moon is nowhere to be found. you spend eternity floating around a dead baby star, cold, and filled with remorse. try again.";
WokenBaby.prototype.postload = function () {
    Level.prototype.postload.call(this);
    imgs[this.sun].anispeed = 40;
    this.bg = imgs.stars;
    this.bg.seq = [0,1,0,2];
    this.bg.anispeed = 200;
    this.bg.fillhook = function () {
	imgs.sky.render();
    }
    this.inscene = [imgs[this.sun],imgs.moon];
    snds.wakinbabies.play();
};
WokenBaby.prototype.dialogs = [];
makeScene(WokenBaby.prototype.dialogs,
	  [
	      {
		  narrate: "as the third ring is absorbed into the baby head, you are flushed with anticipation. what palette changes await you?",
		  action: 'dialog_palette_change',
		  args: 'babyface',
		  hook: function () {
		      imgs[this.sun].seq = [0,1,2,3,4,5,6,7,8,9,10].concat(repeatN(10,80)).concat([10,9,8,7,6,5,4,3,2,1]);
		  }
	      },
	      {
		  moon: "this is called a bright baby.\n \n i am going to take a nap. i will talk to you tomorrow.",
		  action: 'moon_set'
	      },
	      {
		  narrate: "you stare up at this baby and wonder what will happen to it now. \n \n you look down at your puzzle pieces, but you only have three left: too few to count.  no matter. you decide to nap in the warm sunlight, too.",
		  action: 'fade_out',
		  args: function () {
		      this.bg.alpha = 0.25;
		      this.inscene.push(imgs.moon);
		      imgs.moon.oy = 0.9*cvs.height;
		      board.load_initial([
			  "ccc....ccccccccccccccc",
			  "ccc....ccccccccccccccc",
			  "ccc....ccccccccccccccc",
			  ".c.....cc.cccccc..cc.c",
			  ".......c...cc..c..c..."
		      ]);
		  }
	      },
	      {
		  moon: "you! you! wake up! i forgot you must keep feeding these things or they die. it picked up some food floating by, but you need to use your last three pieces to fill the rings. \n i hope you figure this out, i do not want to be caught with another dead baby.",
		  action: 'moon_set'
	      }
	  ],false);




// you agree to feed it just long enough for it to feed itself
var BigBaby = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]],
		   ['bigbaby',[cvs.ox,cvs.oy],[1,11]]];
    this.styletype = 'babyface';
    this.settingtype = 'baby';
    this.preload();
    this.dialog = this.dialogs[0];
};
BigBaby.prototype = new Level();
BigBaby.prototype.postload = function () {
    Level.prototype.postload.call(this);
    imgs[this.sun].seq = [0,1,2,3,4,5,6,7,8,9,10].concat(repeatN(10,80)).concat([10,9,8,7,6,5,4,3,2,1]);
    imgs[this.sun].anispeed = 40;
    this.bg = imgs.stars;
    this.bg.seq = [0,1,0,2];
    this.bg.anispeed = 200;
    this.bg.alpha = 0.25;
    this.bg.fillhook = function () {
	imgs.sky.render();
    }
    this.inscene = [imgs[this.sun]];
};
BigBaby.prototype.dialogs = [];
makeScene(BigBaby.prototype.dialogs,
	  [
	      {
		  narrate: "that baby seems to be fed, but you miss your puzzle pieces.",
		  action: 'moon_rise'
	      },
	      {
		  moon: "that was close. i suppose our days of napping are over for now. i am going out to find more puzzle pieces. i suggest you do the same.",
		  action: 'moon_set'
	      },
	      {
		  narrate: "instead of your usual afternoon habit of shivering and singing songs with moon, you float out into the void in search of puzzle pieces for the baby."
	      },
	      {
		  narrate: "as you work, you grow increasingly irritated. moon said you'd be warm, and he was right, but at what cost? he didn't say anything about constantly feeding the thing. \n \n when night comes, you are tired, so you sleep.",
		  action: 'fade_out',
		  args: function () {
		      this.settingtype = 'bigbaby';
		      this.reset_settings();

		      this.bg.alpha = 0.05;
		      imgs.moon.oy = 0.9*cvs.height;

		      imgs[this.sun].seq = [0,1,2,3,4,5,6,7,8,9,10].concat(repeatN(10,80)).concat([10,9,8,7,6,5,4,3,2,1]);
		      imgs[this.sun].anispeed = 40;
		      this.refresh_board();
		      this.styletype = 'bigbaby';
		      this.reset_style();
		      this.add_fill_hooks();
		      this.inscene = [imgs.moon, imgs[this.sun]];
		  }

	      },
	      {
		  narrate: "in the morning, moon is low in the sky. [moon, i don't want to spend all my time taking care of that baby,] you say. [there must be some way to keep warm without all this work.]\n \n moon is quiet a moment, and looks thoughtful like moons do."            
	      },
	      {
		  moon: "there is a way... all stars begin as babies, but eventually they grow up. if you feed a star baby enough, it will become a star man. then it will feed itself, and you can just bask in the glow.",
		  narrate: "[that sounds more like it.]"
	      },
	      {
		  moon: "why don't you feed it now? you must keep it well-fed if you want it to grow up.\n \n there is a timer at your top right that tells you how long you have before it starves. the top left tells you how many more rings it needs.",
		  action: 'moon_set'
	      }
	  ], false);




// moon turns out to suck at feeding
var MoonSucks = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['stars',[cvs.width/2,cvs.height/2],[1,3]],
		   ['bigbaby',[cvs.ox,cvs.oy],[1,11]]];
    this.styletype = 'bigbaby';
    this.settingtype = 'bigbaby';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 3;
    this.timer = 1/0;
    this.piececount = 0;
}
MoonSucks.prototype = new Level();
MoonSucks.prototype.nextpiece = function () {
    var pieces = [this.pdict.cup,this.pdict.t,this.pdict.t,this.pdict.u,this.pdict.l,this.pdict.t];
    return pieces[this.piececount++]; // cup piece
};
MoonSucks.prototype.postload = function () {
    Level.prototype.postload.call(this);
    imgs[this.sun].seq = [0,1,2,3,4,5,6,7,8,9,10].concat(repeatN(10,80)).concat([10,9,8,7,6,5,4,3,2,1]);
    imgs[this.sun].anispeed = 40;
    this.bg = imgs.stars;
    this.bg.seq = [0,1,0,2];
    this.bg.anispeed = 200;
    this.bg.alpha = 0.25;
    this.bg.fillhook = function () {
	imgs.sky.render();
    }
    this.inscene = [imgs[this.sun]];
};
MoonSucks.prototype.dialogs = [];
makeScene(MoonSucks.prototype.dialogs,
	  [
	      {
		  narrate: "as you finish your last ring, you notice you are running low on pieces.",
		  action: 'moon_rise',
	      },
	      {
		  narrate: "[you feed him for a little while and i'll go collect food,] you tell moon.",
	      },
	      {
		  moon: "sounds good.",
		  action: ['moon_set','sun_set']
	      },
	      {
		  narrate: "you start collecting pieces, but before long moon runs up.",
		  action: 'moon_rise',
		  hook: function () {
		      board.load_initial([
			  "ccc.c.ccccccccc.ccc...",
			  "ccc.c.ccccccccc.ccc...",
			  "ccc...cc..cccc...cc...",
			  ".......c.............."
		      ]);
		  }
	      },
	      {
		  moon: "hey you! my feeding skills are not what they used to be. i have tangled it up, but i am out of pieces. it is getting cranky. use what you have to feed it.",
		  action: ['moon_set','sun_rise']
	      }
	  ], false);;



// another day of feeding
var AnotherDay = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['bigbaby',[cvs.ox,cvs.oy],[1,11]]];
    this.newsnds = [['wakinbabies']];
    this.styletype = 'bigbaby';
    this.settingtype = 'bigbaby';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 5;
    this.timer = 140;
}
AnotherDay.prototype = new Level();
AnotherDay.prototype.postload = function () {
    Level.prototype.postload.call(this);
    imgs[this.sun].seq = [0,1,2,3,4,5,6,7,8,9,10].concat(repeatN(10,80)).concat([10,9,8,7,6,5,4,3,2,1]);
    imgs[this.sun].anispeed = 40;
    this.bg = imgs.sky;
    this.inscene = [imgs[this.sun]];
    snds.wakinbabies.play();
};
AnotherDay.prototype.dialogs = [];
makeScene(AnotherDay.prototype.dialogs,
	  [
	      {
		  narrate: "a job well done.\n \n a sentence with no predicate.",
		  action: 'moon_rise'
	      },
	      {
		  moon: "that was close. i don't think i could handle hearing another crying baby. the sound makes me want to throw up."
	      },
	      {
		  narrate: "annoyed by moon's incompetent feeding, you leave to collect more puzzle pieces for tomorrow.\n \n when night comes, you are tired, so you sleep.",
		  action: 'fade_out',
		  args: function () {
		      this.inscene = removeAll(this.inscene, imgs.moon);
		  }
	      },
	      {
		  narrate: "when you wake, moon is still asleep. it's about time to start feeding. you think five rings should work."
	      }
	  ], false);

// another puzzle after feeding
var AnotherPuzzle = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['bigbaby',[cvs.ox,cvs.oy],[1,11]]];
    this.styletype = 'bigbaby';
    this.settingtype = 'bigbaby';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 3;
    this.piececount = 0;
    this.timer = 1/0;
}
AnotherPuzzle.prototype = new Level();
AnotherPuzzle.prototype.nextpiece = function () {
    var pieces = [this.pdict.cup,this.pdict.l,this.pdict.t, this.pdict.l, this.pdict.t, this.pdict.l];
    return pieces[this.piececount++]; // cup piece
};
AnotherPuzzle.prototype.postload = function () {
    Level.prototype.postload.call(this);
    imgs[this.sun].seq = [0,1,2,3,4,5,6,7,8,9,10].concat(repeatN(10,80)).concat([10,9,8,7,6,5,4,3,2,1]);
    imgs[this.sun].anispeed = 40;
    this.bg = imgs.sky;
    this.inscene.push(imgs[this.sun]);
};
AnotherPuzzle.prototype.dialogs = [];
makeScene(AnotherPuzzle.prototype.dialogs,
	  [
	      {
		  narrate: "you think that's enough for now. you go off to collect some more pieces...",
		  action: 'sun_set',
		  hook: function () {
		      board.load_initial([
			  "cccncccccccccccccc..cc",
			  "cccccccccc.ccccccc...c",
			  "cc.cccccc..ccccccc...c"
		      ]);
		  }
	      },
	      {
		  narrate: "...but detecting a pattern to your life, you turn back early to see if there's some sort of puzzle to complete.",
		  action: 'sun_rise',
	      },
	      {
		  narrate: "when you return, the star baby has collected some debris. you must untangle that baby using only a few pieces and your prowess."
	      }
	  ], false);

// first man level
var StarMan = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['man',[cvs.ox,cvs.oy]],['bigbaby',[cvs.ox,cvs.oy],[1,11]]];
    this.newsnds = [['mansong']];
    this.styletype = 'bigbaby';
    this.settingtype = 'bigbaby';
    this.preload();
    this.dialog = this.dialogs[0];
};
StarMan.prototype = new Level();
StarMan.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.sky;
    this.inscene.push(imgs[this.sun]);
    snds.mansong.play();
};
StarMan.prototype.dialogs = [];
makeScene(StarMan.prototype.dialogs,
	  [
	      {
		  narrate: "satisfied, you go off to finish finding pieces. moon sleeps all day today, but it's just as well. he probably collects pieces about like he feeds. \n \n when night comes, you are tired, so you sleep.",
 		  action: 'fade_out',
		  args: function () {
		      this.settingtype = 'man';
		      this.reset_settings();

		      imgs.moon.oy = 0.9*cvs.height;

		      this.refresh_board();
		      this.styletype = 'manface';
		      this.reset_style();
		      this.add_fill_hooks();
		      this.inscene = [imgs.moon, imgs[this.sun]];
		  }
	      },
	      {
		  narrate: "when you wake, you are surprised to find that the star baby has become a little star man.\n \n moon is already awake, chatting with him about grown up subjects. you come over and catch the end of the conversation.",
	      },
	      {
		  sun: "...and that's why it's so important to use a firm handshake at the beginning of an interview!",
	      },
	      {
		  moon: "exactly!",
		  narrate: "[so, star man,] you begin."
	      },
	      {
		  sun: "please, call me wesley.",
		  narrate: "[wesley, i've been feeding you for a while now. moon said that once you were a grown up, you could fetch your own food.]"
	      },
	      {
		  sun: "well, let's talk about this. i have been providing you with the service of keeping you warm. have i not?",
		  narrate: "[well, yeah.]"
	      },
	      {
		  sun: "so, really, it would only be fair that you repay me in some way for this service. would it not?",
		  narrate: "[yeah, i guess that would be fair...]"
	      },
	      {
		  sun: "all right, so how about this: each day, you will feed me, and in return, i will shine on you.\n \n that sounds reasonable. does it not?",
		  narrate: "at least for the purpose of moving the story along, you agree that it seems reasonable. after all, wesley seems to be informed about these things.\n",
		  action: 'moon_set'
	      },
	      {
		  narrate: "you begin feeding him the food you collected yesterday. feeding a star baby seemed almost natural, but there's something perverse about feeding this star man."
	      }
	  ],false);



// wesley can't eat much better than a baby
var WesleyPuzzle = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['man',[cvs.ox,cvs.oy]]];
    this.styletype = 'manface';
    this.settingtype = 'man';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 3;
    this.piececount = 0;
    this.timer = 1/0;
}
WesleyPuzzle.prototype = new Level();
WesleyPuzzle.prototype.nextpiece = function () {
    var pieces = [this.pdict.t,this.pdict.u,this.pdict.l,this.pdict.t,this.pdict.t];
    return pieces[this.piececount++]; // cup piece
};
WesleyPuzzle.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.sky;
    this.inscene.push(imgs[this.sun]);
};
WesleyPuzzle.prototype.dialogs = [];
makeScene(WesleyPuzzle.prototype.dialogs,
	  [
	      {
		  narrate: "when you finish feeding wesley, you go off to collect some more pieces.",
		  action: 'sun_set',
		  hook: function () {
		      board.load_initial([
			  "cc...cccccccccccccc.c.",
			  "cc...cccccccccccccc...",
			  "cc...cccccccccccccc...",
			  "cc.....cc....c........"
		      ]);
		  }
	      },
	      {
		  narrate: "after a little searching, moon runs out.",
		  action: 'moon_rise',
	      },
	      {
		  moon: "you! you! help! wesley was trying to eat too much star food at once, and he's tangled himself inside! you've got to help him!",
		  action: 'moon_set'
	      },
	      {
		  narrate: "used to the routine, you head back with your limited collection of puzzle pieces.",
		  action: 'sun_rise'
	      }
	  ], false);




var BigMan = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['man',[cvs.ox,cvs.oy]],['bigman',[cvs.ox,cvs.oy]]];
    this.newsnds = [['mansong']];
    this.styletype = 'manface';
    this.settingtype = 'man';
    this.preload();
    this.dialog = this.dialogs[0];
};
BigMan.prototype = new Level();
BigMan.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.sky;
    this.inscene.push(imgs[this.sun]);
    snds.mansong.play();
};
BigMan.prototype.dialogs = [];
makeScene(BigMan.prototype.dialogs,
	  [
	      {
		  narrate: "when wesley is untangled, he doesn't say thank you but just keeps giving you that irritating smile.\n \n feeling uncomfortable, you go away to fetch the rest of your puzzle pieces.\n \n when night comes, you are tired, so you sleep.",
		  action: 'fade_out',
		  args: function () {
		      this.settingtype = 'bigman';
		      this.reset_settings();

		      imgs.moon.oy = 0.9*cvs.height;

		      this.refresh_board();
		      this.styletype = 'bigman';
		      this.reset_style();
		      this.add_fill_hooks();
		      this.inscene = [];
		  }
	      },
	      {
		  narrate: "when you wake the next day, you find moon sleeping near by. you wake him.",
		  action: 'moon_rise'
	      },
	      {
		  narrate: "[moon, it seems to me that i'm not the only one getting the benefit of wesley's warmth. isn't there some way to make things more fair?]\n \n moon is quiet a moment and looks thoughtful, like moons do.",
	      },
	      {
		  moon: "there is a way... you could feed wesley and i could collect star pieces. then we could both be warm and the work is split evenly."
	      },
	      {
		  narrate: "you agree. you go to feed wesley with the pieces you collected yesterday and moon goes to collect more for tomorrow.",
		  action: ['moon_set','sun_rise']
	      }
	  ],false);


// wesley becomes a refined gentleman
var BigManPuzzle = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['bigman',[cvs.ox,cvs.oy]]];
    this.styletype = 'bigman';
    this.settingtype = 'bigman';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 5;
    this.piececount = 0;
    this.timer = 4*60;
}
BigManPuzzle.prototype = new Level();
BigManPuzzle.prototype.gameovertext = "you need to feed wesley clean-up rings. try again from  your last save state.";
BigManPuzzle.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.sky;
    this.inscene.push(imgs[this.sun]);
};
BigManPuzzle.prototype.feast = function () {
    Level.prototype.feast();
    return Level.prototype.feast(COL_NEG);
};
BigManPuzzle.prototype.dialogs = [];
makeScene(BigManPuzzle.prototype.dialogs,
	  [
	      {
		  narrate: "when you're finished, moon hasn't come back yet. no matter. you use your newfound free time to warm yourself in wesley's sweet, sweet glow. you doze.",
		  action: 'fade_out',
		  args: function () {
		      board.load_initial([
			  "nnnnccccnncnnnnnnnn...",
			  "ccccccccccccccccccc...",
			  "cc.cccccccc.ccc.ccc...",
		      ]);
		  }
	      },
	      {
		  sun: "you! hey, you!",
		  narrate: "you wake to find wesley has been eating puzzle pieces while you slept.\n \n [why are you always eating on your own?] you ask. [you always mess it up.]"
	      },
	      {
		  sun: "wesley grows tired of this simple star food. wesley has a more refined palate now. if you feed him five rings of clean-up pieces, wesley will let you have tomorrow off and he will feed himself.",
		  narrate: "confused by wesley's grammar choices, but intrigued by his proposition, you agree."
	      }
	  ],false);

var Giant = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['bigman',[cvs.ox,cvs.oy]],['giant',[cvs.ox,cvs.oy]]];
    this.newsnds = [['giant']];
    this.styletype = 'bigman';
    this.settingtype = 'bigman';
    this.preload();
    this.dialog = this.dialogs[0];
};
Giant.prototype = new Level();
Giant.prototype.nextpiece = function () {
    return 2; // cup piece
}
Giant.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.sky;
    this.inscene.push(imgs[this.sun]);
    snds.giant.play();
};
Giant.prototype.dialogs = [];
makeScene(Giant.prototype.dialogs,
	  [
	      {
		  sun: "wesley is sated.",
		  narrate: "moon has not come back yet, but that's not your problem. when night comes, you fall into your first restful sleep in days. you look forward to a relaxing day of counting puzzle pieces.",
		  action: 'fade_out',
		  args: function () {
		      this.settingtype = 'giant';
		      this.reset_settings();

		      this.refresh_board();
		      board.load_initial([
			  ".c....cccccccccccccccc",
			  "..........c.........c.",
		      ]);

		      this.styletype = 'giant';
		      this.reset_style();
		      this.add_fill_hooks();
		      this.inscene = [imgs[this.sun]];
		  }
	      },
	      {
		  narrate: "when you wake in the morning, you notice that wesley has grown into a giant red star over night. he looks menacing, but today is your free day, so you start to go back to sleep."
	      },
	      {
		  sun: "you! it is time for wetsley to feed.",
		  narrate: "[but we had a deal. you said i could have today off, remember?]",
	      },
	      {
		  sun: "wetsley remembers, but now wetsley offers a new deal: you will feed him and he will not burn you to ash with his beautiful crimson rays.",
		  narrate: "alarmed, you begin to wonder where your puzzle pieces are. [moon never returned with the pieces last night. i'm not ready.]"
	      },
	      {
		  sun: "moon! moon!",
		  action: 'moon_rise'
	      },
	      {
		  moon: "wha?",
		  sun: "where are the pieces you fetched yesterday? it is wetsley's snack time."
	      },
	      {
		  moon: "oh, sorry. i am afraid i am not the food-fetch i once was. i have only found one type of piece.",
		  narrate: "moon hands you his pieces and goes off to fetch more. you begin your vacation day.",
		  action: 'moon_set'
	      }
	  ],false);



// wetsley demands double rings
var DoublePuzzle = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['giant',[cvs.ox,cvs.oy]]];
    this.styletype = 'giant';
    this.settingtype = 'giant';
    this.preload();
    this.dialog = this.dialogs[0];
    this.failure = false;
    this.lines = 8;
    this.timer = 3*60;
}
DoublePuzzle.prototype = new Level();
DoublePuzzle.prototype.gameovertext = "feed wetsley again: no singles. you may start from your last save state.";
DoublePuzzle.prototype.losecondition = function () {
    var now = Date.now();
    if (this.failure) {
	return true;
    }
    if ((now - this.began)/1000 > this.timer) {
	return true;
    } else {
	return false;
    }
};
DoublePuzzle.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.sky;
    this.inscene.push(imgs[this.sun]);
};
DoublePuzzle.prototype.feast = function () {
    var ret = Level.prototype.feast();
    if (ret == 1) {
	this.failure = true;
    }
    return ret;
};
DoublePuzzle.prototype.dialogs = [];
makeScene(DoublePuzzle.prototype.dialogs,
	  [
	      {
		  narrate: "finished, you begin to relax.",
		  action: ["moon_rise"],
	      },
	      {
		  narrate: "after a little time, moon returns with more pieces. you are happy to notice that he has a full set this time. you close your eyes, ready to enjoy what's left of your vacation day.",
		  action: 'fade_out',
		  args: function () {
		      board.load_initial([
			  "ccccccccccccccccccc...",
			  "ccccccccccccccccccc...",
			  "c.....ccc......c......"
		      ]);
		      this.inscene = [imgs.moon, imgs[this.sun]]; // reorder for the burn sequence
		  }
	      },
	      {
		  sun: "you! wetsley tires of these simple single rings. you will feed wetsley at least double rings or you will die.",
		  narrate: "[wetsley, i already fed you today,] you say. [this is getting out of hand. you'll have to wait until tomorrow to feed again.]"
	      },
	      {
		  sun: "you must feed wetsley double rings! do you think this is some kind of game?",
		  action: ["moon_set","moon_burn3","moon_burn2","moon_burn"]
	      },
	      {
		  narrate: "horrified by moon's demise, but given no time to grieve, you begin to feed wetsley only double rings or more."
	      }
	  ],false);




// wetsley demands triple rings
var TriplePuzzle = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['giant',[cvs.ox,cvs.oy]],['biggiant',[cvs.ox,cvs.oy]]];
    this.newsnds = [['giant']];
    this.styletype = 'giant';
    this.settingtype = 'giant';
    this.preload();
    this.dialog = this.dialogs[0];
    this.failure = false;
}
TriplePuzzle.prototype = new Level();
TriplePuzzle.prototype.gameovertext = "triples only. feed wetsley again.";
TriplePuzzle.prototype.losecondition = function () {
    var now = Date.now();
    if (this.failure) {
	return true;
    }
    if ((now - this.began)/1000 > this.timer) {
	return true;
    } else {
	return false;
    }
};
TriplePuzzle.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.sky;
    this.inscene.push(imgs[this.sun]);
    snds.giant.play();
};
TriplePuzzle.prototype.feast = function () {
    var ret = Level.prototype.feast();
    if (ret <= 2 && ret > 0) {
	this.failure = true;
    }
    return ret;
};
TriplePuzzle.prototype.dialogs = [];
makeScene(TriplePuzzle.prototype.dialogs,
	  [
	      {
		  narrate: "exhausted and friendless, you go to fetch more puzzle pieces for tomorrow. when night comes, you are tired, so you sleep.",
		  action: 'fade_out',
		  args: function () {
		      this.settingtype = 'biggiant';
		      this.reset_settings();

		      this.refresh_board();
		      board.load_initial([
			  ".c....cccccccccccccccc",
			  "..........c.........c.",
		      ]);

		      this.styletype = 'biggiant';
		      this.reset_style();
		      this.add_fill_hooks();
		      this.inscene = [imgs[this.sun]];
		      this.lines = 6;
		      this.timer = 140;
		  }
	      },
	      {
		  narrate: "when you wake, wetsley is bigger than ever. unsure what else you can do, you start to feed him."
	      },
	      {
		  sun: "only triples.",
		  narrate: "when wetsley speaks, he sounds exhausted. [just triples,] you say."
	      }
	  ],false);



// wetsley eats his last ring and becomes a toxic planetary nebula
var CleanupPuzzle = function (initialstate) {
    if (initialstate) {
	this.initialstate = initialstate;
    }
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['stars',[cvs.width/2,cvs.height/2],[1,3]],
		    ['biggiant',[cvs.ox,cvs.oy]],['skull',[cvs.ox, cvs.oy]]];
    this.styletype = 'biggiant';
    this.settingtype = 'biggiant';
    this.preload();
    this.dialog = this.dialogs[0];
}
CleanupPuzzle.prototype = new Level();
CleanupPuzzle.prototype.gameovertext = "you die of exposure to toxic fumes. try again from your last save state.";
CleanupPuzzle.prototype.wincondition = function () {
    for (var i = 0 ; i < board.nrows ; i++) {
	for (var j = 0 ; j < board.ncols ; j++) {
	    if (board[i][j] != COL_NON) {
		return false;
	    }
	}
    }
    return true;
};
CleanupPuzzle.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.sky;
    this.inscene.push(imgs[this.sun]);
};
CleanupPuzzle.prototype.dialogs = [];
makeScene(CleanupPuzzle.prototype.dialogs,
	  [
	      {
		  narrate: "as wetsley absorbs the last triple, he does not look well.",
		  action: ['shakeout','shakenbake'],
		  args: function () {
		      this.settingtype = 'skull';
		      this.reset_settings();
		      this.bg = imgs.stars;
		      this.bg.seq = [0,1,0,2];
		      this.bg.anispeed = 200;

		      this.refresh_board();
		      board.load_initial([
			  ".cnccnnncccccccccccccc",
			  ".cncccccccccccccnnnccc",
			  ".cccn.cccnnncccccccccc",
			  ".cncn.ccccccccccnnnccc",
			  ".cccn.cccnnncccccccccc",
			  ".c..c.ccccccccc....ccc",
			  "..........c.........c.",
		      ]);

		      this.styletype = 'skull';
		      this.reset_style();
		      this.add_fill_hooks();
		      this.inscene = [imgs[this.sun]];
		  }
	      },
	      {
		  narrate: "when your vision returns, you see that wetsley has burst into a green smoke surrounding the tiny skull of the star baby that you had ignored for millennia.\n \n before you can begin to feel relief, you realize the smoke is toxic. use clean-up pieces to remove it quickly. you have too much to live for!"
	      }
	  ], false);




// waiting
var Waiting = function () {
    this.newimgs = [['stars',[cvs.width/2,cvs.height/2],[1,3]],['skull',[cvs.ox, cvs.oy]]];
    this.newsnds = [['sleeping']];
    this.styletype = 'skull_nontoxic';
    this.settingtype = 'skull';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 10;
    this.timer = 1/0;
}
Waiting.prototype = new Level();
Waiting.prototype.gameovertext = "you have successfully died. however, between you and me, if you get ten rings we'll give you one last animation and a credits screen.";
Waiting.prototype.postload = function () {
    Level.prototype.postload.call(this);
    this.bg = imgs.stars;
    this.bg.seq = [0,1,0,2];
    this.bg.anispeed = 200;
    this.inscene.push(imgs[this.sun]);
    snds.sleeping.play();
};
Waiting.prototype.dialogs = [];
makeScene(Waiting.prototype.dialogs,
	  [
	      {
		  narrate: "with the smoke cleared, you are safe, but you are alone with only a narrator to remind you of your misery.\n \n you orbit the skull for centuries. fortunately, the centuries are uneventful and will go unnarrated."
	      },
	      {
		  narrate: "finally, even your narrator leaves you alone with your star baby skull and your puzzle pieces to do as you wish."
	      }
	  ], false);
