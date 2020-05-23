/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const enums = require("./enums");
const gameState = require("./gameState");

/*************************
 * DEFAULT GAME SETTINGS *
 *************************/
exports.gconf = {};
exports.gconf.grid_len = 3;				/* TTT is 3. Right? */
exports.gconf.plyr_no = 2; 				/* Number of players. */
exports.gconf.win_req = 3;				/* TTT is 3. Right? */
exports.gconf.size = 9; 				/* Do not change unless crazy. */
exports.gconf.checks = {				/* For checking winner. */
	horiz:[1,0],
	verti:[0,1],
	rdiag:[1,1],
	ldiag:[-1,1]
};

exports.createSession = function(){
	var session = {
		state	  : {},		/* The session's gameState. */
		isStarted : false,	/* Whether the game has started. Used in server. */
		numPlys	  :	0,		/* Number of players currently. */
		maxPlys	  :	0,		/* Max number of players as specified in game config. */
		numSpec   :	0,		/* Number of spectators. Actually unlimited. */
		gconfig   :	{},		/* Game config. Local default found in session.js. */
		online	  : false,	/* Whether the game is online. Determined by gui presence. */
		gui		  : null,	/* If present in init, online is true. */
		players	  : [],		/* Player's PIDs for checking. */
		specs	  : []		/* Spectator's PIDs for checking. */
	}
	return session;
}
		
/** Initializes the session. If gui is present, starts in local mode. Else server session mode. */
exports.init = function(sess,gconfig,gui){
	sess.gui = gui;
	sess.online = (gui==null);
	sess.gconfig = gconfig;
	sess.state = gameState.createState();
	sess.maxPlys = gconfig.plyr_no;
	return gameState.init(sess.state,sess.gconfig);
}

/** Restores session from saved gameState. */
exports.restoreSession = function(sess,state,gui){
	sess.gui = gui;
	sess.online = (gui==null);
	sess.state = state;
	sess.gconfig = state.conf;
	sess.maxPlys = sess.gconfig.plyr_no;
	sess.numPlys = sess.maxPlys;
	sess.players = sess.state.plyrs.slice();
	sess.specs = sess.players.slice();
	return;	
}

/** Adds player. */
exports.addPlayer = function(sess,pid){
	if(sess.isStarted){
		throw new Error(sess.started);
		return sess;
	}
	if(sess.maxPlys == sess.numPlys){
		throw new Error(enums.full);
		return sess;
	}
	sess.players.push(pid);
	exports.addSpec(sess,pid);
	sess.numPlys++;
	return sess;
}
		
/** Adds spectator. */
exports.addSpec = function(sess,pid){
	sess.specs.push(pid);
	sess.numSpec++;
	return sess;
}

/** Removes spectator. */
exports.removeSpec = function(sess,pid){
	let ind = sess.specs.indexOf(pid);
	if(ind > -1) sess.specs.splice(ind,1);
	else return sess;
	sess.numSpec--;
	return sess;
}

/** Get board. */
exports.getState = function(sess,pid){
	if(sess.specs.indexOf(pid) > -1){
		return sess.state;
	}else throw new Error(enums.locked);
	return;
}

/** Get session info. */
exports.getInfo = function(sess){
	let info = {
		started: sess.isStarted,
		numPlys: sess.numPlys,
		maxPlys: sess.maxPlys,
		gconf: sess.gconfig,
		plyrs: sess.players,
		specs: sess.specs,
		turn:  sess.state.turn,
		cur:   sess.state.plyr
	}
	return info;
}

/** Input into state. */
exports.setInput = function(sess,pid,move){
	if(sess.state.plyrs[sess.state.plyr] == pid){
		return gameState.place(sess.state,move);
	}else return Promise.reject(new Error(enums.locked));
}

/** Starts game. */
exports.start = function(sess){
	if(sess.numPlys != sess.maxPlys){
		throw new Error(enums.error);
		return sess;
	}
	if(sess.isStarted){
		throw new Error(enums.started);
		return sess;
	}
	if(!sess.online){
		sess.gui.receiveBoard(sess.state);
		sess.gui.receivePlayersInfo(sess.players);
	}
	sess.state.plyrs = sess.players;
	sess.isStarted = true;
	return sess;		
}