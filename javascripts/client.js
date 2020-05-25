const enums = require("./common/utils/enums");
const EventEmitter = require("events");
const once = (emitter,event) => new Promise(callback => emitter.once(event,() => callback()));

let client = Object.assign(new EventEmitter(),{
	name:		"Guest",//Online name of client
	gid:	    null,	//ID of current game session (regardless of spectating or playing)
	pid:		null,	//Player ID, generated only once
	passwd:		null,	//Player's device password, generated only once
    online:     false,
    ws:         null,
    //url:		"ws://127.0.0.1:8080",
    url:		"ws://metattt-server.glitch.me"
});
window.client = client;

client.connect_ws = function(){
    return new Promise((resolve,reject) => {
        let sock = new WebSocket(this.url);
        sock.onopen = () => resolve(sock);
        sock.onerror = e => reject(e);
    });
};

client.connect = async function(){
    if(this.ws && this.ws.readyState == 1) return;
    this.online = false;
    
    console.log("connecting...");
    window.displayLoadingIndicator();
    try{
        this.ws = await this.connect_ws();
    }catch(e){
        window.hideLoadingIndicator();
        window.weakInternetAnim();
        throw e;
    }

    this.ws.onerror = e => {
        if(this.ws.readyState == 3){
            window.hideLoadingIndicator();
            window.weakInternetAnim();
        }
        console.error(e);
    }
    this.ws.onclose = e =>{
        if(this.online){ //disconnect(): this.online = false, wont retry. closeEvent: this.online still true, retries.
            window.weakInternetAnim();
            console.log(e);
            console.log("reconnecting...");
            this.connect();
        }
    }
    this.ws.onmessage = raw => {
        this.online = true;
        let msg = JSON.parse(raw['data']);
        if(!Array.isArray(msg)) msg = [msg];
        msg.forEach(event => {
            this.emit(event['event'],event['data']);
            console.log(event);
        });
    }
    //"authentication"
    await once(this,enums.connect);
    this.sendServer(enums.connect,{
        'pid':this.pid,
        'passwd':this.passwd,
        'name':this.name
    });
    return once(this,enums.okay);
};

client.disconnect = function(e){
    this.online = false;
    console.log("disconnected existing socket");
    if(this.ws == null) return;
    this.ws.close();
    this.ws = null;
    window.hideLoadingIndicator();
};

client.sendServer = async function(event,data){
    await this.connect();
    this.ws.send(JSON.stringify({
        'event':event,
        'data':data
    }));
};

client.updateState = async function(state){
    if(state == null) throw new Error(`${enums.null}: Null state`);
    if(state == enums.error) throw new Error(`${enums.error}: error state received`);
    this.gid = state.gid;
    //TODO: not elegant
    if(state.player_ids.indexOf(this.pid) > -1) window.guiState.forfeitBtn.disabled = false; 
    else window.guiState.forfeitBtn.disabled = true;
    return window.loadGame(state,true);
};

client.getSavedSessions = async function(){
    console.log(this);
    window.displayLoadingIndicator();
    this.sendServer(enums.getSessions);
    await once(this,enums.getSessions);
    window.hideLoadingIndicator();
};

client.getSpecSessions = async function(){
    window.displayLoadingIndicator();
    this.sendServer(enums.getSpecSessions);
    await once(this,enums.getSpecSessions);
    window.hideLoadingIndicator();
};

client.findSession = async function(){
    window.displayLoadingIndicator();
    this.sendServer(enums.findSession);
    await once(this,enums.findSession);
    window.hideLoadingIndicator();
};

client.joinSession = async function(gid){
    window.displayLoadingIndicator();
    if(gid == null) gid = this.gid;
    this.sendServer(enums.join,{'gid':gid});
    await once(this,enums.join);
    await once(this,enums.updateState);
    window.hideLoadingIndicator();
};

client.quitSession = async function(){
    this.sendServer(enums.leave,{'gid':this.gid});
    window.btnBack();
    return once(this,enums.leave);
};

client.makeMove = async function(move){
    window.displayLoadingIndicator();
    this.sendServer(enums.move,{'gid':this.gid,'move':move});
    await once(this,enums.move);
    window.hideLoadingIndicator();
};

client.on(enums.getSessions,data => window.genSessMenu(data,false));
client.on(enums.getSpecSessions,data => window.genSessMenu(data,true));
client.on(enums.findSession,data => client.gid = data);
client.on(enums.updateState,client.updateState);