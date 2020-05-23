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
			//client.url = config.client_url;
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