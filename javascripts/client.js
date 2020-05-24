const enums = require("./common/utils/enums");
const {once,EventEmitter} = require("events");

window.client = Object.assign(new EventEmitter(),{
	name:		"Guest",//Online name of client
	cur_gid:	null,	//ID of current game session (regardless of spectating or playing)
	pid:		null,	//Player ID, generated only once
	passwd:		null,	//Player's device password, generated only once
    online:     false,
    ws:         null,
    url:		"ws://127.0.0.1:8080",
    //url:		"ws://metattt-server.glitch.me",

    connect:async function(){
        if(this.ws!=null) this.disconnect();
        this.ws = new WebSocket(this.url);
        console.log("connecting...");
        displayLoadingIndicator();

        this.ws.onerror = e => console.error(e);
        this.ws.onclose = e =>{
            if(this.online){ //disconnect(): this.online = false, wont retry. closeEvent: this.online still true, retries.
                weakInternetAnim();
                console.log(e);
                console.log("reconnecting...");
                this.connect(); //since ws isnt null yet, disconnect is called, ensuring this.online = false
            }
        }
        this.ws.onmessage = raw => {
            this.online = true;
            hideLoadingIndicator();
            let msg = JSON.parse(raw.data);
            if(Array.isArray(msg)){
                msg.forEach(event => {
                    this.emit(event.event,event.data);
                    console.log(event);
                });
            }else{
                this.emit(msg.event,msg.data);
                console.log(msg);
            }      
        }
        //"authentication"
        await once(this,enums.connect);
        this.sendServer(enums.connect,{
            'pid':this.pid,
            'passwd':this.passwd,
            'name':this.name
        });
        return await once(this,enums.okay);
    },
    disconnect:function(e){
        this.online = false;
        if(this.ws.readyState==1) this.sendServer(enums.disconnect);
        this.ws.close();
        this.ws = null;
        console.log("disconnected existing socket");
    },
    sendServer:async function(event,data){
        if(!this.online) throw new Error(`${enums.error}: Not connected to server!`);
        displayLoadingIndicator();
        this.ws.send({
            'event':event,
            'data':data
        });
    },
    updateState:async function(state){
        if(state == null) throw new Error(`${enums.null}: Null state`);
        if(state == enums.error) throw new Error(`${enums.error}: error state received`);
        client.cur_gid = state.gid;
        //TODO: not elegant
        if(state.player_ids.indexOf(client.pid) > -1) guiState.forfeitBtn.disabled = false; 
        else guiState.forfeitBtn.disabled = true;
        return await loadGame(state,true);
    },
    getSavedSessions:async function(){
        this.sendServer(enums.getSessions);
        return await once(this,enums.getSessions);
    },
    getSpecSessions:async function(){
        this.sendServer(enums.getSpecSessions);
        return await once(this,enums.getSpecSessions);
    },
    findSession:async function(){
        this.sendServer(enums.findSession);
        return await once(this,enums.findSession);
    },
    joinSession:async function(gid){
        if(gid == null) gid = this.cur_gid;
        let state = {};
        this.sendServer(enums.join,{'gid':gid});
        this.once(enums.join,data => state = data);
        await once(this,enums.join);
        return await once(this,enums.updateState);
    },
    quitSession:async function(){
        btnBack();
        this.sendServer(enums.leave,{'gid':this.cur_gid});
        return await once(this,enums.leave);
    },
    makeMove:async function(move){
        this.sendServer(enums.move,{'gid':this.cur_gid,'move':move});
        return await once(this,enums.move);
    }
});

client.on(enums.getSessions,data => genSessMenu(data,false));
client.on(enums.getSpecSessions,data => genSessMenu(data,true));
client.on(enums.findSession,data => client.cur_gid = data);
client.on(enums.updateState,client.updateState);