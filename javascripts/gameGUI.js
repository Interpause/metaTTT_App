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

const gameState = require("./gameState");
const enums = require("./enums");
 
/************************
 * DEFAULT GUI SETTINGS *
 ************************/
window.guiConfig = {};
guiConfig.cont = document.querySelectorAll(".TTTgame")[0]; 		/* Class of container for state. */
guiConfig.grid_pfx = "grid";									/* Assumed class prefix of grid boards. */
guiConfig.sqr_pfx = "btn";										/* Assumed class prefix of grid squares. */

window.musicPlaying = false;
window.onclick = function(){
	if(!musicPlaying) document.getElementById('bgMusic').play();
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
	init:function(guiConfig,gameConfig,online){
		this.guiconf = guiConfig;
		this.gconf = gameConfig;
		this.online = online;
		
		//Reset variables.
		this.guiconf.plyColors = [];
		this.btnList = [];
		this.olyList = [];
		
		this.hist.push([enums.info,"ONLINE",this.online]);
		this.guiconf.cont.innerHTML = "";
		
		let chain = Promise.resolve();
		for(let y1 = 1;y1 <= this.gconf.grid_len;y1++){
			for(let x1 = 1;x1 <= this.gconf.grid_len;x1++){
				chain = chain.then(() => {
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
					
					let chain2 = Promise.resolve();
					for(let y2 = 1;y2 <= this.gconf.grid_len;y2++){
						for(let x2 = 1;x2 <= this.gconf.grid_len;x2++){
							chain2 = chain2.then(() => {
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
							});
							if(((y2-1)*this.gconf.grid_len+x2)%this.gconf.grid_len == 0){ //Keeps code in same event loop. Conveniently, the more ridiculous, the more laggy, though still async.
								chain2 = chain2.then(() => {return new Promise((callback) => {setTimeout(callback,0)})});
							}
						}
					}
					return chain2.then(() => {this.guiconf.cont.appendChild(grid)});
				});
			}
		}
		return chain;
	},
	
	/** Called by server to notify GUI of players. */
	receivePlayersInfo:function(playerList){
		//TODO future retrieve player Icons
		this.players = playerList;
		this.guiconf.plyColors = [];
		for(let i = 0; i < this.players.length; i++){
			this.guiconf.plyColors.push(`hsl(${i * (360 / this.players.length) % 360},100%,50%)`);
		}
	},
	
	/** Called by server when sending over gameState. */
	receiveBoard:function(state){		
		this.state = state;
		this.updateContainer();
		updateHeader();
		this.hist.push([enums.turn,this.state.plyr]);
		return;
	},
	
	/** Called by server to update local game on history of game. */
	receiveHist:function(histList){
		for(hist in histList){
			this.hist.push(hist);
		}
		return;
	},
	
	/** Used by server to ensure latest hists are sent. */
	getHistLen:function(){
		return this.hist.length;	
	},

	/** Updates container to reflect state with some animations. */
	updateContainer:function(){
		let chain = Promise.resolve();
		for(let btn of gui.btnList) btn.disabled = true; //Very immediate.
		//Individual buttons have to be controlled in some cases.
		for(let c = 0; c < gui.btnList.length; c++){
			let btn = gui.btnList[c];
			let i = btn.getAttribute(gui.guiconf.grid_pfx);
			let n = btn.getAttribute(gui.guiconf.sqr_pfx);
			let isWin = false;
			if(gui.state.grid[i].winner != -1) isWin = true;
			else if(gui.state.grid[i][n].winner != -1) isWin = true;
			else if(gui.state.curLock != -1 && gui.state.curLock != i) isWin = false;
			else if(gui.state.plyrs[gui.state.plyr] != client.pid) isWin = false;
			else btn.disabled = false;
			
			if(isWin) chain = chain.then(() => {
				btn.style.setProperty("z-index", "3");
				if(gui.state.grid[i].winner != -1 && gui.state.grid[i].winner != null){
					btn.style.setProperty("transition","background-color 0.5s ease-in 0s");
					btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i].winner], "important");
				}else{
					btn.style.setProperty("transition","background-color 0s");
					btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i][n].winner], "important");
				}
			}).then((callback) => {return setTimeout(callback,0)});
		}
		
		//Controls overlays.
		for(let i = 1; i <= gui.olyList.length; i++){
			let enabled = false;
			let overlay = gui.olyList[i-1];
			if(gui.state.plyrs.length < gui.state.conf.plyr_no) enabled = true;
			else if(gui.state.plyrs[gui.state.plyr] != client.pid) enabled = true;	
			else if(gui.state.curLock == -1) enabled = false;
			else if(i == gui.state.curLock) enabled = false;
			else enabled = true;
			
			if(enabled) chain = chain.then(() => {
					overlay.style.setProperty("transition","opacity 0.2s ease-in 0s");
					overlay.style.setProperty("opacity", "0.6");
				}).then((callback) => {return setTimeout(callback,0)});
			else{
				overlay.style.setProperty("transition","opacity 0s");
				overlay.style.setProperty("opacity", "0");
			}
		}
		return chain.then(() => {
			gui.guiconf.cont.style.setProperty("color",gui.guiconf.plyColors[gui.state.plyr]);	
			if(gui.state.winner != -1){
				gui.gridWinAnim();
				menuWinAnim();
			}
		});
	},
	
	/** Change into animation function for rainbows and what not. /
	updateContainer:function(){
		return new Promise((callback,reject) => {
			let grayQ = [];
			let whiteQ = [];
			let winQ = [];
			let swinQ = [];
			
			let promises = [];
			gui.btnList.forEach((btn) => {
				promises.push(new Promise((callback) => {
					let i = btn.getAttribute(gui.guiconf.grid_pfx);
					let n = btn.getAttribute(gui.guiconf.sqr_pfx);
					if(gui.state.plyrs.length != gui.state.conf.plyr_no){
						grayQ.push(btn);
						callback();
						return;
					}
					if(gui.state.grid[i].winner != -1) swinQ.push(btn);
					else if(gui.state.grid[i][n].winner != -1) winQ.push(btn);
					else if(gui.state.curLock != -1 && gui.state.curLock != i) grayQ.push(btn);
					else if(gui.state.plyrs[gui.state.plyr] != client.pid) grayQ.push(btn);
					else whiteQ.push(btn);
					
					callback();
				}));
			});
			
			Promise.all(promises).then(() => {
				let iters = 0;
				let bufTime = (750-50) / gui.btnList.length; //There is extra till grid reappears in the anim.
				bufTime = (bufTime < this.animBuffTime)? buffTime: this.animBuffTime;
				//In order of importance of course. The things I do for anti GUI hang...
				winQ.forEach((btn) => {
					setTimeout(() => {
						let i = btn.getAttribute(gui.guiconf.grid_pfx);
						let n = btn.getAttribute(gui.guiconf.sqr_pfx);
						btn.disabled = true;
						btn.style.setProperty("transition","background-color 0s");
						btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i][n].winner], "important");
					}, bufTime * iters);
					iters++;
				});
				grayQ.forEach((btn) => {
					setTimeout(() => {
						btn.disabled = true;
						btn.style.setProperty("transition","background-color 0.2s ease-in 0s");
						btn.style.setProperty("background-color", "gray");
					}, bufTime * iters);
					iters++;
				});
				whiteQ.forEach((btn) => {
					setTimeout(() => {
						btn.disabled = false;
						btn.style.setProperty("transition","background-color 0s");
						btn.style.setProperty("background-color", "white");
					}, bufTime * iters);
					iters++;
				});
				swinQ.forEach((btn) => {
					setTimeout(() => {
						let i = btn.getAttribute(gui.guiconf.grid_pfx);
						btn.disabled = true;
						btn.style.setProperty("transition","background-color 0.5s ease-in 0s");
						btn.style.setProperty("background-color", gui.guiconf.plyColors[gui.state.grid[i].winner], "important");
					}, bufTime * iters);
					iters++;
				});
				
				gui.guiconf.cont.style.setProperty("color",gui.guiconf.plyColors[gui.state.plyr]);		
				if(gui.state.winner != -1){
					gui.gridWinAnim();
					menuWinAnim();
				}
				callback();
			}).catch((e) => {
				reject(e);
				return;
			});
		});
	},
	*/
	
	/** Winning animation for grid. */
	gridWinAnim: function(){
		this.btnList.forEach(btn => {
			btn.disabled = true;
			btn.style.setProperty("transition","background-color 0.5s ease-in 0s");
			setTimeout(() => {
				btn.style.setProperty("z-index", "3");
				btn.style.setProperty("background-color",this.guiconf.plyColors[this.state.winner],"important");
			},200); /* waits a while for previous transitions for effect. */
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
			gui.isProc = false;
		}else{
			gui.guiconf.cont.style.setProperty("color","white");
			let res = gameState.place(gui.state,move).then(() => {
				gui.updateContainer();
				gui.hist.push([enums.move,move]);
				gui.isProc = false;
			});
		}
		return;
	}
}	