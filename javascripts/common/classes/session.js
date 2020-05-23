const enums = require("../utils/enums");
const gconf = require("../utils/enums");
const gameState = require("../classes/gameState");
const EventEmitter = require('events');

module.exports = class Session extends EventEmitter {
	state	  		= {};		//The session's gameState.
	isStarted 		= false;	//Whether the game has started. Used in server.
	num_players	  	= 0;		//Number of players currently.
	max_players		= 0;		//Max number of players as specified in game config.
	num_spectators 	= 0;		//Number of spectators. Actually unlimited.
	gconfig   		= gconf;	//Game config. Local default found in session.js.
	online	  		= false;	//Whether the game is online. Determined by gui presence.
	gui		  		= null;		//If present in init, online is true.
	player_ids	  	= [];		//Player's PIDs for checking.
	spectators	  	= [];		//Spectator's PIDs for checking.

	//Creates the session. If gui is present, starts in local mode. Else server session mode.
	constructor(gui){
		super();
		this.gui = gui;
		this.online = (gui==null);
	}

	//initializes the session
	init(gconfig){
		if(gconfig) this.gconfig = gconfig;
		this.max_players = this.gconfig.num_players;
		this.state = new gameState(this.gconfig);	
	}

	//restores session from saved gameState
	restoreSession(state){
		this.gconfig = state.config;
		this.max_players = this.gconfig.num_players;
		this.num_players = this.max_players;
		this.player_ids = state.player_ids.slice(); //copy
		this.spectators = state.player_ids.slice();
		this.state = new gameState(state,true);
	}

	addPlayer(pid){
		if(this.isStarted) throw new Error(enums.started);
		if(this.max_players == this.num_players) throw new Error(enums.full);
		this.player_ids.push(pid);
		this.addSpectator(pid);
		this.num_players++;
	}

	addSpectator(pid){
		this.spectators.push(pid);
		this.num_spectators++;
	}

	removeSpectator(pid){
		let ind = this.spectators.indexOf(pid);
		if(ind > -1) this.spectators.splice(ind,1);
		else return;
		this.num_spectators--;
	}

	getState(pid){
		if(this.spectators.indexOf(pid) > -1) return this.state;
		else throw new Error(enums.locked);
	}

	getInfo(){
		let info = {
			started: this.isStarted,
			numPlys: this.num_players,
			maxPlys: this.max_players,
			gconf: this.gconfig,
			plyrs: this.player_ids,
			specs: this.spectators,
			turn:  this.state.turns,
			cur:   this.state.cur_player_ind
		}
		return info;
	}

	setInput(pid,move){
		if(this.state.cur_player == pid) this.state.place(move);
		else throw new Error(enums.locked);
	}

	start(){
		if(this.isStarted) throw new Error(enums.started);
		this.isStarted = true;
		if(this.num_players != this.max_players) throw new Error(enums.error);
		if(!this.online){
			this.gui.receiveBoard(this.state);
			this.gui.receivePlayersInfo(this.players);
		}
		this.state.player_ids = this.player_ids;
	}
}