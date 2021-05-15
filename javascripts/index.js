const Session = require("./common/classes/session");
const gameState = require("./common/classes/gameState");
window.gconf = require("./common/utils/game_config");
require("./common/utils/utils");

window.game = null;
window.startLocalGame = async function(){
	window.displayLoadingIndicator();
	await window.gui.init(window.guiConfig,window.gconf,false);
	let game = new Session(window.gui);
	game.init(window.gconf);
	for(let i = 0; i < window.gconf.num_players; i++) game.addPlayer(window.client.pid);
	game.start();
	window.game = game;
	window.hideLoadingIndicator();
}

window.loadGame = async function(statedata,isOnline){
	window.displayLoadingIndicator();
	await window.gui.init(window.guiConfig,statedata.config,isOnline);
	if(isOnline){
		let state = new gameState(statedata,true);
		state.names = statedata.names; //TODO: PID based retrieval
		window.gui.receivePlayersInfo(state.player_ids);
		window.gui.receiveBoard(state);
	}else{
		let game = new Session(window.gui);
		game.restoreSession(statedata);
		game.start();
		window.game = game;
	}
	window.hideLoadingIndicator();
}

/* Cordova stuff. */
let app = {
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
		window.StatusBar.hide();
		this.receivedEvent('deviceready');
	},
	
	/** On Pause. */
	onAppPause: function(){
		document.querySelector('#bgMusic').pause();
		if(window.game.state.winner == -1) window.localStorage.setItem('save',JSON.stringify(window.game.state));
		else window.localStorage.removeItem('save');
	},
	
	/** On Resume. */
	onAppResume: function(){
		document.querySelector('#bgMusic').play();
	},
	
	/** On backKey. */
	onBackKey: function(){
		window.btnBack();	
	},

	// Update DOM on a Received Event
	receivedEvent: async function(id) {
		if(id != "deviceready") return;
		window.changeFocus(window.guiState.gamePg);
		window.guiConfig.cont.style.opacity = 1;
		
		let rconfig = window.localStorage.getItem("settings");
		if(rconfig != null){
			let config = JSON.parse(rconfig);
			if(config.client_url != "") window.client.url = config.client_url;
			window.client.name = config.client_name;
			if(!config.performance_mode) window.generateBg();
		}else window.generateBg();
		
		//first time
		let clientid = window.localStorage.getItem("clientid");
		if(clientid==null) clientid = gen_uuid();
		let passwd = window.localStorage.getItem("passwd");
		if(passwd==null) passwd = gen_uuid();
		window.client.pid = clientid;
		window.client.passwd = passwd;
		window.localStorage.setItem("clientid",window.client.pid);
		window.localStorage.setItem("passwd",window.client.passwd);
		//TODO tutorial done flag.
		
		let save = window.localStorage.getItem('save');
		if(save==null) await window.startLocalGame();
		else{
			try{
				await window.loadGame(JSON.parse(save),false);
			}catch(e){
				console.log(e);
				await window.startLocalGame();
			}
		}
		
		if(cordova.platformId == "browser") document.querySelector(".app").classList.add("browser");
		document.querySelector("#splash").style.display = "none";
	}
};
window.app = app;
app.initialize();