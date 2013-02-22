var Level = function () {
};
Level.prototype.preload = function () {
    this.newimgs = this.newimgs.concat([['nar_mid'],['nar_head'],['nar_foot'],['moon_head'],['moon_mid'],['moon_foot'],
					['moon',[0.08*cvs.width,0.9*cvs.height]]]);

    this.reset_style();
    for (var i in SETTINGS[this.settingtype]) {
	this[i] = SETTINGS[this.settingtype][i];
    }

    this.color = COL_COR; // stores what the new pieces come in as
    this.inscene = [];
    this.rot = 0;
    this.lines = 1;
};
Level.prototype.reset_style = function() {
    for (var i in STYLES[this.styletype]) {
	this[i] = STYLES[this.styletype][i];
    }

};
Level.prototype.gameovertext = "you, or something important to you is now dead. you may continue from your last save state.";
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
    imgs.moon.fillhook = function () {
	ctx.lineWidth = 1.25;
	ctx.fillStyle = lvl.moonfill;
	ctx.beginPath();
	ctx.arc(this.ox, this.oy, 78, 0, 2*PI);
	ctx.fill();
    }
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
    board = new Board(this.skip,this.initialstate);
    ActivePiece.buildtypes();
    piece = new ActivePiece(COL_COR,this.newpiece());

    this.add_fill_hooks();

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
Level.prototype.newpiece = function () {
    return randN(ActivePiece.prototype.pics.length);
};
Level.prototype.render_play = function(showprev) {
    // render the whole scene for when you're playing the game
    if (showprev == undefined) {
	showprev = true;
    }

    this.background(true);

    lvl.bg.render();

    if (showprev) {
	piece.draw_preview();
    }

    this.draw_scene();
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
    if (thisline.length > 0) {
	lines.push([thisline, ctx.measureText(thisline).width]);
    }
    return lines;
};
Level.prototype.draw_dialog = function (text, startx, endy, head, mid, foot, textwidth) {
    var lines = this.wrapText(text,textwidth);
    var sofar = 0, fontsz = 18, linesz = mid.image.height;
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
    this.draw_dialog(text, 640, 580, imgs.nar_head, imgs.nar_mid, imgs.nar_foot, 210);
};
Level.prototype.moon_dialog = function (text) {
    this.draw_dialog(text, 140, 445, imgs.moon_head, imgs.moon_mid, imgs.moon_foot, 210);
};
Level.prototype.dialog = function () {
    return false;
};
Level.prototype.dialog_animation = function () {
    return false;
};
Level.prototype.animate_rise = function (risewhat,from,to,inthesems) {
    this.background(false);
    this.bg.render();
    var now = Date.now(), tfrac = (now - this.began)/inthesems;

    sfrac = 1 - Math.exp(-(tfrac*5))*Math.cos(10*tfrac);
    risewhat.ox = Math.round((1-sfrac)*from[0] + sfrac*to[0]);
    risewhat.oy = Math.round((1-sfrac)*from[1] + sfrac*to[1]);
    this.draw_scene();

    return (tfrac < 1);
};
Level.prototype.animate_set = function (setwhat,from,to,inthesems) {
    this.background(false);
    this.bg.render();
    var now = Date.now(), tfrac = (now - this.began)/inthesems;

    sfrac = tfrac*tfrac;
    setwhat.ox = Math.round((1-sfrac)*from[0] + sfrac*to[0]);
    setwhat.oy = Math.round((1-sfrac)*from[1] + sfrac*to[1]);
    this.draw_scene();

    return (tfrac < 1);
};
Level.prototype.draw_scene = function () {
    for (var i in this.inscene) {
	this.inscene[i].render();
    }
};
Level.prototype.moon_rise = function () {
    this.inscene.moon = imgs.moon;
    return this.animate_rise(imgs.moon, [0.08*cvs.width,1.3*cvs.height],
			     [0.08*cvs.width,0.9*cvs.height], 800);
};
Level.prototype.moon_set = function () {
    var ret = this.animate_set(imgs.moon, [0.08*cvs.width,0.9*cvs.height],
				[0.08*cvs.width,1.3*cvs.height], 800);
    if (ret == false) {
	delete this.inscene.moon;
    }
    return ret;
};
Level.prototype.sun_rise = function () {
    this.inscene.sun = imgs[this.sun];
    return this.animate_rise(imgs[this.sun], [cvs.width/2,1.3*cvs.height],
			     [cvs.width/2,0.9*cvs.height], 800);
};
Level.prototype.dialog_palette_change = function (to) {
    var ret = this.interp_palette(to,500);
    this.background(false);
    this.bg.render();
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
    this.bg.render();
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
	lvl.bg.render();
	if (description.narrate == undefined) {
	    description.narrate = "";
	}
	this.narrate(description.narrate);

	if (description.moon != undefined) {
	    this.moon_dialog(description.moon);
	}
	this.draw_scene();
	if (description.action == undefined) {
	    delete this.dialog_animation;
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
		     


// sleeping baby level tutorial 1
var SleepingBaby = function () {
    this.newimgs = [['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]]];
    this.newpats = [['rays_sun',[1,1]],['fire',[1,1]]];
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
};
SleepingBaby.prototype.newpiece = function () {
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
		  narrate:"when moon comes, you talk awhile.\n \n he wasn't always here and you like listening to his stories about the others he orbited before you."
	      },
	      {
		  narrate:"after listening awhile, you speak up. 'moon, it's cold and dark, and there's not much to do here. in all of your travels, have you found some way to make things better?'\n \n moon is quiet a moment and looks thoughtful, like moons do."
	      },
	      {
		  moon:"there is a way... a star can bring warmth and light. your star sleeps, but i can tell you how to wake him. should i?",
		  action: 'sun_rise'
	      },
	      {
		  narrate:"'you mean that star baby?' as you wait for moon's response, you consider playing another game with fewer words ...",
	      },
	      {
		  narrate:"... but finally you decide against it. you turn your attention to the star baby. it's strange you hadn't thought about it before."
	      },
	      {
		  moon:"yes. stars need food to live. surround a star by a ring of food, and he will burn. feed him enough, and he will shine.",
		  narrate:"'where do you get this food?' you ask."
	      }
	  ],true);
SleepingBaby.prototype.enter_tutorial = function (update) {
    if (update) {
	delete this.dialog;
	return true;
    }
    this.background(false);
    this.bg.render();
    this.moon_dialog("have you ever wondered about those puzzle pieces you count? star food!");
    this.narrate("");
    this.draw_scene();
    this.dialog_animation = function () {
	imgs.moon.fillhook = function () {
	    lvl.moon_dialog("try feeding him this one. use left and right to maneuver. up rotates the piece. when you like your position, press down to launch.");
	};
	game.gotolater(game.tutorial1);
	delete this.dialog_animation;
	return true;
    };
    return true;
};
SleepingBaby.prototype.dialogs.push(SleepingBaby.prototype.enter_tutorial);



// sleeping baby negatives, tutorial 2
var SleepingBabyNeg = function () {
    this.newimgs = [['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]]];
    this.newpats = [['rays_sun',[1,1]],['fire',[1,1]]];
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
SleepingBabyNeg.prototype.newpiece = function () {
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
};
SleepingBabyNeg.prototype.enter_tutorial = function (update) {
    if (update) {
	delete this.dialog;
	return true;
    }
    this.background(false);
    this.bg.render();
    this.moon_dialog("good, but look at this. you created a hole in the bottom ring that is covered with star food. stars can only eat rings at their surfaces, so it will not be useful to  go on until you clear that hole.");
    this.narrate("");
    this.draw_scene();
    this.dialog_animation = function () {
	imgs.moon.fillhook = function () {
	    lvl.moon_dialog("use a clean-up piece to fix your mess.\n \n press enter or space to switch between normal pieces and clean-up pieces, then open up that hole.");
	};
	game.gotolater(game.tutorial2);
	delete this.dialog_animation;
	return true;
    };
    return true;
};

SleepingBabyNeg.prototype.dialogs = [SleepingBabyNeg.prototype.enter_tutorial];



// waking baby level
var WakingBaby = function () {
    this.newimgs = [['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]]];
    this.newpats = [['rays_sun',[1,1]],['fire',[1,1]]];
    this.styletype = 'sleepingbaby';
    this.settingtype = 'baby';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 3;
};
WakingBaby.prototype = new Level();
WakingBaby.prototype.postload = function () {
    if (board != undefined) {
	var saveboard = board;
	Level.prototype.postload.call(this);
	board = saveboard;
    } else {
	Level.prototype.postload.call(this);
    }
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
		  moon: "there you go. i think if you feed this baby three rings he should wake up. then it will be bright and warm."
	      },
	  ],false);




// woken baby level
var WokenBaby = function () {
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]]];
    this.newpats = [['rays_sun',[1,1]],['fire',[1,1]]];
    this.styletype = 'sleepingbaby';
    this.settingtype = 'baby';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 3;
    this.piececount = 0;
};
WokenBaby.prototype = new Level();
WokenBaby.prototype.newpiece = function () {
    var pieces = [3,3,3];
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
    this.inscene.push(imgs[this.sun]);
    this.inscene.push(imgs.moon);
};
WokenBaby.prototype.dialogs = [];
makeScene(WokenBaby.prototype.dialogs,
	  [
	      {
		  narrate: "as the third ring is absorbed into the babyhead, you are flushed with anticipation. what palette changes await you?",
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
		  narrate: "you look up at this baby and wonder what will happen to it now. you look at your puzzle pieces, but you only have three left: too few to count.  no matter. you decide to nap in the warm sunlight, too.",
		  action: 'fade_out',
		  args: function () {
		      this.bg.alpha = 0.25;
		      this.inscene.push(imgs.moon);
		      imgs.moon.oy = 0.9*cvs.height;
		      board.load_initial([
			  "ccccccccccccccccccc...",
			  "ccccccccccccccccccc...",
			  "ccccccccccccccccccc...",
		      ]);
		  }
	      },
	      {
		  moon: "you! you! wake up! i forgot to mention, you must keep feeding these things or they will die. he has picked up some food floating in space, but you need to use your last three pieces to complete the rings. \n i hope you figure out, i do not want to be caught with another dead baby.",
		  action: 'moon_set'
	      }
	  ],false);



// second baby level
var BigBaby = function () {
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['stars',[cvs.width/2,cvs.height/2],[1,3]],['baby',[cvs.ox,cvs.oy],[1,11]],
		   ['bigbaby',[cvs.ox,cvs.oy],[1,11]]];
    this.newpats = [['rays_sun',[1,1]],['fire',[1,1]]];
    this.styletype = 'babyface';
    this.settingtype = 'bigbaby';
    this.preload();
    this.dialog = this.dialogs[0];
    this.lines = 4;
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
    this.inscene.push(imgs[this.sun]);
};
BigBaby.prototype.dialogs = [];
makeScene(BigBaby.prototype.dialogs,
	  [
	      {
		  narrate: "as you launch your very last puzzle piece, you feel an overwhelming sense of loss.",
		  action: 'moon_rise'
	      },
	      {
		  moon: "that was close. i guess our days of napping are over for now. i am going out to find more puzzle pieces. i suggest you do the same.",
		  action: 'moon_set'
	      },
	      {
		  narrate: "instead of your usual afternoon habit of shivering and singing songs with moon, you float out into the void in search of puzzle pieces for the baby."
	      },
	      {
		  narrate: "as you work, you grow increasingly irritated. moon said you'd be warm, and he was right, but at what cost? he didn't say anything about constantly feeding the thing. \n when night comes, you are tired, so you sleep.",
		  action: 'fade_out',
		  args: function () {
		      this.bg.alpha = 0.05;
		      imgs.moon.oy = 0.9*cvs.height;
		      this.sun = 'bigbaby';
		      this.skip = 1;
		      board = new Board(this.skip,this.initialstate);
		      this.styletype = 'bigbaby';
		      this.reset_style();
		      this.add_fill_hooks();
		      this.inscene = [imgs.moon, imgs[this.sun]];
		  }

	      },
	      {
		  narrate: "in the morning, moon is low in the sky. 'moon, i don't want to spend all my time collecting puzzle pieces,' you say. 'there must be some way to keep warm without all this work.'\n \n moon is quiet a moment and looks thoughtful like moons do."            
	      },
	      {
		  moon: "there is a way... all stars begin as babies, but eventually they grow up. if you feed a star baby enough, it will become a star man. then it will feed itself, and you can just bask in the glow."
	      },
	      {
		  narrate: "'that sounds more like it.'"
	      },
	      {
		  moon: "why don't you feed it now? you must keep it well-fed if you want it to grow up.\n \n there is a timer at your top left that tells you how long you have before it starves. the top right tells you how many more rings it needs."
	      }
	  ], false);



// first man level
var StarMan = function () {
    this.newimgs = [['sky',[cvs.width/2,cvs.height/2]],['man',[cvs.ox,cvs.oy]]];
    this.newpats = [['rays_sun',[1,1]],['fire',[1,1]]];
    this.styletype = 'manface';
    this.settingtype = 'man';
    this.preload();
};
StarMan.prototype = new Level();

var STYLES = {
    sleepingbaby:{
	sky:'#001',
	sunfill: '#cff',
	moonfill: '#cff',
	corona:'#cff',
	fire:'#660',
	preview: '#8383f9',
	grid:'#222',
    },
    babyface:{
	sky:'#025',
	sunfill: '#ffe16c',
	moonfill: '#cff',
	corona:'#e6c440',
	fire:'#660',
	preview: '#8383f9',
	grid:'#037',
    },
    bigbaby:{
	sky:'#035',
	sunfill: '#ffe16c',
	moonfill: '#cff',
	corona:'#e6c440',
	fire:'#660',
	preview: '#8383f9',
	grid:'#037',
    },
    manface:{
	sky:'#add6ff',
	sunfill: '#fb0',
	moonfill: '#cff',
	corona:'#fc0',
	fire:'#660',
	preview: '#8383f9',
	grid:'#aaa',
    },
    dying:{
	sky:'#f70',
	sunfill: '#f30',
	moonfill: '#cff',
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
	timer:1/0
    },
    bigbaby:{
	sun:'baby',
	corona_nm:'rays_sun',
	fire_nm:'fire',
	skip:0,
	timer:5*60,
    },
    man:{
	sun:'man',
	corona_nm:'rays_sun',
	fire_nm:'fire',
	skip:2,
	lines:6,
	timer:60*6
    }
};
