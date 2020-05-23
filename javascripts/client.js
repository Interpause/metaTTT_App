const enums = require("./common/utils/enums");

window.client = {
	name:		"Guest",//Online name of client
	cur_gid:	-1,		//ID of current game session (regardless of spectating or playing)
	pid:		-1,		//Player ID, generated only once
	passwd:		-1,		//Player's device password, generated only once
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