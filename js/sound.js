/*
   sound.js -- sound setup

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

// a single file object with player

var SoundFile = function (filenm,parent) {
    this.playing = false;
    this.loaded = false;
    this.error = false;
    this.parent = parent;
    this.filenm = filenm;
    this.load();
}
SoundFile.prototype.load = function () {
    if (! this.loaded) {
	this.file = new Audio(this.filenm);
	this.file.parent = this;
	this.file.addEventListener('canplaythrough',function () {
	    this.parent.loaded = true;
	    this.parent.parent.register(this.parent,true);
	    this.removeEventListener('canplaythrough', arguments.callee, false);
	    this.addEventListener('ended',function () {
		this.parent.playing = false;
	    }, false);
	}, false);
	this.file.addEventListener('error',function () {
	    this.parent.error = true;
	    this.parent.loaded = true;
	    this.parent.parent.register(this.parent,false);
	    this.removeEventListener('error', arguments.callee, false);
	}, false);
    }
};
SoundFile.prototype.playagainlater = function () {
    this.file.removeEventListener('ended', this.currentroutine, false);
    this.file.addEventListener('ended',function () {
	this.parent.playing = false;
	this.parent.play();
	this.removeEventListener('ended', arguments.callee, false);
	this.addEventListener('ended',function () {
	    this.parent.playing = false;
	}, false);
    }, false);
};
SoundFile.prototype.set_callback = function (what) {
    this.currentroutine = function () {
	this.parent.playing = false;
	what();
	this.removeEventListener('ended', arguments.callee, false);
	this.addEventListener('ended',function () {
	    this.parent.playing = false;
	},false);
    };
    this.file.removeEventListener('ended', this.currentroutine, false);
    this.file.addEventListener('ended',this.currentroutine, false);
};
SoundFile.prototype.end = function () {
    if (! this.playing || this.error) {
	return;
    }
    this.file.removeEventListener('ended', this.currentroutine, false);
    this.file.addEventListener('ended',function () {
	this.parent.playing = false;
    }, false);
    this.file.currentTime = this.file.duration;
};
SoundFile.prototype.do_pause = function () {
    if (! this.playing || this.error) {
	return;
    }
    this.file.pause();
    this.playing = false;
};
SoundFile.prototype.play = function () {
    if (this.playing || this.error) {
	return;
    }

    if (this.loaded) {
	this.file.play();
	this.playing = true;
    }
};

// a wrapper to try different formats on failure
var Sound = function (trythis,playhook) {
    this.playonload = false;
    this.trying = 0;
    this.trylist = ['snd/'+trythis+'.ogg','snd/'+trythis+'.mp3'];
    this.loaded = false;
    this.error = false;

    if (playhook == undefined) {
	playhook = "sfx";
    }
    if (playhook == "sfx") {
	this.playhook = this.sfx_check;
    } else if(playhook == "music") {
	this.playhook = this.music_check;
    }

    if (typeof(Audio) == "undefined") { // no html5 sound support at all? then just fail.
	this.loaded = true;
	this.error = true;
    } else if (playhook == "sfx") {
	this.kid = new SoundFile(this.trylist[this.trying],this);
    } else {
	this.onhold = true;
    }
};
Sound.prototype.startloading = function () {
    if (this.onhold) {
	this.kid = new SoundFile(this.trylist[this.trying],this);
	delete this.onhold;
    }
};
Sound.prototype.register = function(which,working) {
    // indicate success or failure of a particular file
    if (working) {
	this.mine = which;
	this.loaded = true;
	if (this.playonload) {
	    this.mine.play();
	}
	if (this.setcallbackonload) {
	    this.mine.set_callback(this.callback);
	}
    } else {
	this.trying++;
	if (this.trying == this.trylist.length) {
	    this.loaded = true;
	    this.error = true;
	} else {
	    this.kid = new SoundFile(this.trylist[this.trying],this);
	}
    }
};
Sound.prototype.play = function () {
    if (this.loaded && ! this.error && this.playhook()) {
	if (this.mine.playing) {
	    this.mine.playagainlater();
	} else {
	    this.mine.play();
	}
    } else if (this.playhook()) {
	this.playonload = true;
    }
};
Sound.prototype.set_callback = function (what) {
    if (this.loaded && ! this.error && this.playhook()) {
	this.mine.set_callback(what);
    } else if (this.playhook()) {
	this.setcallbackonload = true;
	this.callback = what;
    }
};
Sound.prototype.end = function () {
    if (this.loaded && ! this.error) {
	this.mine.end();
    }
};
Sound.prototype.pause = function () {
    if (this.loaded && ! this.error) {
	this.mine.do_pause();
    }
};
Sound.prototype.music_check = function () {return game.music};
Sound.prototype.sfx_check = function () {return game.sfx};
