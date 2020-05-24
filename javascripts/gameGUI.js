const enums = require("./common/utils/enums");
 
/************************
 * DEFAULT GUI SETTINGS *
 ************************/
window.guiConfig = {};
guiConfig.cont = document.querySelector("#gamePg .TTTgame"); 	/* Class of container for state. */
guiConfig.grid_pfx = "grid";									/* Assumed class prefix of grid boards. */
guiConfig.sqr_pfx = "btn";										/* Assumed class prefix of grid squares. */

window.musicPlaying = false;
window.onclick = function(){
	if(!musicPlaying) document.querySelector('#bgMusic').play();
	musicPlaying = true;
};

window.gui = {
	guiconf: {}, 	/* GUI config. */
	gconf:	 {}, 	/* Game config. */
	input:   null,	/* For online mode. */
	state:   {},	/* Local copy of gameState. */
	players: [],	/* List of colours for players. */
	hist:	 [],	/* Histogram of entire game. */
	online:  false,	/* Whether game is in online mode. */
	btnList: [],	/* A list of all grid buttons. */
	olyList: [],	/* Ordered list of overlays. */
	isProc:  false, /* Whether the grid is still processing input. */
	
	/** Generates the button grid, player colours and links the buttons. */
	init:async function(guiConfig,gameConfig,online){
		this.guiconf = guiConfig;
		this.gconf = gameConfig;
		this.online = online;
		
		//Reset variables.
		this.guiconf.plyColors = [];
		this.btnList = [];
		this.olyList = [];
		
		this.hist.push([enums.info,"ONLINE",this.online]);
		this.guiconf.cont.innerHTML = "";
		
		for(let y1 = 1;y1 <= this.gconf.grid_len;y1++){
			for(let x1 = 1;x1 <= this.gconf.grid_len;x1++){
				let grid = document.createElement("div");
				grid.style.setProperty("grid-column",`${x1} / span 1`);
				grid.style.setProperty("grid-row",`${y1} / span 1`);
				grid.classList.add("grid");
				
				let overlay = document.createElement("div");
				overlay.style.setProperty("grid-column",`1 / span ${this.gconf.grid_len}`);
				overlay.style.setProperty("grid-row",`1 / span ${this.gconf.grid_len}`);
				overlay.classList.add("gridOly");
				grid.appendChild(overlay);
				this.olyList.push(overlay);
					
				for(let y2 = 1;y2 <= this.gconf.grid_len;y2++){
					for(let x2 = 1;x2 <= this.gconf.grid_len;x2++){
						let btn = document.createElement("button");
						btn.style.setProperty("grid-column",`${x2} / span 1`);
						btn.style.setProperty("grid-row",`${y2} / span 1`);
						btn.setAttribute(this.guiconf.grid_pfx,(y1-1)*this.gconf.grid_len+x1);
						btn.setAttribute(this.guiconf.sqr_pfx,(y2-1)*this.gconf.grid_len+x2);
						btn.addEventListener("click", this.btn_link);
						btn.disabled = true;
						btn.classList.add("sqr");
						grid.appendChild(btn);
						this.btnList.push(btn);
					}
				}
				this.guiconf.cont.appendChild(grid);
			}
		}
	},
	
	/** Called by server to notify GUI of players. */
	receivePlayersInfo:function(playerList){
		//TODO future retrieve player Icons
		this.players = playerList;
		this.guiconf.plyColors = [];
		for(let i = 0; i < this.players.length; i++) this.guiconf.plyColors.push(`hsl(${i * (360 / this.players.length) % 360},100%,50%)`);
	},
	
	/** Called by server when sending over gameState. */
	receiveBoard:async function(state){		
		this.state = state;
		this.hist.push([enums.turn,this.state.cur_player_ind]);
		window.updateHeader();
		return this.updateContainer();
	},
	
	/** Called by server to update local game on history of game. */
	receiveHist:function(histList){
		for(let hist of histList) this.hist.push(hist);
	},
	
	/** Used by server to ensure latest hists are sent. */
	getHistLen:function(){
		return this.hist.length;	
	},

	/** Updates container to reflect state with some animations. */
	updateContainer:async function(){
		for(let btn of gui.btnList) btn.disabled = true; //Very immediate.
		//Individual buttons have to be controlled in some cases.
		for(let c = 0; c < gui.btnList.length; c++){
			let btn = gui.btnList[c];
			let i = btn.getAttribute(gui.guiconf.grid_pfx);
			let n = btn.getAttribute(gui.guiconf.sqr_pfx);
			let isWin = false;
			if(gui.state.grid[i].winner != null) isWin = true;
			else if(gui.state.grid[i][n].winner != null) isWin = true;
			else if(gui.state.cur_board != null && gui.state.cur_board != i) isWin = false;
			else if(gui.state.cur_player != client.pid) isWin = false;
			else btn.disabled = false;
			
			if(isWin){
				btn.style.setProperty("z-index", "3");
				if(gui.state.grid[i].winner != -1 && gui.state.grid[i].winner != null){
					btn.style.setProperty("transition","background-color 0.5s ease-in 0s");
					btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i].winner], "important");
				}else{
					btn.style.setProperty("transition","background-color 0s");
					btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i][n].winner], "important");
				}
			}
		}
		
		//Controls overlays.
		for(let i = 1; i <= gui.olyList.length; i++){
			let enabled = false;
			let overlay = gui.olyList[i-1];
			if(gui.state.player_ids.length < gui.state.config.num_players) enabled = true;
			else if(gui.state.cur_player != client.pid) enabled = true;	
			else if(gui.state.cur_board == null | gui.state.cur_board == i) enabled = false;
			else enabled = true;

			if(enabled){
				overlay.style.setProperty("transition","opacity 0.2s ease-in 0s");
				overlay.style.setProperty("opacity", "0.6");
			}else{
				overlay.style.setProperty("transition","opacity 0s");
				overlay.style.setProperty("opacity", "0");
			}
		}

		gui.guiconf.cont.style.setProperty("color",gui.guiconf.plyColors[gui.state.cur_player_ind]);
		if(gui.state.winner != null){
			gui.gridWinAnim();
			menuWinAnim();
		}
	},
	
	/** Winning animation for grid. */
	gridWinAnim: function(){
		this.btnList.forEach(btn => {
			btn.disabled = true;
			btn.style.setProperty("transition","background-color 0.5s ease-in 0s");
			wait(200).then(() => {
				btn.style.setProperty("z-index", "3");
				btn.style.setProperty("background-color",this.guiconf.plyColors[this.state.winner],"important");
			}); /* waits a while for previous transitions for effect. */
		});
		this.guiconf.cont.style.setProperty("animation","winGlow 3s linear 0s infinite");
	},
	
	/** EventListener for buttons. Forwards to state.place(). */
	btn_link:function(e){
		if(gui.isProc) return;
		gui.isProc = true;
		let btn = e.target;
		if(btn.disabled) return;
		let move = [btn.getAttribute(gui.guiconf.grid_pfx),btn.getAttribute(gui.guiconf.sqr_pfx)];
		if(gui.online){
			gui.guiconf.cont.style.setProperty("color","white");
			client.makeMove(move);
		}else{
			gui.guiconf.cont.style.setProperty("color","white");
			gui.state.place(move);
			gui.updateContainer();
			gui.hist.push([enums.move,move]);
		}
		gui.isProc = false;
	}
}	