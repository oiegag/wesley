var Level = function () {
};
Level.prototype.preload = function () {
    this.newimgs = this.newimgs.concat([['nar_mid'],['nar_head'],['nar_foot']]);

    for (var i in STYLES[this.type]) {
	this[i] = STYLES[this.type][i];
    }

    this.color = COL_COR; // stores what the new pieces come in as
    this.rot = 0;
};
Level.prototype.startloading = function (these,constructor,where) {
    var loaded = 0;
    for (var i in these) {
	if (! (these[i][0] in where)) {
	    where[these[i][0]] = new constructor('images/'+these[i][0]+'.png',these[i][1],these[i][2]);
	} else if (where[these[i][0]].ready) {
	    loaded++;
	}
    }
    return loaded;
};
Level.prototype.load = function() {
    // generic load of the newimgs/newpats things
    var iloaded = this.startloading(this.newimgs,Sprite,imgs);
    var ploaded = this.startloading(this.newpats,Pattern,pats);
    if ((iloaded == this.newimgs.length) && (ploaded == this.newpats.length)) {
	return true;
    } else {
	return false;
    }
};
Level.prototype.postload = function () {
    this.began = Date.now();
    board = new Board(this.skip);
    ActivePiece.buildtypes();
    piece = new ActivePiece(COL_COR);

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

    ctx.fillStyle = '#fff';
    ctx.fillText(this.lines,20,20);
    ctx.fillText(Math.round(this.timer - (Date.now() - this.began)/1000),40,20);
    if (grid) {
	board.drawgrid();
    }
};
Level.prototype.render = function(tilt,showprev) {
    if (tilt == undefined) {
	tilt = 0;
    }
    if (showprev == undefined) {
	showprev = true;
    }

    this.background(true);

    imgs.sky.render();

    board.draw_arc(board.rs[0],0,2*PI);
    ctx.fillStyle = this.sunfill;
    ctx.fill();
    imgs[this.sun].render(tilt);

    if (showprev) {
	piece.draw_preview();
    }
    
    board.render(tilt);
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
Level.prototype.interp_palette = function () {
    var now = Date.now();
    if (this.type != 'dying') {
	if ((now - this.began)/1000 > this.timer - 30) {
	    this.type = 'dying';
	    for (var i in STYLES['dying']) {
		this[i] = STYLES['dying'][i];
	    }
	} else {
	    for (var i in STYLES['dying']) {
		var endrgb = css2rgb(STYLES['dying'][i]);
		var startrgb = css2rgb(STYLES[this.type][i]);
		var frac = (now - this.began)/(1000*(this.timer-30));
		var curr = [];
		for (var j = 0 ; j < 3 ; j++) {
		    curr[j] = Math.round(startrgb[j]*(1-frac) + endrgb[j]*frac);
		}
		this[i] = rgb2css(curr);
	    }
	}
    }

};
Level.prototype.wrapText = function (text,width) {
    // return the lines to use for text to make it width
    words = text.split(' ');
    lines = [];
    thisline = words[0];
    ctx.font = '18px mine';
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
    lines.push([thisline, ctx.measureText(thisline).width]);
    return lines;
};
Level.prototype.narrate = function (text) {
    var lines = this.wrapText(text,220);
    var startx = 650, starty = 90;
    ctx.fillStyle = '#000';
    ctx.drawImage(imgs.nar_head.image, startx-imgs.nar_head.image.width/2, starty - 20);
    starty += 20;
    var texty = starty;
    for (var i = 0 ; i < lines.length ; i++) {
	if ((texty + 18) > starty) {
	    ctx.drawImage(imgs.nar_mid.image, startx-imgs.nar_mid.image.width/2,starty - 20);
	    starty += 20;
	}
	ctx.fillText(lines[i][0],startx - lines[i][1]/2,texty);
	texty += 18;
    }
    ctx.drawImage(imgs.nar_foot.image, startx-imgs.nar_foot.image.width/2, starty - 20);
};
Level.prototype.dialog = function () {
    return false;
};

// sleeping baby level
var SleepingBaby = function () {
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['baby',[cvs.ox,cvs.oy],[1,11]]];
    this.newpats = [['rays_sun',[1,1]],['fire',[1,1]]];
    this.type = 'babyface';
    this.preload();
    this.dialog = this.dialog1;
};
SleepingBaby.prototype = new Level();
SleepingBaby.prototype.dialog1 = function () {
    this.background(false);
    this.narrate("you wake before moonrise. it's cold here and all you can see is black and the few far away stars. you bide your time counting puzzle pieces.");
    this.dialog = this.dialog2;
    return true;
};
SleepingBaby.prototype.dialog2 = function () {
    this.background(false);
    this.narrate("when moon comes, you talk a while. he wasn't always here and he tells you about the others he used to orbit before you some times.");
    this.dialog = this.dialog3;
    return true;
};
SleepingBaby.prototype.dialog3 = function () {
    this.background(false);
    this.narrate("'moon, it's not that i don't enjoy your company here, but i'm cold and it's dark, and most of the time there's nothing to do. in all of your travels, have you found some way to make things better than this?' you ask.\n moon is quiet a moment and looks thoughtful, like moons do.");
    delete this.dialog;
    return true;
};
// woken baby level
var WokenBaby = function () {
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['baby',[cvs.ox,cvs.oy],[1,11]]];
    this.newpats = [['rays_sun',[1,1]],['fire',[1,1]]];
    this.type = 'babyface';
    this.preload();
};
WokenBaby.prototype = new Level();
WokenBaby.prototype.postload = function () {
    Level.prototype.postload.call(this);
    imgs[this.sun].seq = repeatN(9,80).concat([9,8,7,6,5,4,3,2,1,0,1,2,3,4,5,6,7,8,9]);
    imgs[this.sun].anispeed = 40;
};
// first man level
var StarMan = function () {
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['man',[cvs.ox,cvs.oy]]];
    this.newpats = [['rays_sun',[1,1]],['fire',[1,1]]];
    this.type = 'manface';
    this.preload();
};
StarMan.prototype = new Level();

var STYLES = {
    babyface:{
	sky:'#000',
	sun:'baby',
	sunfill: '#cff',
	corona:'#cff',
	fire:'#660',
	preview: '#8383f9',
	corona_nm: 'rays_sun',
	fire_nm: 'fire',
	skip:0,
	grid:'#222',
	lines:1,
	timer:60*3
    },
    manface:{
	sky:'#add6ff',
	sun:'man',
	sunfill: '#fb0',
	corona:'#fc0',
	fire:'#660',
	preview: '#8383f9',
	corona_nm: 'rays_sun',
	fire_nm: 'fire',
	skip:2,
	grid:'#aaa',
	lines:6,
	timer:60*6
    },
    dying:{
	sky:'#f70',
	sunfill: '#f30',
	corona:'#f30',
	fire:'#660',
	preview: '#8383f9',
	grid:'#a20',
    }
};

