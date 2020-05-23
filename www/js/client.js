const enums = require("./enums");

window.client = {
	name:		"Guest",//Online name of client
	cur_gid:	-1,		//ID of current game session (regardless of spectating or playing)
	pid:		-1,		//Player ID, generated only once
	passwd:		-1,		//Player's device password, generated only once
	unloaded:   false,  //Specifies that first state sent should be used to initialize.
	online:		false,	//Flag for eventChecker to stop.
	timeout:	5000,	//Timeout for fetch request including polls
	tries:		3,		//Number of retries, not applicable for polls
	url:		"http://ec2-52-207-243-99.compute-1.amazonaws.com:8080",
	//url:		"http://127.0.0.1:8080",
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
	
	getSavedSessions: function(){
		return this.pingServer(enums.getSessions).then(data => {
			if(data == null) return;
			genSessMenu(data[enums.sessionMenu],false);
		});
	},
	
	getSpecSessions: function(){
		return this.pingServer(enums.getSpecSessions).then(data => {
			if(data == null) return;
			genSessMenu(data[enums.spectatorMenu],true);
		});
	},
	
	findSession: function(){
		return this.pingServer(enums.findSession).then(data => {
			if(data == null) return;
			client.cur_gid = data[enums.findingSession];
		});
	},
	
	joinSession: function(Gid){
		if(Gid == null) Gid = client.cur_gid;
		return this.pingServer(enums.join,{gid:Gid}).then(data => {
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
			if(state.plyrs.indexOf(client.pid) > -1) guiState.forfeitBtn.disabled = false;
			else guiState.forfeitBtn.disabled = true;
			return loadGame(state,true);
		});
	},
	
	quitSession: function(){
		this.pingServer(enums.leave,{gid:this.cur_gid}).then(() => btnBack());
	},
	
	eventLoops: 0, //To ensure that eventChecker isnt spamming.
	eventChecker: function(curLoop){
		if(curLoop == null){
			curLoop = client.eventLoops+1;
			client.eventLoops = client.eventLoops+1;
		}else if(curLoop != client.eventLoops) return;
		//console.log(`LOOP ${curLoop}`);
		this.pingServer(enums.openPoll,{},true).then(data => {
			if(client.online){
				client.eventChecker(curLoop);
				if(data == null) return;				
				if(data.gid != client.cur_gid) return;
				if(!client.unloaded){
					if(data[enums.onlineGame] != null){
						gui.receivePlayersInfo(data[enums.onlineGame].plyrs);
						gui.receiveBoard(data[enums.onlineGame]);
					}
				}else{
					loadGame(data[enums.onlineGame],true);
					client.unloaded = false;
				}
			}
		}).catch((err) => {
			console.log(err);
			console.log("Refreshing long poll...");
			if(client.online) client.eventChecker(curLoop);
		});
	},
	
	makeMove: function(Move){
		this.pingServer(enums.move,{gid:this.cur_gid,move:Move}).then(data => {
			if(data[enums.onlineGame] == null) return;
			gui.receivePlayersInfo(data[enums.onlineGame].plyrs);
			gui.receiveBoard(data[enums.onlineGame]);
		});
	},
	
	/** Wrapper for sendServer that adds standard data, handles errors appropriately, and adds animation for the screen. */
	pingServer: function(command,others,isPoll){
		isPoll = (isPoll==null)?false:isPoll;
		if(!isPoll)displayLoadingIndicator();
		
		let data = (others==null)?{}:others;
		data.cmd = command;
		data.pid = this.pid;
		data.passwd = this.passwd;
		data.name = this.name;
		
		//TODO sendHist and sendEvent
		
		return this.sendServer(data,this.tries,isPoll).then((reply) => {
			console.log(reply);
			if(!isPoll) hideLoadingIndicator();
			//if(reply[enums.eventReceived] != null) //TODO event manager
			return Promise.resolve(reply);
		}).catch((e) => {
			if(!isPoll) hideLoadingIndicator();
			if(e.name != "AbortError"){
				weakInternetAnim();
				console.log(e);
			}
			return Promise.resolve();
		});
	},

	/** Recursive retry based server sending. While accounting for abortion by menu change instead of timeout. */
	sendServer: function(data,tries,isPoll){
		if(tries <= 0) return Promise.reject(new Error(enums.error));
		
		let req = Object.assign({},this.reqConf);
		req.body = JSON.stringify(data);
		
		let controller = new AbortController();
		req.signal = controller.signal;
		this.cur_fetches.push(controller);
		
		let reqDone = false;
		setTimeout(() => {
			if(reqDone) return;
			controller.abort();
		},this.timeout);
		return fetch(this.url,req).then((res) => {
			reqDone = true;
			return res.json();
		}).catch((e) => {
			if(e.name == "AbortError" && this.cur_fetches.length > 0 && !isPoll) return this.sendServer(data,tries-1,isPoll);
			return Promise.reject(e);
		});
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