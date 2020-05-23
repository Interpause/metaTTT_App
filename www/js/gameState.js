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

exports.createState = function(){
	var state = {	
		/* Game state variables */
		turn    :	0,		//The number of turns that have passed.
		plyrs   :	[], 	//Player's PIDs.
		plyr	:	0,		//The index of the current player in plyrs.
		winner  :   -1,		//In the context of this game, -1 is empty, null is a draw, and any other number is a player.
		isJump  :	false,	//Whether next player is free to place anywhere.
		curLock :	-1,		//Current board in play.
		grid    :	{},		//Actual data of placements.
		conf    :	{},		//Read-only config data such as grid size & number of players.
		hist	:	[]		//History of game in turns.
	}
	return state;
}

/** Generates grid. */
exports.init = function(state,config){
	state.conf = config;
	state.conf.size = state.conf.grid_len**2;
	state.grid = {winner:-1};
	state.hist.push(state.conf);
	
	let promises = [];
	for(let i = 1; i <= state.conf.size; i++){
		promises.push(new Promise((callback) => {
			let square = {winner:-1};
			for (let n = 1; n <= state.conf.size; n++) square[n] = {winner:-1};
			state.grid[i] = square;
			callback();
		}));
	}
	return Promise.all(promises);
}

/** Places player piece. Increments state.turn, shifting to next player. */
exports.place = function(state,move){
	if(state.winner != -1) return Promise.reject(new Error(enums.error));
	if(state.curLock == -1){
		state.curLock = move[0];
		state.isJump = false;
	}else if(state.curLock != move[0]) return Promise.reject(new Error(`${enums.locked}: ${move[0]},${move[1]}`));
	else if(state.grid[move[0]][move[1]].winner != -1) return Promise.reject(new Error(`${enums.occupied}: ${move[0]},${move[1]}`));
	state.grid[move[0]][move[1]].winner = state.plyr;
	state.hist.push([state.plyrs[state.turn],move]);
		
	return exports.checkWin(state).then(() => {
		if(state.grid[move[1]].winner != -1) state.curLock = -1;
		else state.curLock = move[1];
		state.turn++;
		state.plyr = state.turn % state.conf.plyr_no;
	});
}

/** Checks winner. */
exports.checkWin = function(state){
	if(state.curLock == -1) return Promise.resolve();
	if(state.winner != -1) return Promise.resolve();
	let funcFin = false;
	
	let promises = [];
	for(let n = 1; n <= state.conf.size; n++) promises.push(new Promise((callback) => {
		let promises2 = [];
		if(funcFin) callback();
		else for(let check in state.conf.checks){
			let win = true;
			let crd = oD2D(state,n);
			for(let i = 1; win && i < state.conf.win_req; i++){
				if(state.grid[state.curLock][n].winner == -1 || state.grid[state.curLock][n].winner == null){
					win = false;
					break;
				}
				let ncrd = {x:crd.x + i * state.conf.checks[check][0],y:crd.y + i * state.conf.checks[check][1]};
				if(ncrd.y >= state.conf.grid_len | ncrd.x >= state.conf.grid_len | ncrd.y < 0 | ncrd.x < 0){
					win = false;
					break;
				}
				if(state.grid[state.curLock][tD1D(state,ncrd)].winner != state.grid[state.curLock][n].winner){
					win = false;
					break;
				}
			}
			if(!win) continue;
			state.grid[state.curLock].winner = state.plyr;
			
			for(let n = 1; n <= state.conf.size; n++) promises2.push(new Promise((callback) => {
				if(funcFin) callback();
				else for(let check in state.conf.checks){
					let gwin = true;
					let crd = oD2D(state,n);
					for(let i = 1; gwin && i < state.conf.win_req; i++){
						if(state.grid[n].winner == -1 || state.grid[n].winner == null){
							gwin = false;
							break;
						}
						let ncrd = {x:crd.x + i * state.conf.checks[check][0],y:crd.y + i * state.conf.checks[check][1]};
						if(ncrd.y >= state.conf.grid_len | ncrd.x >= state.conf.grid_len | ncrd.y < 0 | ncrd.x < 0){
							gwin = false;
							break;
						}
						if(state.grid[tD1D(state,ncrd)].winner != state.grid[n].winner){
							gwin = false;
							break;
						}
					}
					if(!gwin) continue;
					state.grid.winner = state.plyr;
					state.winner = state.plyr;
					funcFin = true;
					break;
				}
				callback();
			}));
			break;
		}
		Promise.all(promises2).then(() => {callback();});
	}));
	return Promise.all(promises).then(() => {
		let full = true;
		for(let n = 1; n <= state.conf.size && full; n++) if(state.grid[state.curLock][n].winner == -1) full = false;
		if(full && state.grid[state.curLock].winner == -1) state.grid[state.curLock].winner = null;
		
		let gfull = true;
		for(let n = 1; n <= state.conf.size && gfull; n++) if(state.grid[n].winner == -1) gfull = false;
		if(gfull && state.grid.winner == -1){
			state.grid.winner = null;
			state.winner = null;
			funcFin = true;
		}
	});
}

/** Helper function that converts 1D index to 2D. */
function oD2D(state,n){return {x:(n - 1) % state.conf.grid_len,y:Math.floor((n - 1) / state.conf.grid_len)};}

/** Helper function that converts 2D index to 1D. */
function tD1D(state,coord){return coord.y * state.conf.grid_len + coord.x + 1;}