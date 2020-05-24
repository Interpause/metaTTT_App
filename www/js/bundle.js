(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],2:[function(require,module,exports){
const enums = require("./common/utils/enums");

window.client = {
	name:		"Guest",//Online name of client
	cur_gid:	null,	//ID of current game session (regardless of spectating or playing)
	pid:		null,	//Player ID, generated only once
	passwd:		null,	//Player's device password, generated only once
	unloaded:   false,  //Specifies that first state sent should be used to initialize.
	online:		false,	//Flag for eventChecker to stop.
	timeout:	5000,	//Timeout for fetch request including polls
	tries:		3,		//Number of retries, not applicable for polls
	//url:		"http://ec2-52-207-243-99.compute-1.amazonaws.com:8080",
	url:		"http://127.0.0.1:8080",
	cur_fetches:[],		//Current fetches in progress
	reqConf: {			//The request
		method:"POST",
		mode:'cors',
		cache:'no-store',
		signal:undefined,
		headers:{
			'Content-Type':'application/json'
		},
		body:undefined
	},
	
	getSavedSessions:async function(){
		let data = await this.pingServer(enums.getSessions);
		if(data == null) return;
		genSessMenu(data[enums.sessionMenu],false);
	},
	
	getSpecSessions:async function(){
		let data = await this.pingServer(enums.getSpecSessions);
		if(data == null) return;
		genSessMenu(data[enums.spectatorMenu],true);
	},
	
	findSession:async function(){
		let data = await this.pingServer(enums.findSession);
		if(data == null) return;
		client.cur_gid = data[enums.findingSession];
	},
	
	joinSession:async function(Gid){
		if(Gid == null) Gid = client.cur_gid;
		let data = await this.pingServer(enums.join,{gid:Gid});
		if(data == null) return;

		client.online = true;
		client.cur_gid = data.gid;
		client.eventChecker();
		//TODO: State == error, throw GUI error
		let state = data[enums.onlineGame];
		if(state == null){
			//console.log("STATE NOT SENT");
			client.unloaded = true;
			return Promise.resolve();
		}
		if(state.player_ids.indexOf(client.pid) > -1) guiState.forfeitBtn.disabled = false;
		else guiState.forfeitBtn.disabled = true;
		return loadGame(state,true);
	},
	
	quitSession: function(){
		this.pingServer(enums.leave,{gid:this.cur_gid}).then(() => btnBack());
	},
	
	eventLoops: 0, //To ensure that eventChecker isnt spamming.
	eventChecker:async function(curLoop){
		if(curLoop == null){
			curLoop = client.eventLoops+1;
			client.eventLoops = client.eventLoops+1;
		}else if(curLoop != client.eventLoops) return;
		//console.log(`LOOP ${curLoop}`);
		try{
			let data = await this.pingServer(enums.openPoll,{},true);
			if(client.online){
				client.eventChecker(curLoop);
				if(data == null) return;				
				if(data.gid != client.cur_gid) return;
				if(!client.unloaded){
					if(data[enums.onlineGame] != null) loadGame(data[enums.onlineGame],true);
				}else{
					loadGame(data[enums.onlineGame],true);
					client.unloaded = false;
				}
			}
		}catch(e){
			console.log(e);
			console.log("Refreshing long poll...");
			if(client.online) client.eventChecker(curLoop);
		};
	},
	
	makeMove:async function(Move){
		let data = await this.pingServer(enums.move,{gid:this.cur_gid,move:Move});
		if(data[enums.onlineGame] == null) return;
		loadGame(data[enums.onlineGame],true);
	},
	
	/** Wrapper for sendServer that adds standard data, handles errors appropriately, and adds animation for the screen. */
	pingServer:async function(command,others,isPoll){
		isPoll = (isPoll==null)?false:isPoll;
		if(!isPoll)displayLoadingIndicator();
		
		let data = (others==null)?{}:others;
		data.cmd = command;
		data.pid = this.pid;
		data.passwd = this.passwd;
		data.name = this.name;
		
		//TODO sendHist and sendEvent
		try{
			let reply = await this.sendServer(data,this.tries,isPoll);
			console.log(reply);
			if(!isPoll) hideLoadingIndicator();
			//if(reply[enums.eventReceived] != null) //TODO event manager
			return reply;
		}catch(e){
			if(!isPoll) hideLoadingIndicator();
			if(e.name != "AbortError"){
				weakInternetAnim();
				console.log(e);
			}
			return {};
		}
	},

	/** Recursive retry based server sending. While accounting for abortion by menu change instead of timeout. */
	sendServer: async function(data,tries,isPoll){
		if(tries <= 0) throw new Error(enums.error);
		
		let req = Object.assign({},this.reqConf);
		req.body = JSON.stringify(data);
		
		let controller = new AbortController();
		req.signal = controller.signal;
		this.cur_fetches.push(controller);
		
		let reqDone = false;
		wait(this.timeout).then(() => {
			if(reqDone) return;
			controller.abort();
		});
		try{
			let res = await fetch(this.url,req);
			reqDone = true;
			return await res.json();
		}catch(e){
			if(e.name == "AbortError" && this.cur_fetches.length > 0 && !isPoll) return await this.sendServer(data,tries-1,isPoll);
			throw e;
		}
	},
	
	/** Cancels all current fetches. */
	cancelAll: function(){
		this.online = false;
		let cancels = this.cur_fetches;
		this.cur_fetches = []; //necessary condition to stop retries.
		for(let cont of cancels){
			cont.abort();
		}
	}
}
},{"./common/utils/enums":5}],3:[function(require,module,exports){
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
		this.updateWins(move[0]);

		if(this.grid[move[1]].winner != null) this.cur_board = null;
		else this.cur_board = move[1];
	
		this.turns++;
		this.cur_player_ind = this.turns % this.config.num_players;
	}

	//Updates wins in board
	updateWins(ind){
		if(this.winner != null) return;

		let small_win = this.checkWin(this.grid[ind]);
		if(small_win == -1) this.grid[ind].winner = -1;
		else if(small_win == 1){
			this.grid[ind].winner = this.cur_player_ind;

			let big_win = this.checkWin(this.grid);
			if(big_win == -1){
				this.grid.winner = -1;
				this.winner = -1;
			}else if(big_win == 1){
				this.grid.winner = this.cur_player_ind;
				this.winner = this.cur_player_ind;
			}
		}
	}

	//Abstraction for checking tictactoe wins with arbitrary rules and sizes.
	checkWin(board){
		let full = true;
		for(let n = 1; n <= this.config.size; n++){
			for(let check in this.config.checks){
				let win = true;
				let crd = this.oD2D(n);
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
					if(board[this.tD1D(ncrd)].winner != board[n].winner){
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
},{"../utils/enums":5,"../utils/game_config":6}],4:[function(require,module,exports){
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
		this.state.player_ids = this.player_ids;
		if(!this.online){
			this.gui.receivePlayersInfo(this.player_ids);
			this.gui.receiveBoard(this.state);
		}
	}
}
},{"../classes/gameState":3,"../utils/enums":5,"events":1}],5:[function(require,module,exports){
/* Lazy stand-in for both custom errors, status code & logging. */
//Specific
module.exports.locked = "BOARD LOCKED";
module.exports.occupied = "SQUARE FULL";
module.exports.started = "GAME STARTED";
module.exports.ended = "GAME ENDED";
module.exports.full = "GAME FULL";
module.exports.move = "MOVE";
module.exports.turn = "TURN";
module.exports.unfound = "NOT FOUND LOL";
//General
module.exports.okay = "OKAY";
module.exports.error = "FAIL";
module.exports.info = "INFO";
module.exports.busy = "BUSY";
//Server commands
module.exports.getSessions = "GET SESSIONS";
module.exports.getSpecSessions = "GET SPEC SESSIONS";
module.exports.createSession = "MAKE ME A GAME";
module.exports.findSession = "FIND ME A GAME";
module.exports.openPoll = "LONG POLLING";
module.exports.join = "JOIN";
module.exports.leave = "LEAVE";
//Client states
module.exports.sessionMenu = "SESSION MENU";
module.exports.spectatorMenu = "SPEC SESSION MENU";
module.exports.creatingSession = "CREATING SESSION";
module.exports.findingSession = "FINDING SESSION";
module.exports.onlineGame = "ONLINE GAME";
module.exports.eventReceived = "EVENT RECEIVED";
},{}],6:[function(require,module,exports){
module.exports = {
    grid_len:3,
    num_players:2,
    win_req:3,
    size:9,
    checks:{
        horiz:[1,0],
        verti:[0,1],
        rdiag:[1,1],
        ldiag:[-1,1]
    }
};
},{}],7:[function(require,module,exports){
const gameState = require("./common/classes/gameState");
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
		for(hist in histList) this.hist.push(hist);
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
},{"./common/classes/gameState":3,"./common/utils/enums":5}],8:[function(require,module,exports){
const Session = require("./common/classes/session");
const gameState = require("./common/classes/gameState");
window.gconf = require("./common/utils/game_config");
 
window.gen_uuid = c => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
window.wait = ms => new Promise((r, j)=>setTimeout(r, ms));

window.game = null;
window.startLocalGame = async function(){
	displayLoadingIndicator();
	await gui.init(guiConfig,window.gconf,false);
	game = new Session(gui);
	game.init(window.gconf);
	for(let i = 0; i < window.gconf.num_players; i++) game.addPlayer(client.pid);
	game.start();
	hideLoadingIndicator();
}

window.loadGame = async function(statedata,isOnline){
	displayLoadingIndicator();
	await gui.init(guiConfig,statedata.config,isOnline);
	if(isOnline){
		let state = new gameState(statedata,true);
		state.names = statedata.names; //TODO: this is a temporary fix... .names in the first place was a temporary fix till pid retrieval worked properly
		gui.receivePlayersInfo(state.player_ids);
		gui.receiveBoard(state);
	}else{
		game = new Session(gui);
		game.restoreSession(statedata);
		game.start();
	}
	hideLoadingIndicator();
}

/* Cordova stuff. */
window.app = {
    // Application Constructor
    initialize: function() {document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);},

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
		document.addEventListener("backbutton", this.onBackKey.bind(this), false);
		document.addEventListener("resume", this.onAppResume.bind(this), false);
		document.addEventListener("pause", this.onAppPause.bind(this), false);
		window.screen.orientation.lock('portrait-primary');
		StatusBar.hide();
        this.receivedEvent('deviceready');
    },
	
	/** On Pause. */
	onAppPause: function(){
		document.querySelector('#bgMusic').pause();
		if(game.state.winner == -1) window.localStorage.setItem('save',JSON.stringify(game.state));
		else window.localStorage.removeItem('save');
	},
	
	/** On Resume. */
	onAppResume: function(){
		document.querySelector('#bgMusic').play();
	},
	
	/** On backKey. */
	onBackKey: function(){
		btnBack();	
	},

    // Update DOM on a Received Event
    receivedEvent: async function(id) {
		if(id != "deviceready") return;
		changeFocus(guiState.gamePg);
		guiConfig.cont.style.opacity = 1;
		
		let rconfig = window.localStorage.getItem("settings");
		if(rconfig != null){
			let config = JSON.parse(rconfig);
			if(config.client_url != "") client.url = config.client_url;
			client.name = config.client_name;
			if(!config.performance_mode) generateBg();
		}else generateBg();
		
		//first time
		let clientid = window.localStorage.getItem("clientid");
		if(clientid==null) clientid = gen_uuid();
		let passwd = window.localStorage.getItem("passwd");
		if(passwd==null) passwd = gen_uuid();
		client.pid = clientid;
		client.passwd = passwd;
		window.localStorage.setItem("clientid",client.pid);
		window.localStorage.setItem("passwd",client.passwd);
		//TODO tutorial done flag.
		
		let save = window.localStorage.getItem('save');
		if(save==null) start = startLocalGame();
		else{
			try{
				await loadGame(JSON.parse(save),false);
			}catch(e){
				console.log(e);
				await startLocalGame();
			}
		}
		document.querySelector("#splash").style.display = "none";
    }
};

app.initialize();
},{"./common/classes/gameState":3,"./common/classes/session":4,"./common/utils/game_config":6}],9:[function(require,module,exports){
const bgGen = require("./triangle_background");
const enums = require("./common/utils/enums");
const filter = new (require("bad-words"))();

/** Information about html for code. */
window.guiState = {
	//Get the pages from the document
	gamePg:document.querySelector("#gamePg"),
	settingsPg:document.querySelector("#settingsPg"),
	creditsPg:document.querySelector("#creditsPg"),
	onlinePg:document.querySelector("#onlinePg"),
	onlineGamePg:document.querySelector("#onlineGamePg"),
	spectatePg:document.querySelector("#spectatePg"),

	sessBars:Array.from(onlinePg.querySelectorAll(".sessionInfo")),
	specBars:Array.from(spectatePg.querySelectorAll(".sessionInfo")),
	header:document.querySelector("#onlineGameHeader"),

	forfeitBtn:document.querySelector("#endSession"),
	loadIndicator:document.querySelector("#loadingIndicator"),
	noInternetIndicator:document.querySelector("#weakInternetIndicator"),

	clickSnd:document.querySelector('#clkSnd'),
	rstSnd:document.querySelector('#clkSnd'),
	tadaSnd:document.querySelector('#tadaSnd'),
	snrSnd:document.querySelector('#snrSnd'),

	pgFocus:null,				//Set to gamePg in index via changeFocus()
	backSeq:[gamePg], 	//Sequence of pages to return back through.
	pgTransitionInProg:false,
	btnReplayInProg:false
};

//Functions to be called when focus is switching to the page.
guiState.gamePg.arrive = async () => client.cancelAll();
guiState.settingsPg.arrive = async () => {
	let rconfig = window.localStorage.getItem("settings");
	if(rconfig != null){
		let config = JSON.parse(rconfig);
		let settings = document.querySelector("#settingsCont");
		settings.querySelector("input[name='client_url']").value = config.client_url;
		settings.querySelector("input[name='client_name']").value = config.client_name;
		settings.querySelector("input[name='performance_mode']").checked = config.performance_mode;
	}
},
guiState.creditsPg.arrive = async () => {};
guiState.onlinePg.arrive = async () => {
	client.onlineState = enums.sessionMenu;
	client.getSavedSessions();
};
guiState.onlineGamePg.arrive = async () => onlineGrid();
guiState.spectatePg.arrive = async () => client.getSpecSessions();

//Functions to be called when focus is leaving from the page.
guiState.gamePg.leave = async () => {};
guiState.settingsPg.leave = async () => {};
guiState.creditsPg.leave = async () => {};
guiState.onlinePg.leave = async () => {};
guiState.onlineGamePg.leave = async () => {
	if(gui.state.names != null && gui.state.names.length == 1) client.quitSession();
	client.online = false;
	client.cur_gid = null;
	resetGrid();
};
guiState.spectatePg.leave = async () => {};

//Other handlers
document.querySelector("#endSession").addEventListener("click",() => client.quitSession());
document.querySelector("#sobtn2").addEventListener("click",() => client.getSpecSessions());

/** Changes page focus and triggers their code... But doesn't change the page. */
window.changeFocus = async function(page){
	if(guiState.pgFocus != null) await guiState.pgFocus.leave();
	await page.arrive();
	guiState.pgFocus = page;
}

/** Function to switch pages and animate it based on the assigned class of the page. */
window.switchPg = async function(page){
	if(guiState.pgTransitionInProg) throw new Error(enums.busy);
	guiState.pgTransitionInProg = true;

	await changeFocus(page);
	page.style.setProperty("display","block");
	await wait(70); //Safest minimum time for display block to not cancel transitions.	

	let curPg = guiState.backSeq[guiState.backSeq.length-1];
	if(guiState.backSeq.length > 1) curPg.classList.remove("pgFocus");

	let direction = "translate(0vw,0vh)";
	if(page.classList.contains("pgLeft")) direction = "translateX(100vw)";
	if(page.classList.contains("pgRight")) direction = "translateX(-100vw)";
	if(page.classList.contains("pgTop")) direction = "translateY(100vh)";
	if(page.classList.contains("pgBtm")) direction = "translateY(-100vh)";
	curPg.style.setProperty("transform",direction);
	page.classList.add("pgFocus");

	wait(300).then(() => {
		curPg.style.setProperty("display","none");
		guiState.backSeq.push(page);
		guiState.pgTransitionInProg = false;
	}); //0.3s was used for transition property in CSS.
}

/** Essentially works like undo to return to previous pages specified by guiState.backSeq. */
window.btnBack = async function(){
	if(guiState.pgTransitionInProg) throw new Error(enums.busy);
	guiState.clickSnd.play();
	if(guiState.backSeq.length < 2) throw new Error(enums.error);
	guiState.pgTransitionInProg = true;
	
	let curPg = guiState.backSeq[guiState.backSeq.length-1];
	let prevPg = guiState.backSeq[guiState.backSeq.length-2];

	await changeFocus(prevPg);
	prevPg.style.setProperty("display","block");
	await wait(70); //Safest minimum time for display block to not cancel transitions.

	if(guiState.backSeq.length > 2) prevPg.classList.add("pgFocus");
	curPg.classList.remove("pgFocus");
	prevPg.style.setProperty("transform",null);

	wait(300).then(() => {
		curPg.style.cssText = null;
		guiState.backSeq.pop();
		guiState.pgTransitionInProg = false;
	},300); /* 0.3s was used for transition property in CSS. */
}
for(btn of document.querySelectorAll(".backBtn")) btn.addEventListener("click", () => btnBack());

/** Handler for buttons on gamePg. Somewhat obsolete but maybe user-initiated actions could have special animations?*/
window.btnGamePg = function(which){
	guiState.clickSnd.play();
	if(guiState.pgFocus != guiState.gamePg) return;
	switch(which){
		case 'settings':switchPg(guiState.settingsPg);break;
		case 'share':break;
		case 'credits':switchPg(guiState.creditsPg);break;
		case 'feedback':LaunchReview.launch();break;
		case 'multiplayer':switchPg(guiState.onlinePg);break;
		case 'puzzle':break;
		case 'shop':break;
		case 'replay':resetGrid();break;
	}
}
document.querySelector("#mbtn1").addEventListener("click",() => btnGamePg('settings'));
document.querySelector("#mbtn2").addEventListener("click",() => btnGamePg('share'));
document.querySelector("#mbtn3").addEventListener("click",() => btnGamePg('credits'));
document.querySelector("#mbtn4").addEventListener("click",() => btnGamePg('feedback'));
document.querySelector("#mbtn5").addEventListener("click",() => btnGamePg('multiplayer'));
document.querySelector("#mbtn6").addEventListener("click",() => btnGamePg('puzzle'));
document.querySelector("#mbtn7").addEventListener("click",() => btnGamePg('shop'));
document.querySelector("#mbtn8").addEventListener("click",() => btnGamePg('replay'));

/** Saves settings in the settingsPg. */
window.saveSettings = function(){
	let settings = document.querySelector("#settingsCont");
	let grid_len = settings.querySelector("input[name='grid_len']:checked").value;
	let plyr_no = settings.querySelector("input[name='plyr_no']:checked").value;
	let win_req = settings.querySelector("input[name='win_req']:checked").value;
	//If changes to game size and what not are made then reset the grid. 
	let changed = false;
	if(grid_len != window.gconf['grid_len']){
		window.gconf['grid_len'] = grid_len;
		changed = true;
	}	
	if(plyr_no != window.gconf['num_players']){
		window.gconf['num_players'] = plyr_no;
		changed = true;
	}
	if(win_req != window.gconf['win_req']){
		window.gconf['win_req'] = win_req;
		changed = true;
	}
	if(changed) resetGrid();
	
	let url = settings.querySelector("input[name='client_url']").value;
	client.url = (url == "")? client.url : url;
	let name = settings.querySelector("input[name='client_name']").value;
	name = filter.clean(name);
	client.name = (name == "")? client.name : name;
	
	let chkbox = settings.querySelector("input[name='performance_mode']");
	if(chkbox.checked){
		let bg = document.querySelector("#bg");
		while(bg.hasChildNodes()) bg.removeChild(bg.lastChild);
	}else if(!bg.hasChildNodes()) generateBg();
	
	let savedSettings = {
		client_url:url,
		client_name:client.name,
		performance_mode:chkbox.checked
	};
	window.localStorage.setItem("settings",JSON.stringify(savedSettings));
	btnBack();
}
document.querySelector("#sbtn1").addEventListener("click",() => saveSettings());

/** Handler for buttons on onlinePg */
window.btnOnlinePg = function(which){
	guiState.clickSnd.play();
	if(guiState.pgFocus != guiState.onlinePg) return;
	switch(which){
		case 'quickPlay':client.findSession().then(() => switchPg(guiState.onlineGamePg));break;
		case 'spectateMenu':switchPg(guiState.spectatePg);break;
		case 'refreshPg':client.getSavedSessions();break;
	}
}
document.querySelector("#obtn2").addEventListener("click",() => btnOnlinePg('spectateMenu'));
document.querySelector("#obtn3").addEventListener("click",() => btnOnlinePg('refreshPg'));
document.querySelector("#obtn4").addEventListener("click",() => btnOnlinePg('quickPlay'));

//Generates menu for joining online game
window.genSessMenu = function(data,isSpec){
	let bars = (isSpec==true)? guiState.specBars : guiState.sessBars;
	bars.forEach(bar => bar.style.display = "none");
	let i = 0;
	for(let gid in data){
		let bar = bars[i];
		let barData = data[gid];
		if(bar == null){
			console.log("More save states sent from server than bars?");
			return;
		}
		if(barData.plyrs[barData.cur] == client.pid) bar.querySelectorAll('.sessInfo')[0].innerHTML = `Your Turn @ ${barData.turn} moves`;
		else bar.querySelectorAll('.sessInfo')[0].innerHTML = barData.names[barData.cur] + `'s Turn @ ${barData.turn} moves`;
		bar.querySelectorAll('.mini')[0].onclick = () => {
			client.cur_gid = gid;
			switchPg(guiState.onlineGamePg);
		};
		
		bar.setAttribute('gid',gid);
		bar.style.display = "block";
		i++;
	}
}

//Animates the disappearance of the grid
window.hideGrid = async function(){
	guiState.rstSnd.play();
	if(guiConfig.cont.style.opacity == 0) return;
	
	Array.from(document.querySelectorAll(".btn")).forEach(btn => btn.style.setProperty("animation",null));
	guiConfig.cont.style = "";
	guiConfig.cont.style.setProperty("transition","transform 1.2s, opacity 0.4s linear, color 0.5s ease 0.1s");
	guiConfig.cont.style.setProperty("transform","rotate(-1440deg)");
	guiConfig.cont.style.setProperty("opacity","0");
	
	return await wait(400); //400ms length of opacity transition
}

//Animates the reappearance of the grid
window.showGrid = async function(){
	if(guiConfig.cont.style.opacity == 1) return;
	guiConfig.cont.style.setProperty("opacity","1");

	await wait(800); //800ms length of remaining rotation transition
	guiConfig.cont.style.setProperty("transition","color 0.5s ease 0.1s");
	guiConfig.cont.style.setProperty("transform",null);
}

//Resets the grid
window.resetGrid = async function(){
	if(guiState.btnReplayInProg) throw new Error(enums.busy);
	guiState.btnReplayInProg = true;
	await hideGrid();
	gui.state = {};
	guiConfig.cont = document.querySelector("#gamePg .TTTgame");
	await startLocalGame();
	await showGrid();
	guiState.btnReplayInProg = false
}

//Loads online grid
window.onlineGrid = async function(){
	guiConfig.cont = document.querySelector("#onlineGamePg .TTTgame");
	gui.state = {};
	guiState.header.innerHTML = "Waiting...";
	let conc = [hideGrid(),client.joinSession()];
	await Promise.all(conc);
	return await showGrid();
}

//Update online GUI header
window.updateHeader = function(){
	if(!client.online) return;
	if(gui.state.player_ids.length < gui.state.config.num_players) guiState.header.innerHTML = "Waiting...";
	else{
		if(gui.state.cur_player == client.pid) guiState.header.innerHTML = `Your Turn @ ${gui.state.turns} moves`;
		else guiState.header.innerHTML = gui.state.names[gui.state.cur_player_ind] + `'s Turn @ ${gui.state.turns} moves`; //TODO: state isnt supposed to have names
	}
}

//Win animation for menu
window.menuWinAnim = function(){
	guiState.tadaSnd.play();
	Array.from(document.querySelectorAll(".btn")).forEach(btn => btn.style.setProperty("animation","winBtn 0.5s linear 0s infinite"));
}

//Small thing pops up in the center of the screen declaring poor internet
window.weakInternetAnim = function(){
	guiState.noInternetIndicator.style.opacity = 1;
	wait(1000).then(() => guiState.noInternetIndicator.style.opacity = 0);
}

window.displayLoadingIndicator = function(){
	document.querySelector("#loadingIndicator").style.opacity = 1;
}
window.hideLoadingIndicator = function(){
	document.querySelector("#loadingIndicator").style.opacity = 0;
}

//Generates the interactive background and attaches it.
window.generateBg = function(){
	let bg = bgGen.genBg();
	bg.style.width = "100%";
	bg.style.height = "auto";
	/*
	let tris = bg.querySelectorAll("polygon");
	tris.forEach(tri => {
		tri.onclick = function(){
			guiState.snrSnd.pause();
			guiState.snrSnd.currentTime = 0;
			guiState.snrSnd.play();
			let temp = tri.innerHTML;
			tri.innerHTML = "";
			tri.setAttribute("fill","white");
			wait(75).then(() => tri.innerHTML = temp);
		};
	});
	*/
	document.querySelector("#bg").appendChild(bg);
}
},{"./common/utils/enums":5,"./triangle_background":10,"bad-words":11}],10:[function(require,module,exports){
/** Default settings for the generated background. */
const bgDefaults = {};

// Number of rows and columns of triangle sets
bgDefaults.rows = 10;
bgDefaults.cols = 4;

// In seconds, the speed of color change
bgDefaults.min_speed = 20;
bgDefaults.max_speed = 50;

// Other aesthetic settings
bgDefaults.gap_ratio = 0.15;  // Size of gap in relation to the triangles
bgDefaults.randomness = 0.75; // Smart random seriousness

// Permanent settings and Maths calculations
const tlen = 100;					// Base of triangles in arbitrary SVG units
const thgt = tlen/2*1.732050808;	// Height of triangles in arbitrary SVG units

// Colors that triangles change between.
bgDefaults.colors = ['#ffffff','#0c7c5f','#000000',
					'#fab20b','#e62840','#8862b8',
					'#fddb0d','#deddde','#ffffff',
					'#0c7c5f','#000000'];

// Shuffles color sequence of triangle based on triangle on top and to the left of it
function smart_shuffle(above,left,conf){
	let frndarr = conf.colors.slice();
	let shuffled = [];
	
	//assuming its in list, highly likely considering context of usage
	if (Math.random() < conf.randomness && above != undefined) frndarr.splice(frndarr.indexOf(above),1); 
	if (Math.random() < conf.randomness && left != undefined) frndarr.splice(frndarr.indexOf(left),1);
	
	shuffled.push(frndarr[Math.floor(Math.random() * frndarr.length)]);
	let nrndarr = conf.colors.slice();
	nrndarr.splice(nrndarr.indexOf(shuffled[0]),1);
	
	for (let i = nrndarr.length - 1; i>0; i--){
		let j = Math.floor(Math.random() * (i + 1));
		[nrndarr[i], nrndarr[j]] = [nrndarr[j], nrndarr[i]];
	}
	
	return shuffled.concat(nrndarr);
}

// Randomly generates the color and animation information of triangle
function gen_tri(above,left,conf){
	let tri = {};
	let r_seq = smart_shuffle(above,left,conf);
	r_seq.push(r_seq.slice(0,1)[0]);
	tri['color_seq'] = r_seq;
	tri['speed'] = Math.floor(Math.random()*(conf.max_speed-conf.min_speed))+conf.min_speed;
	return tri;
}

//Read-only outside of module.					
module.exports.bgDefaults = bgDefaults;

/** Generates SVG background. Pass changes to default settings as Object. */
module.exports.genBg = function(kwargs){
	let conf = Object.assign({},bgDefaults);
	if(kwargs!=null) Object.entries(kwargs).forEach(([k,v])=>conf[k]=v);
	
	//Maths
	let glen = tlen/2*conf.gap_ratio;	// Length of gap between triangles in arbitrary SVG units
	let lglen = glen/2;					// Horizontal offset for triangle points in arbitrary SVG units
	let hglen = glen/2*0.866025404;		// Vertical offset for triangle points in arbitrary SVG units
	let width = tlen*conf.cols;			// Width of SVG
	let height = thgt*conf.rows+hglen/4;// Height of SVG
	
	let container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	container.setAttribute('xmlns','http://www.w3.org/2000/svg');
	container.setAttribute('viewBox',`0 0 ${width} ${height}`);
	container.setAttribute('shape-rendering','geometricPrecision');
	
	let bg = document.createElementNS("http://www.w3.org/2000/svg", 'g');
	container.appendChild(bg);
	
	//Tracks triangle colors for smart random
	let prevarr = []; 		// Previous row of triangles
	let curarr = [];  		// Current row of triangles
	let prevc = undefined;	// Color of previous generated triangle
	
	//Flags
	let isUpright = false;  //Each row is flipped upside down from the next
	
	for(let y = 0; y < conf.rows*2; y++){
		if(y%2==0) isUpright = true;
		else isUpright = false;
		
		//For first triangle (wrapped around screen)
		let tri1 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		let tri2 = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
		
		//Fill of triangle
		let tri_p = gen_tri(prevarr[0],prevc,conf);
		tri1.setAttribute('fill',tri_p['color_seq'][0]);
		tri2.setAttribute('fill',tri_p['color_seq'][0]);
		curarr.push(tri_p['color_seq'][0]);
		prevc = tri_p['color_seq'][0];
		
		//Different calculation of points if triangle upright versus not
		let p1x1 = 0;
		let p1y1 = y*thgt+((isUpright)?hglen:glen)/2;
		let p2x1 = 0;
		let p2y1 = (y+1)*thgt-((isUpright)?glen:hglen)/2;
		let p3x1 = tlen/2-lglen;
		let p3y1 = (isUpright)?y*thgt+hglen/2:(y+1)*thgt-hglen/2;
		
		let p1x2 = width;
		let p1y2 = p1y1;
		let p2x2 = width;
		let p2y2 = p2y1;
		let p3x2 = width-tlen/2+lglen;
		let p3y2 = p3y1;
		
		tri1.setAttribute('points',`${p1x1},${p1y1} ${p2x1},${p2y1} ${p3x1},${p3y1}`);
		tri2.setAttribute('points',`${p1x2},${p1y2} ${p2x2},${p2y2} ${p3x2},${p3y2}`);
		tri1.setAttribute('shape-rendering','geometricPrecision');
		tri2.setAttribute('shape-rendering','geometricPrecision');
		
		//Animation element of triangle
		let anim = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
		anim.setAttribute('attributeName','fill');
		anim.setAttribute('values',`${tri_p['color_seq'].join(';')};`);
		anim.setAttribute('dur',`${tri_p['speed']}s`);
		anim.setAttribute('repeatCount',"indefinite");
		
		tri1.appendChild(anim.cloneNode(true));
		tri2.appendChild(anim.cloneNode(true));
		bg.appendChild(tri1);
		bg.appendChild(tri2);
		
		//For rest of triangles in row
		for(let x = 1; x < conf.cols*2; x++){
			let tri = document.createElementNS("http://www.w3.org/2000/svg", 'polygon');
			
			let tri_p = gen_tri(prevarr[x],prevc,conf);
			tri.setAttribute('fill',tri_p['color_seq'][0]);
			curarr.push(tri_p['color_seq'][0]);
			prevc = tri_p['color_seq'][0];


			let p1x = (x-1)*tlen/2+lglen;
			let p1y = (isUpright)?(y+1)*thgt-hglen/2:y*thgt+hglen/2;
			let p2x = (x+1)*tlen/2-lglen;
			let p2y = (isUpright)?(y+1)*thgt-hglen/2:y*thgt+hglen/2;;
			let p3x = x*tlen/2;
			let p3y = (isUpright)?y*thgt+glen/2:(y+1)*thgt-glen/2;
			
			tri.setAttribute('points',`${p1x},${p1y} ${p2x},${p2y} ${p3x},${p3y}`);
			tri.setAttribute('shape-rendering','geometricPrecision');
			
			let anim = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
			anim.setAttribute('attributeName','fill');
			anim.setAttribute('values',`${tri_p['color_seq'].join(';')};`);
			anim.setAttribute('dur',`${tri_p['speed']}s`);
			anim.setAttribute('repeatCount',"indefinite");
			
			tri.appendChild(anim);
			bg.appendChild(tri);
			
			isUpright = !isUpright;
		}
		prevc = undefined;
		prevarr = curarr;
		curarr = [];
	}
	return container;
};
},{}],11:[function(require,module,exports){
const localList = require('./lang.json').words;
const baseList = require('badwords-list').array;

class Filter {

  /**
   * Filter constructor.
   * @constructor
   * @param {object} options - Filter instance options
   * @param {boolean} options.emptyList - Instantiate filter with no blacklist
   * @param {array} options.list - Instantiate filter with custom list
   * @param {string} options.placeHolder - Character used to replace profane words.
   * @param {string} options.regex - Regular expression used to sanitize words before comparing them to blacklist.
   * @param {string} options.replaceRegex - Regular expression used to replace profane words with placeHolder.
   */
  constructor(options = {}) {
    Object.assign(this, {
      list: options.emptyList && [] || Array.prototype.concat.apply(localList, [baseList, options.list || []]),
      exclude: options.exclude || [],
      placeHolder: options.placeHolder || '*',
      regex: options.regex || /[^a-zA-Z0-9|\$|\@]|\^/g,
      replaceRegex: options.replaceRegex || /\w/g
    })
  }

  /**
   * Determine if a string contains profane language.
   * @param {string} string - String to evaluate for profanity.
   */
  isProfane(string) {
    return this.list
      .filter((word) => {
        const wordExp = new RegExp(`\\b${word.replace(/(\W)/g, '\\$1')}\\b`, 'gi');
        return !this.exclude.includes(word.toLowerCase()) && wordExp.test(string);
      })
      .length > 0 || false;
  }

  /**
   * Replace a word with placeHolder characters;
   * @param {string} string - String to replace.
   */
  replaceWord(string) {
    return string
      .replace(this.regex, '')
      .replace(this.replaceRegex, this.placeHolder);
  }

  /**
   * Evaluate a string for profanity and return an edited version.
   * @param {string} string - Sentence to filter.
   */
  clean(string) {
    return string.split(/\b/).map((word) => {
      return this.isProfane(word) ? this.replaceWord(word) : word;
    }).join('');
  }

  /**
   * Add word(s) to blacklist filter / remove words from whitelist filter
   * @param {...string} word - Word(s) to add to blacklist
   */
  addWords() {
    let words = Array.from(arguments);

    this.list.push(...words);

    words
      .map(word => word.toLowerCase())
      .forEach((word) => {
        if (this.exclude.includes(word)) {
          this.exclude.splice(this.exclude.indexOf(word), 1);
        }
      });
  }

  /**
   * Add words to whitelist filter
   * @param {...string} word - Word(s) to add to whitelist.
   */
  removeWords() {
    this.exclude.push(...Array.from(arguments).map(word => word.toLowerCase()));
  }
}

module.exports = Filter;
},{"./lang.json":12,"badwords-list":14}],12:[function(require,module,exports){
module.exports={
  "words":[
    "ahole",
    "anus",
    "ash0le",
    "ash0les",
    "asholes",
    "ass",
    "Ass Monkey",
    "Assface",
    "assh0le",
    "assh0lez",
    "asshole",
    "assholes",
    "assholz",
    "asswipe",
    "azzhole",
    "bassterds",
    "bastard",
    "bastards",
    "bastardz",
    "basterds",
    "basterdz",
    "Biatch",
    "bitch",
    "bitches",
    "Blow Job",
    "boffing",
    "butthole",
    "buttwipe",
    "c0ck",
    "c0cks",
    "c0k",
    "Carpet Muncher",
    "cawk",
    "cawks",
    "Clit",
    "cnts",
    "cntz",
    "cock",
    "cockhead",
    "cock-head",
    "cocks",
    "CockSucker",
    "cock-sucker",
    "crap",
    "cum",
    "cunt",
    "cunts",
    "cuntz",
    "dick",
    "dild0",
    "dild0s",
    "dildo",
    "dildos",
    "dilld0",
    "dilld0s",
    "dominatricks",
    "dominatrics",
    "dominatrix",
    "dyke",
    "enema",
    "f u c k",
    "f u c k e r",
    "fag",
    "fag1t",
    "faget",
    "fagg1t",
    "faggit",
    "faggot",
    "fagg0t",
    "fagit",
    "fags",
    "fagz",
    "faig",
    "faigs",
    "fart",
    "flipping the bird",
    "fuck",
    "fucker",
    "fuckin",
    "fucking",
    "fucks",
    "Fudge Packer",
    "fuk",
    "Fukah",
    "Fuken",
    "fuker",
    "Fukin",
    "Fukk",
    "Fukkah",
    "Fukken",
    "Fukker",
    "Fukkin",
    "g00k",
    "God-damned",
    "h00r",
    "h0ar",
    "h0re",
    "hells",
    "hoar",
    "hoor",
    "hoore",
    "jackoff",
    "jap",
    "japs",
    "jerk-off",
    "jisim",
    "jiss",
    "jizm",
    "jizz",
    "knob",
    "knobs",
    "knobz",
    "kunt",
    "kunts",
    "kuntz",
    "Lezzian",
    "Lipshits",
    "Lipshitz",
    "masochist",
    "masokist",
    "massterbait",
    "masstrbait",
    "masstrbate",
    "masterbaiter",
    "masterbate",
    "masterbates",
    "Motha Fucker",
    "Motha Fuker",
    "Motha Fukkah",
    "Motha Fukker",
    "Mother Fucker",
    "Mother Fukah",
    "Mother Fuker",
    "Mother Fukkah",
    "Mother Fukker",
    "mother-fucker",
    "Mutha Fucker",
    "Mutha Fukah",
    "Mutha Fuker",
    "Mutha Fukkah",
    "Mutha Fukker",
    "n1gr",
    "nastt",
    "nigger;",
    "nigur;",
    "niiger;",
    "niigr;",
    "orafis",
    "orgasim;",
    "orgasm",
    "orgasum",
    "oriface",
    "orifice",
    "orifiss",
    "packi",
    "packie",
    "packy",
    "paki",
    "pakie",
    "paky",
    "pecker",
    "peeenus",
    "peeenusss",
    "peenus",
    "peinus",
    "pen1s",
    "penas",
    "penis",
    "penis-breath",
    "penus",
    "penuus",
    "Phuc",
    "Phuck",
    "Phuk",
    "Phuker",
    "Phukker",
    "polac",
    "polack",
    "polak",
    "Poonani",
    "pr1c",
    "pr1ck",
    "pr1k",
    "pusse",
    "pussee",
    "pussy",
    "puuke",
    "puuker",
    "queer",
    "queers",
    "queerz",
    "qweers",
    "qweerz",
    "qweir",
    "recktum",
    "rectum",
    "retard",
    "sadist",
    "scank",
    "schlong",
    "screwing",
    "semen",
    "sex",
    "sexy",
    "Sh!t",
    "sh1t",
    "sh1ter",
    "sh1ts",
    "sh1tter",
    "sh1tz",
    "shit",
    "shits",
    "shitter",
    "Shitty",
    "Shity",
    "shitz",
    "Shyt",
    "Shyte",
    "Shytty",
    "Shyty",
    "skanck",
    "skank",
    "skankee",
    "skankey",
    "skanks",
    "Skanky",
    "slag",
    "slut",
    "sluts",
    "Slutty",
    "slutz",
    "son-of-a-bitch",
    "tit",
    "turd",
    "va1jina",
    "vag1na",
    "vagiina",
    "vagina",
    "vaj1na",
    "vajina",
    "vullva",
    "vulva",
    "w0p",
    "wh00r",
    "wh0re",
    "whore",
    "xrated",
    "xxx",
    "b!+ch",
    "bitch",
    "blowjob",
    "clit",
    "arschloch",
    "fuck",
    "shit",
    "ass",
    "asshole",
    "b!tch",
    "b17ch",
    "b1tch",
    "bastard",
    "bi+ch",
    "boiolas",
    "buceta",
    "c0ck",
    "cawk",
    "chink",
    "cipa",
    "clits",
    "cock",
    "cum",
    "cunt",
    "dildo",
    "dirsa",
    "ejakulate",
    "fatass",
    "fcuk",
    "fuk",
    "fux0r",
    "hoer",
    "hore",
    "jism",
    "kawk",
    "l3itch",
    "l3i+ch",
    "lesbian",
    "masturbate",
    "masterbat*",
    "masterbat3",
    "motherfucker",
    "s.o.b.",
    "mofo",
    "nazi",
    "nigga",
    "nigger",
    "nutsack",
    "phuck",
    "pimpis",
    "pusse",
    "pussy",
    "scrotum",
    "sh!t",
    "shemale",
    "shi+",
    "sh!+",
    "slut",
    "smut",
    "teets",
    "tits",
    "boobs",
    "b00bs",
    "teez",
    "testical",
    "testicle",
    "titt",
    "w00se",
    "jackoff",
    "wank",
    "whoar",
    "whore",
    "*damn",
    "*dyke",
    "*fuck*",
    "*shit*",
    "@$$",
    "amcik",
    "andskota",
    "arse*",
    "assrammer",
    "ayir",
    "bi7ch",
    "bitch*",
    "bollock*",
    "breasts",
    "butt-pirate",
    "cabron",
    "cazzo",
    "chraa",
    "chuj",
    "Cock*",
    "cunt*",
    "d4mn",
    "daygo",
    "dego",
    "dick*",
    "dike*",
    "dupa",
    "dziwka",
    "ejackulate",
    "Ekrem*",
    "Ekto",
    "enculer",
    "faen",
    "fag*",
    "fanculo",
    "fanny",
    "feces",
    "feg",
    "Felcher",
    "ficken",
    "fitt*",
    "Flikker",
    "foreskin",
    "Fotze",
    "Fu(*",
    "fuk*",
    "futkretzn",
    "gook",
    "guiena",
    "h0r",
    "h4x0r",
    "hell",
    "helvete",
    "hoer*",
    "honkey",
    "Huevon",
    "hui",
    "injun",
    "jizz",
    "kanker*",
    "kike",
    "klootzak",
    "kraut",
    "knulle",
    "kuk",
    "kuksuger",
    "Kurac",
    "kurwa",
    "kusi*",
    "kyrpa*",
    "lesbo",
    "mamhoon",
    "masturbat*",
    "merd*",
    "mibun",
    "monkleigh",
    "mouliewop",
    "muie",
    "mulkku",
    "muschi",
    "nazis",
    "nepesaurio",
    "nigger*",
    "orospu",
    "paska*",
    "perse",
    "picka",
    "pierdol*",
    "pillu*",
    "pimmel",
    "piss*",
    "pizda",
    "poontsee",
    "poop",
    "porn",
    "p0rn",
    "pr0n",
    "preteen",
    "pula",
    "pule",
    "puta",
    "puto",
    "qahbeh",
    "queef*",
    "rautenberg",
    "schaffer",
    "scheiss*",
    "schlampe",
    "schmuck",
    "screw",
    "sh!t*",
    "sharmuta",
    "sharmute",
    "shipal",
    "shiz",
    "skribz",
    "skurwysyn",
    "sphencter",
    "spic",
    "spierdalaj",
    "splooge",
    "suka",
    "b00b*",
    "testicle*",
    "titt*",
    "twat",
    "vittu",
    "wank*",
    "wetback*",
    "wichser",
    "wop*",
    "yed",
    "zabourah"
  ]
}

},{}],13:[function(require,module,exports){
module.exports = ["4r5e", "5h1t", "5hit", "a55", "anal", "anus", "ar5e", "arrse", "arse", "ass", "ass-fucker", "asses", "assfucker", "assfukka", "asshole", "assholes", "asswhole", "a_s_s", "b!tch", "b00bs", "b17ch", "b1tch", "ballbag", "balls", "ballsack", "bastard", "beastial", "beastiality", "bellend", "bestial", "bestiality", "bi+ch", "biatch", "bitch", "bitcher", "bitchers", "bitches", "bitchin", "bitching", "bloody", "blow job", "blowjob", "blowjobs", "boiolas", "bollock", "bollok", "boner", "boob", "boobs", "booobs", "boooobs", "booooobs", "booooooobs", "breasts", "buceta", "bugger", "bum", "bunny fucker", "butt", "butthole", "buttmuch", "buttplug", "c0ck", "c0cksucker", "carpet muncher", "cawk", "chink", "cipa", "cl1t", "clit", "clitoris", "clits", "cnut", "cock", "cock-sucker", "cockface", "cockhead", "cockmunch", "cockmuncher", "cocks", "cocksuck", "cocksucked", "cocksucker", "cocksucking", "cocksucks", "cocksuka", "cocksukka", "cok", "cokmuncher", "coksucka", "coon", "cox", "crap", "cum", "cummer", "cumming", "cums", "cumshot", "cunilingus", "cunillingus", "cunnilingus", "cunt", "cuntlick", "cuntlicker", "cuntlicking", "cunts", "cyalis", "cyberfuc", "cyberfuck", "cyberfucked", "cyberfucker", "cyberfuckers", "cyberfucking", "d1ck", "damn", "dick", "dickhead", "dildo", "dildos", "dink", "dinks", "dirsa", "dlck", "dog-fucker", "doggin", "dogging", "donkeyribber", "doosh", "duche", "dyke", "ejaculate", "ejaculated", "ejaculates", "ejaculating", "ejaculatings", "ejaculation", "ejakulate", "f u c k", "f u c k e r", "f4nny", "fag", "fagging", "faggitt", "faggot", "faggs", "fagot", "fagots", "fags", "fanny", "fannyflaps", "fannyfucker", "fanyy", "fatass", "fcuk", "fcuker", "fcuking", "feck", "fecker", "felching", "fellate", "fellatio", "fingerfuck", "fingerfucked", "fingerfucker", "fingerfuckers", "fingerfucking", "fingerfucks", "fistfuck", "fistfucked", "fistfucker", "fistfuckers", "fistfucking", "fistfuckings", "fistfucks", "flange", "fook", "fooker", "fuck", "fucka", "fucked", "fucker", "fuckers", "fuckhead", "fuckheads", "fuckin", "fucking", "fuckings", "fuckingshitmotherfucker", "fuckme", "fucks", "fuckwhit", "fuckwit", "fudge packer", "fudgepacker", "fuk", "fuker", "fukker", "fukkin", "fuks", "fukwhit", "fukwit", "fux", "fux0r", "f_u_c_k", "gangbang", "gangbanged", "gangbangs", "gaylord", "gaysex", "goatse", "God", "god-dam", "god-damned", "goddamn", "goddamned", "hardcoresex", "hell", "heshe", "hoar", "hoare", "hoer", "homo", "hore", "horniest", "horny", "hotsex", "jack-off", "jackoff", "jap", "jerk-off", "jism", "jiz", "jizm", "jizz", "kawk", "knob", "knobead", "knobed", "knobend", "knobhead", "knobjocky", "knobjokey", "kock", "kondum", "kondums", "kum", "kummer", "kumming", "kums", "kunilingus", "l3i+ch", "l3itch", "labia", "lust", "lusting", "m0f0", "m0fo", "m45terbate", "ma5terb8", "ma5terbate", "masochist", "master-bate", "masterb8", "masterbat*", "masterbat3", "masterbate", "masterbation", "masterbations", "masturbate", "mo-fo", "mof0", "mofo", "mothafuck", "mothafucka", "mothafuckas", "mothafuckaz", "mothafucked", "mothafucker", "mothafuckers", "mothafuckin", "mothafucking", "mothafuckings", "mothafucks", "mother fucker", "motherfuck", "motherfucked", "motherfucker", "motherfuckers", "motherfuckin", "motherfucking", "motherfuckings", "motherfuckka", "motherfucks", "muff", "mutha", "muthafecker", "muthafuckker", "muther", "mutherfucker", "n1gga", "n1gger", "nazi", "nigg3r", "nigg4h", "nigga", "niggah", "niggas", "niggaz", "nigger", "niggers", "nob", "nob jokey", "nobhead", "nobjocky", "nobjokey", "numbnuts", "nutsack", "orgasim", "orgasims", "orgasm", "orgasms", "p0rn", "pawn", "pecker", "penis", "penisfucker", "phonesex", "phuck", "phuk", "phuked", "phuking", "phukked", "phukking", "phuks", "phuq", "pigfucker", "pimpis", "piss", "pissed", "pisser", "pissers", "pisses", "pissflaps", "pissin", "pissing", "pissoff", "poop", "porn", "porno", "pornography", "pornos", "prick", "pricks", "pron", "pube", "pusse", "pussi", "pussies", "pussy", "pussys", "rectum", "retard", "rimjaw", "rimming", "s hit", "s.o.b.", "sadist", "schlong", "screwing", "scroat", "scrote", "scrotum", "semen", "sex", "sh!+", "sh!t", "sh1t", "shag", "shagger", "shaggin", "shagging", "shemale", "shi+", "shit", "shitdick", "shite", "shited", "shitey", "shitfuck", "shitfull", "shithead", "shiting", "shitings", "shits", "shitted", "shitter", "shitters", "shitting", "shittings", "shitty", "skank", "slut", "sluts", "smegma", "smut", "snatch", "son-of-a-bitch", "spac", "spunk", "s_h_i_t", "t1tt1e5", "t1tties", "teets", "teez", "testical", "testicle", "tit", "titfuck", "tits", "titt", "tittie5", "tittiefucker", "titties", "tittyfuck", "tittywank", "titwank", "tosser", "turd", "tw4t", "twat", "twathead", "twatty", "twunt", "twunter", "v14gra", "v1gra", "vagina", "viagra", "vulva", "w00se", "wang", "wank", "wanker", "wanky", "whoar", "whore", "willies", "willy", "xrated", "xxx"];
},{}],14:[function(require,module,exports){
module.exports = {
  object: require('./object'),
  array: require('./array'),
  regex: require('./regexp')
};
},{"./array":13,"./object":15,"./regexp":16}],15:[function(require,module,exports){
module.exports = {"4r5e": 1, "5h1t": 1, "5hit": 1, "a55": 1, "anal": 1, "anus": 1, "ar5e": 1, "arrse": 1, "arse": 1, "ass": 1, "ass-fucker": 1, "asses": 1, "assfucker": 1, "assfukka": 1, "asshole": 1, "assholes": 1, "asswhole": 1, "a_s_s": 1, "b!tch": 1, "b00bs": 1, "b17ch": 1, "b1tch": 1, "ballbag": 1, "balls": 1, "ballsack": 1, "bastard": 1, "beastial": 1, "beastiality": 1, "bellend": 1, "bestial": 1, "bestiality": 1, "bi+ch": 1, "biatch": 1, "bitch": 1, "bitcher": 1, "bitchers": 1, "bitches": 1, "bitchin": 1, "bitching": 1, "bloody": 1, "blow job": 1, "blowjob": 1, "blowjobs": 1, "boiolas": 1, "bollock": 1, "bollok": 1, "boner": 1, "boob": 1, "boobs": 1, "booobs": 1, "boooobs": 1, "booooobs": 1, "booooooobs": 1, "breasts": 1, "buceta": 1, "bugger": 1, "bum": 1, "bunny fucker": 1, "butt": 1, "butthole": 1, "buttmuch": 1, "buttplug": 1, "c0ck": 1, "c0cksucker": 1, "carpet muncher": 1, "cawk": 1, "chink": 1, "cipa": 1, "cl1t": 1, "clit": 1, "clitoris": 1, "clits": 1, "cnut": 1, "cock": 1, "cock-sucker": 1, "cockface": 1, "cockhead": 1, "cockmunch": 1, "cockmuncher": 1, "cocks": 1, "cocksuck": 1, "cocksucked": 1, "cocksucker": 1, "cocksucking": 1, "cocksucks": 1, "cocksuka": 1, "cocksukka": 1, "cok": 1, "cokmuncher": 1, "coksucka": 1, "coon": 1, "cox": 1, "crap": 1, "cum": 1, "cummer": 1, "cumming": 1, "cums": 1, "cumshot": 1, "cunilingus": 1, "cunillingus": 1, "cunnilingus": 1, "cunt": 1, "cuntlick": 1, "cuntlicker": 1, "cuntlicking": 1, "cunts": 1, "cyalis": 1, "cyberfuc": 1, "cyberfuck": 1, "cyberfucked": 1, "cyberfucker": 1, "cyberfuckers": 1, "cyberfucking": 1, "d1ck": 1, "damn": 1, "dick": 1, "dickhead": 1, "dildo": 1, "dildos": 1, "dink": 1, "dinks": 1, "dirsa": 1, "dlck": 1, "dog-fucker": 1, "doggin": 1, "dogging": 1, "donkeyribber": 1, "doosh": 1, "duche": 1, "dyke": 1, "ejaculate": 1, "ejaculated": 1, "ejaculates": 1, "ejaculating": 1, "ejaculatings": 1, "ejaculation": 1, "ejakulate": 1, "f u c k": 1, "f u c k e r": 1, "f4nny": 1, "fag": 1, "fagging": 1, "faggitt": 1, "faggot": 1, "faggs": 1, "fagot": 1, "fagots": 1, "fags": 1, "fanny": 1, "fannyflaps": 1, "fannyfucker": 1, "fanyy": 1, "fatass": 1, "fcuk": 1, "fcuker": 1, "fcuking": 1, "feck": 1, "fecker": 1, "felching": 1, "fellate": 1, "fellatio": 1, "fingerfuck": 1, "fingerfucked": 1, "fingerfucker": 1, "fingerfuckers": 1, "fingerfucking": 1, "fingerfucks": 1, "fistfuck": 1, "fistfucked": 1, "fistfucker": 1, "fistfuckers": 1, "fistfucking": 1, "fistfuckings": 1, "fistfucks": 1, "flange": 1, "fook": 1, "fooker": 1, "fuck": 1, "fucka": 1, "fucked": 1, "fucker": 1, "fuckers": 1, "fuckhead": 1, "fuckheads": 1, "fuckin": 1, "fucking": 1, "fuckings": 1, "fuckingshitmotherfucker": 1, "fuckme": 1, "fucks": 1, "fuckwhit": 1, "fuckwit": 1, "fudge packer": 1, "fudgepacker": 1, "fuk": 1, "fuker": 1, "fukker": 1, "fukkin": 1, "fuks": 1, "fukwhit": 1, "fukwit": 1, "fux": 1, "fux0r": 1, "f_u_c_k": 1, "gangbang": 1, "gangbanged": 1, "gangbangs": 1, "gaylord": 1, "gaysex": 1, "goatse": 1, "God": 1, "god-dam": 1, "god-damned": 1, "goddamn": 1, "goddamned": 1, "hardcoresex": 1, "hell": 1, "heshe": 1, "hoar": 1, "hoare": 1, "hoer": 1, "homo": 1, "hore": 1, "horniest": 1, "horny": 1, "hotsex": 1, "jack-off": 1, "jackoff": 1, "jap": 1, "jerk-off": 1, "jism": 1, "jiz": 1, "jizm": 1, "jizz": 1, "kawk": 1, "knob": 1, "knobead": 1, "knobed": 1, "knobend": 1, "knobhead": 1, "knobjocky": 1, "knobjokey": 1, "kock": 1, "kondum": 1, "kondums": 1, "kum": 1, "kummer": 1, "kumming": 1, "kums": 1, "kunilingus": 1, "l3i+ch": 1, "l3itch": 1, "labia": 1, "lust": 1, "lusting": 1, "m0f0": 1, "m0fo": 1, "m45terbate": 1, "ma5terb8": 1, "ma5terbate": 1, "masochist": 1, "master-bate": 1, "masterb8": 1, "masterbat*": 1, "masterbat3": 1, "masterbate": 1, "masterbation": 1, "masterbations": 1, "masturbate": 1, "mo-fo": 1, "mof0": 1, "mofo": 1, "mothafuck": 1, "mothafucka": 1, "mothafuckas": 1, "mothafuckaz": 1, "mothafucked": 1, "mothafucker": 1, "mothafuckers": 1, "mothafuckin": 1, "mothafucking": 1, "mothafuckings": 1, "mothafucks": 1, "mother fucker": 1, "motherfuck": 1, "motherfucked": 1, "motherfucker": 1, "motherfuckers": 1, "motherfuckin": 1, "motherfucking": 1, "motherfuckings": 1, "motherfuckka": 1, "motherfucks": 1, "muff": 1, "mutha": 1, "muthafecker": 1, "muthafuckker": 1, "muther": 1, "mutherfucker": 1, "n1gga": 1, "n1gger": 1, "nazi": 1, "nigg3r": 1, "nigg4h": 1, "nigga": 1, "niggah": 1, "niggas": 1, "niggaz": 1, "nigger": 1, "niggers": 1, "nob": 1, "nob jokey": 1, "nobhead": 1, "nobjocky": 1, "nobjokey": 1, "numbnuts": 1, "nutsack": 1, "orgasim": 1, "orgasims": 1, "orgasm": 1, "orgasms": 1, "p0rn": 1, "pawn": 1, "pecker": 1, "penis": 1, "penisfucker": 1, "phonesex": 1, "phuck": 1, "phuk": 1, "phuked": 1, "phuking": 1, "phukked": 1, "phukking": 1, "phuks": 1, "phuq": 1, "pigfucker": 1, "pimpis": 1, "piss": 1, "pissed": 1, "pisser": 1, "pissers": 1, "pisses": 1, "pissflaps": 1, "pissin": 1, "pissing": 1, "pissoff": 1, "poop": 1, "porn": 1, "porno": 1, "pornography": 1, "pornos": 1, "prick": 1, "pricks": 1, "pron": 1, "pube": 1, "pusse": 1, "pussi": 1, "pussies": 1, "pussy": 1, "pussys": 1, "rectum": 1, "retard": 1, "rimjaw": 1, "rimming": 1, "s hit": 1, "s.o.b.": 1, "sadist": 1, "schlong": 1, "screwing": 1, "scroat": 1, "scrote": 1, "scrotum": 1, "semen": 1, "sex": 1, "sh!+": 1, "sh!t": 1, "sh1t": 1, "shag": 1, "shagger": 1, "shaggin": 1, "shagging": 1, "shemale": 1, "shi+": 1, "shit": 1, "shitdick": 1, "shite": 1, "shited": 1, "shitey": 1, "shitfuck": 1, "shitfull": 1, "shithead": 1, "shiting": 1, "shitings": 1, "shits": 1, "shitted": 1, "shitter": 1, "shitters": 1, "shitting": 1, "shittings": 1, "shitty": 1, "skank": 1, "slut": 1, "sluts": 1, "smegma": 1, "smut": 1, "snatch": 1, "son-of-a-bitch": 1, "spac": 1, "spunk": 1, "s_h_i_t": 1, "t1tt1e5": 1, "t1tties": 1, "teets": 1, "teez": 1, "testical": 1, "testicle": 1, "tit": 1, "titfuck": 1, "tits": 1, "titt": 1, "tittie5": 1, "tittiefucker": 1, "titties": 1, "tittyfuck": 1, "tittywank": 1, "titwank": 1, "tosser": 1, "turd": 1, "tw4t": 1, "twat": 1, "twathead": 1, "twatty": 1, "twunt": 1, "twunter": 1, "v14gra": 1, "v1gra": 1, "vagina": 1, "viagra": 1, "vulva": 1, "w00se": 1, "wang": 1, "wank": 1, "wanker": 1, "wanky": 1, "whoar": 1, "whore": 1, "willies": 1, "willy": 1, "xrated": 1, "xxx": 1};
},{}],16:[function(require,module,exports){
module.exports = /\b(4r5e|5h1t|5hit|a55|anal|anus|ar5e|arrse|arse|ass|ass-fucker|asses|assfucker|assfukka|asshole|assholes|asswhole|a_s_s|b!tch|b00bs|b17ch|b1tch|ballbag|balls|ballsack|bastard|beastial|beastiality|bellend|bestial|bestiality|bi\+ch|biatch|bitch|bitcher|bitchers|bitches|bitchin|bitching|bloody|blow job|blowjob|blowjobs|boiolas|bollock|bollok|boner|boob|boobs|booobs|boooobs|booooobs|booooooobs|breasts|buceta|bugger|bum|bunny fucker|butt|butthole|buttmuch|buttplug|c0ck|c0cksucker|carpet muncher|cawk|chink|cipa|cl1t|clit|clitoris|clits|cnut|cock|cock-sucker|cockface|cockhead|cockmunch|cockmuncher|cocks|cocksuck|cocksucked|cocksucker|cocksucking|cocksucks|cocksuka|cocksukka|cok|cokmuncher|coksucka|coon|cox|crap|cum|cummer|cumming|cums|cumshot|cunilingus|cunillingus|cunnilingus|cunt|cuntlick|cuntlicker|cuntlicking|cunts|cyalis|cyberfuc|cyberfuck|cyberfucked|cyberfucker|cyberfuckers|cyberfucking|d1ck|damn|dick|dickhead|dildo|dildos|dink|dinks|dirsa|dlck|dog-fucker|doggin|dogging|donkeyribber|doosh|duche|dyke|ejaculate|ejaculated|ejaculates|ejaculating|ejaculatings|ejaculation|ejakulate|f u c k|f u c k e r|f4nny|fag|fagging|faggitt|faggot|faggs|fagot|fagots|fags|fanny|fannyflaps|fannyfucker|fanyy|fatass|fcuk|fcuker|fcuking|feck|fecker|felching|fellate|fellatio|fingerfuck|fingerfucked|fingerfucker|fingerfuckers|fingerfucking|fingerfucks|fistfuck|fistfucked|fistfucker|fistfuckers|fistfucking|fistfuckings|fistfucks|flange|fook|fooker|fuck|fucka|fucked|fucker|fuckers|fuckhead|fuckheads|fuckin|fucking|fuckings|fuckingshitmotherfucker|fuckme|fucks|fuckwhit|fuckwit|fudge packer|fudgepacker|fuk|fuker|fukker|fukkin|fuks|fukwhit|fukwit|fux|fux0r|f_u_c_k|gangbang|gangbanged|gangbangs|gaylord|gaysex|goatse|God|god-dam|god-damned|goddamn|goddamned|hardcoresex|hell|heshe|hoar|hoare|hoer|homo|hore|horniest|horny|hotsex|jack-off|jackoff|jap|jerk-off|jism|jiz|jizm|jizz|kawk|knob|knobead|knobed|knobend|knobhead|knobjocky|knobjokey|kock|kondum|kondums|kum|kummer|kumming|kums|kunilingus|l3i\+ch|l3itch|labia|lust|lusting|m0f0|m0fo|m45terbate|ma5terb8|ma5terbate|masochist|master-bate|masterb8|masterbat*|masterbat3|masterbate|masterbation|masterbations|masturbate|mo-fo|mof0|mofo|mothafuck|mothafucka|mothafuckas|mothafuckaz|mothafucked|mothafucker|mothafuckers|mothafuckin|mothafucking|mothafuckings|mothafucks|mother fucker|motherfuck|motherfucked|motherfucker|motherfuckers|motherfuckin|motherfucking|motherfuckings|motherfuckka|motherfucks|muff|mutha|muthafecker|muthafuckker|muther|mutherfucker|n1gga|n1gger|nazi|nigg3r|nigg4h|nigga|niggah|niggas|niggaz|nigger|niggers|nob|nob jokey|nobhead|nobjocky|nobjokey|numbnuts|nutsack|orgasim|orgasims|orgasm|orgasms|p0rn|pawn|pecker|penis|penisfucker|phonesex|phuck|phuk|phuked|phuking|phukked|phukking|phuks|phuq|pigfucker|pimpis|piss|pissed|pisser|pissers|pisses|pissflaps|pissin|pissing|pissoff|poop|porn|porno|pornography|pornos|prick|pricks|pron|pube|pusse|pussi|pussies|pussy|pussys|rectum|retard|rimjaw|rimming|s hit|s.o.b.|sadist|schlong|screwing|scroat|scrote|scrotum|semen|sex|sh!\+|sh!t|sh1t|shag|shagger|shaggin|shagging|shemale|shi\+|shit|shitdick|shite|shited|shitey|shitfuck|shitfull|shithead|shiting|shitings|shits|shitted|shitter|shitters|shitting|shittings|shitty|skank|slut|sluts|smegma|smut|snatch|son-of-a-bitch|spac|spunk|s_h_i_t|t1tt1e5|t1tties|teets|teez|testical|testicle|tit|titfuck|tits|titt|tittie5|tittiefucker|titties|tittyfuck|tittywank|titwank|tosser|turd|tw4t|twat|twathead|twatty|twunt|twunter|v14gra|v1gra|vagina|viagra|vulva|w00se|wang|wank|wanker|wanky|whoar|whore|willies|willy|xrated|xxx)\b/gi;
},{}]},{},[8,9,7,2]);
