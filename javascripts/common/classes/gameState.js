const enums = require("../utils/enums");
const gconf = require("../utils/game_config");

module.exports = class State {
	config 			= gconf;//Default game config
	history 		= []; 	//history of state
	player_ids 		= []; 	//player ids
	grid 			= {}; 	//placement data
	turns 			= 0; 	//turns passed
	winner 			= null; //winner id, -1 if draw
	cur_board 		= null; //current board in play, null means all boards in play
	cur_player_ind 	= 0; 	//index of current player in player_ids
	get cur_player() {return this.player_ids[this.cur_player_ind];}

	//if from_json=true, reconstructs State object from js object.
	constructor(obj,from_json){
		if(from_json){
			this.config = obj.config;
			this.history = obj.history;
			this.player_ids = obj.player_ids;
			this.grid = obj.grid;
			this.turns = obj.turns;
			this.winner = obj.winner;
			this.cur_board = obj.cur_board;
			this.cur_player_ind = obj.cur_player_ind;
			return;
		}
		if(obj) this.config = obj;
		this.config.size = this.config.grid_len**2;
		this.grid = {winner:null};
		this.history.push(this.config);

		//Generates grid.
		for(let i = 1; i <= this.config.size; i++){
			let square = {winner:null};
			for (let n = 1; n <= this.config.size; n++) square[n] = {winner:null};
			this.grid[i] = square;
		}
	}

	//Places move, checks for wins, and updates board.
	place(move){
		this.checkMoveValid(move);
		this.grid[move[0]][move[1]].winner = this.cur_player_ind; //winner is set as index, not id
		this.history.push([this.cur_player,move]);
		this.updateWins();

		if(this.grid[move[1]].winner != null) this.cur_board = null;
		else this.cur_board = move[1];
	
		this.turns++;
		this.cur_player_ind = this.turns % this.config.num_players;
	}

	//Updates wins in board
	updateWins(){
		if(this.winner != null) return;

		let small_win = this.checkWin(this.grid[this.cur_board]);
		if(small_win == -1) this.grid[this.cur_board].winner = -1;
		else if(small_win == 1){
			this.grid[this.cur_board].winner = this.cur_player_ind;

			let big_win = this.checkWin(this.grid);
			if(big_win == -1){
				this.grid.winner = -1;
				this.winner = -1;
			}else if(big_win == 1){
				this.grid.winner = this.plyr;
				this.winner = this.plyr;
			}
		}
	}

	//Abstraction for checking tictactoe wins with arbitrary rules and sizes.
	checkWin(board){
		let full = true;
		for(let n = 1; n <= this.config.size; n++){
			for(let check in this.config.checks){
				let win = true;
				let crd = oD2D(n);
				for(let i = 1; win && i < this.config.win_req; i++){
					if(board[n].winner == null){
						win = false;
						full = false;
						break;
					}
					let ncrd = {x:crd.x + i * this.config.checks[check][0],y:crd.y + i * this.config.checks[check][1]};
					if(ncrd.y >= this.config.grid_len | ncrd.x >= this.config.grid_len | ncrd.y < 0 | ncrd.x < 0){
						win = false;
						break;
					}
					if(board[tD1D(ncrd)].winner != board[n].winner){
						win = false;
						break;
					}
				}
				if(win) return 1;
			}
		}
		if(full) return -1;
		return 0;
	}

	//Basic safeguards against invalid moves
	checkMoveValid(move){
		if(this.winner != null) throw new Error(enums.error);
		if(this.cur_board != null && this.cur_board != move[0]) throw new Error(`${enums.locked}: ${move[0]},${move[1]}`);
		if(this.grid[move[0]][move[1]].winner != null) throw new Error(`${enums.occupied}: ${move[0]},${move[1]}`);
	}

	//helper functions to convert from 1D coord to 2D coord and vice versa
	oD2D(n){return {x:(n - 1) % this.config.grid_len,y:Math.floor((n - 1) / this.config.grid_len)};}
	tD1D(coord){return coord.y * this.config.grid_len + coord.x + 1;}
}