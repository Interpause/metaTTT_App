const enums = require("./common/utils/enums");
const EventEmitter = require("events");

const once = (emitter,event) => new Promise(callback => emitter.once(event,() => callback()));

window.client = Object.assign(new EventEmitter(),{
	name:		"Guest",//Online name of client
	cur_gid:	null,	//ID of current game session (regardless of spectating or playing)
	pid:		null,	//Player ID, generated only once
	passwd:		null,	//Player's device password, generated only once
    online:     false,
    ws:         null,
    //url:		"ws://127.0.0.1:8080",
    url:		"ws://metattt-server.glitch.me",

    connect_ws:function(){
        return new Promise((resolve,reject) => {
            let sock = new WebSocket(client.url);
            sock.onopen = () => resolve(sock);
            sock.onerror = e => reject(e);
        });
    },

    connect:async function(){
        if(client.ws && client.ws.readyState == 1) return;
        client.online = false;
        
        console.log("connecting...");
        displayLoadingIndicator();
        try{
            client.ws = await client.connect_ws();
        }catch(e){
            hideLoadingIndicator();
            weakInternetAnim();
            console.error(e);
            throw e;
        }

        client.ws.onerror = e => {
            if(client.ws.readyState == 3){
                hideLoadingIndicator();
                weakInternetAnim();
            }
            console.error(e);
        }
        client.ws.onclose = e =>{
            if(client.online){ //disconnect(): client.online = false, wont retry. closeEvent: client.online still true, retries.
                weakInternetAnim();
                console.log(e);
                console.log("reconnecting...");
                client.connect();
            }
        }
        client.ws.onmessage = raw => {
            client.online = true;
            let msg = JSON.parse(raw.data);
            if(Array.isArray(msg)){
                msg.forEach(event => {
                    client.emit(event.event,event.data);
                    console.log(event);
                });
            }else{
                client.emit(msg.event,msg.data);
                console.log(msg);
            }      
        }
        //"authentication"
        await once(client,enums.connect);
        client.sendServer(enums.connect,{
            'pid':client.pid,
            'passwd':client.passwd,
            'name':client.name
        });
        return once(client,enums.okay);
    },
    disconnect:function(e){
        client.online = false;
        console.log("disconnected existing socket");
        if(client.ws == null) return;
        client.ws.close();
        client.ws = null;
        hideLoadingIndicator();
    },
    sendServer:async function(event,data){
        await client.connect();
        client.ws.send(JSON.stringify({
            'event':event,
            'data':data
        }));
    },
    updateState:async function(state){
        if(state == null) throw new Error(`${enums.null}: Null state`);
        if(state == enums.error) throw new Error(`${enums.error}: error state received`);
        client.cur_gid = state.gid;
        //TODO: not elegant
        if(state.player_ids.indexOf(client.pid) > -1) guiState.forfeitBtn.disabled = false; 
        else guiState.forfeitBtn.disabled = true;
        return loadGame(state,true);
    },
    getSavedSessions:async function(){
        displayLoadingIndicator();
        client.sendServer(enums.getSessions);
        await once(client,enums.getSessions);
        hideLoadingIndicator();
    },
    getSpecSessions:async function(){
        displayLoadingIndicator();
        client.sendServer(enums.getSpecSessions);
        await once(client,enums.getSpecSessions);
        hideLoadingIndicator();
    },
    findSession:async function(){
        displayLoadingIndicator();
        client.sendServer(enums.findSession);
        await once(client,enums.findSession);
        hideLoadingIndicator();
    },
    joinSession:async function(gid){
        displayLoadingIndicator();
        if(gid == null) gid = client.cur_gid;
        let state = {};
        client.sendServer(enums.join,{'gid':gid});
        client.once(enums.join,data => state = data);
        await once(client,enums.join);
        await once(client,enums.updateState);
        hideLoadingIndicator();
    },
    quitSession:async function(){
        client.sendServer(enums.leave,{'gid':client.cur_gid});
        btnBack();
        return once(client,enums.leave);
    },
    makeMove:async function(move){
        displayLoadingIndicator();
        client.sendServer(enums.move,{'gid':client.cur_gid,'move':move});
        await once(client,enums.move);
        hideLoadingIndicator();
    }
});

client.on(enums.getSessions,data => genSessMenu(data,false));
client.on(enums.getSpecSessions,data => genSessMenu(data,true));
client.on(enums.findSession,data => client.cur_gid = data);
client.on(enums.updateState,client.updateState);