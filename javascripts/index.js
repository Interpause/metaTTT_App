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
 * Unless required by applicable lhttps://goto.ri.edu.sg/?aw or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const gameState = require("./gameState");
const sessModule = require("./session");
 
window.gen_uuid = function(){
	return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
		(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
	)
}

window.game = null;
window.startLocalGame = function(){
	displayLoadingIndicator();
	game = sessModule.createSession();
	return gui.init(guiConfig,sessModule.gconf,false).then(() => {
		return sessModule.init(game,sessModule.gconf,gui).then(() => {
			for(let i = 0; i < sessModule.gconf.plyr_no; i++) sessModule.addPlayer(game,client.pid);	
			sessModule.start(game);
		});
	}).then(() => {
		return new Promise((callback) => {setTimeout(callback,0)}).then(() => {
			hideLoadingIndicator();
			gui.updateContainer();
		});
	});
}

window.loadGame = function(state,isOnline){
	displayLoadingIndicator();
	if(isOnline==true){
		return gui.init(guiConfig,state.conf,isOnline).then(() => {
			gui.receivePlayersInfo(state.plyrs);
			gui.receiveBoard(state);
			hideLoadingIndicator();
		});
	}else{
		game = sessModule.createSession();
		return gui.init(guiConfig,state.conf,false).then(() => {
			sessModule.restoreSession(game,state,gui);
			sessModule.start(game);
			hideLoadingIndicator();
		}).then(gui.updateContainer);
	}
}

/* Cordova stuff. */
window.app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
		return;
    },

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
		return;
    },
	
	/** On Pause. */
	onAppPause: function(){
		document.getElementById('bgMusic').pause();
		if(game.state.winner == -1) window.localStorage.setItem('save',JSON.stringify(game.state));
		else window.localStorage.removeItem('save');
		return;
	},
	
	/** On Resume. */
	onAppResume: function(){
		document.getElementById('bgMusic').play();
		return;
	},
	
	/** On backKey. */
	onBackKey: function(){
		btnBack();	
		return;		
	},

    // Update DOM on a Received Event
    receivedEvent: function(id) {
		switch(id){
			case "deviceready":
				
				changeFocus(guiState.gamePg);
				guiConfig.cont.style.opacity = 1;
				
				let rconfig = window.localStorage.getItem("settings");
				if(rconfig != null){
					let config = JSON.parse(rconfig);
					//client.url = config.client_url;
					client.name = config.client_name;
					if(!config.performance_mode) genBackgroundClickyTris();
				}else genBackgroundClickyTris();
				
				//FIRST TIMES
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
				let start = undefined; //promise
				if(save==null) start = startLocalGame();
				else{
					try{
						start = loadGame(JSON.parse(save));
					}catch(e){
						console.log(e);
						start = startLocalGame();
					}
				}
				start.then(() => {
					document.getElementById("splash").style.display = "none";
				}).catch((e) => {
					startLocalGame().then(() => {
						console.log("Retry");
						document.getElementById("splash").style.display = "none";
					});
				});
				break;
		}
		return;
    }
};

app.initialize();