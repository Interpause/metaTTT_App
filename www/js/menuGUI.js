const sessModule = require("./session");
const bgGen = require("./triangle_background");
const enums = require("./enums");
const Filter = require("bad-words");
let filter = new Filter();

/** Information about html for code. */
window.guiState = {};

guiState.forfeitBtn = document.getElementById("endSession");
guiState.loadIndicator = document.getElementById("loadingIndicator");
guiState.noInternetIndicator = document.getElementById("weakInternetIndicator");

guiState.clickSnd = document.getElementById('clkSnd');
guiState.rstSnd = document.getElementById('clkSnd');
guiState.tadaSnd = document.getElementById('tadaSnd');
guiState.snrSnd = document.getElementById('snrSnd');

//Get the pages from the document
guiState.gamePg = document.getElementById("gamePg");
guiState.settingsPg = document.getElementById("settingsPg");
guiState.creditsPg = document.getElementById("creditsPg");
guiState.onlinePg = document.getElementById("onlinePg");
guiState.onlineGamePg = document.getElementById("onlineGamePg");
guiState.spectatePg = document.getElementById("spectatePg");

guiState.pgFocus = null;				//Set to gamePg in index via changeFocus()
guiState.backSeq = [guiState.gamePg]; 	//Sequence of pages to return back through.
guiState.header = document.getElementById("onlineGameHeader");

//Functions to be called when focus is switching to the page.
guiState.gamePg.arrive = () => {return Promise.resolve(client.cancelAll())};
guiState.settingsPg.arrive = () => {
	let rconfig = window.localStorage.getItem("settings");
	if(rconfig != null){
		let config = JSON.parse(rconfig);
		let settings = document.getElementById("settingsCont");
		//settings.querySelector("input[name='client_url']").value = config.client_url;
		settings.querySelector("input[name='client_name']").value = config.client_name;
		settings.querySelector("input[name='performance_mode']").checked = config.performance_mode;
	}
	return Promise.resolve();
};
guiState.creditsPg.arrive = () => {return Promise.resolve()};
guiState.onlinePg.arrive = () => {
	client.onlineState = enums.sessionMenu;
	client.getSavedSessions();
	return Promise.resolve();
};
guiState.onlineGamePg.arrive = () => {return onlineGrid()};
guiState.spectatePg.arrive = () => {
	client.getSpecSessions();
	return Promise.resolve();
};

//Functions to be called when focus is leaving from the page.
guiState.gamePg.leave = () => {return Promise.resolve()};
guiState.settingsPg.leave = () => {return Promise.resolve()};
guiState.creditsPg.leave = () => {return Promise.resolve()};
guiState.onlinePg.leave = () => {return Promise.resolve()};
guiState.onlineGamePg.leave = () => {
	if(gui.state.names != null && gui.state.names.length == 1) client.quitSession();
	client.online = false;
	resetGrid();
	return Promise.resolve();
};
guiState.spectatePg.leave = () => {return Promise.resolve()};

//Other handlers
document.getElementById("endSession").addEventListener("click",() => client.quitSession());
document.getElementById("sobtn2").addEventListener("click",() => client.getSpecSessions());

/** Changes page focus and triggers their code... But doesn't change the page. */
window.changeFocus = function(page){
	let chain = undefined;
	if(guiState.pgFocus != null) chain = guiState.pgFocus.leave();
	else chain = Promise.resolve();
	chain = chain.then(() => {return page.arrive()});
	return chain.then(() => guiState.pgFocus = page);
}

/** Function to switch pages and animate it based on the assigned class of the page. */
guiState.pgTransitionInProg = false;
window.switchPg = function(page){
	if(guiState.pgTransitionInProg) return Promise.reject(new Error(enums.busy));
	guiState.pgTransitionInProg = true;

	return changeFocus(page).then(() => {
		page.style.setProperty("display","block");
		return new Promise(callback => setTimeout(() => {
			let curPg = guiState.backSeq[guiState.backSeq.length-1];
			if(guiState.backSeq.length > 1) curPg.classList.remove("pgFocus");
			
			let direction = "translate(0vw,0vh)";
			if(page.classList.contains("pgLeft")) direction = "translateX(100vw)";
			if(page.classList.contains("pgRight")) direction = "translateX(-100vw)";
			if(page.classList.contains("pgTop")) direction = "translateY(100vh)";
			if(page.classList.contains("pgBtm")) direction = "translateY(-100vh)";
			curPg.style.setProperty("transform",direction);
			page.classList.add("pgFocus");
			
			setTimeout(() => {
				curPg.style.setProperty("display","none");
				guiState.backSeq.push(page);
				guiState.pgTransitionInProg = false;
				callback();
			},300); //0.3s was used for transition property in CSS.
		},70)); //Safest minimum time for display block to not cancel transitions.	
	});
}

/** Essentially works like undo to return to previous pages specified by guiState.backSeq. */
window.btnBack = function(){
	if(guiState.pgTransitionInProg) return Promise.reject(new Error(enums.busy));
	guiState.clickSnd.play();
	if(guiState.backSeq.length < 2) return Promise.reject(new Error(enums.error));
	guiState.pgTransitionInProg = true;
	
	let curPg = guiState.backSeq[guiState.backSeq.length-1];
	let prevPg = guiState.backSeq[guiState.backSeq.length-2];
	return changeFocus(prevPg).then(() => {
		prevPg.style.setProperty("display","block");
		return new Promise(callback => setTimeout(() => {
			if(guiState.backSeq.length > 2) prevPg.classList.add("pgFocus");
			curPg.classList.remove("pgFocus");
			prevPg.style.setProperty("transform",null);
			
			setTimeout(() => {
				curPg.style.cssText = null;
				guiState.backSeq.pop();
				guiState.pgTransitionInProg = false;
				callback();
			},300); /* 0.3s was used for transition property in CSS. */
		},70)); /* Safest minimum time for display block to not cancel transitions. */
	});
}
for(btn of document.getElementsByClassName("backBtn")) btn.addEventListener("click", () => btnBack());

/** Handler for buttons on gamePg. Somewhat obsolete but maybe user-initiated actions could have special animations?*/
window.btnGamePg = function(which){
	guiState.clickSnd.play();
	if(guiState.pgFocus != guiState.gamePg) return;
	switch(which){
		case 'settings':
			switchPg(guiState.settingsPg);
			break;
		case 'share':
			break;
		case 'credits':
			switchPg(guiState.creditsPg);
			break;
		case 'feedback':
			LaunchReview.launch();
			break;
		case 'multiplayer':
			switchPg(guiState.onlinePg);
			break;
		case 'puzzle':
			break;
		case 'shop':
			break;
		case 'replay':
			resetGrid();
			break;
	}
}
document.getElementById("mbtn1").addEventListener("click",() => btnGamePg('settings'));
document.getElementById("mbtn2").addEventListener("click",() => btnGamePg('share'));
document.getElementById("mbtn3").addEventListener("click",() => btnGamePg('credits'));
document.getElementById("mbtn4").addEventListener("click",() => btnGamePg('feedback'));
document.getElementById("mbtn5").addEventListener("click",() => btnGamePg('multiplayer'));
document.getElementById("mbtn6").addEventListener("click",() => btnGamePg('puzzle'));
document.getElementById("mbtn7").addEventListener("click",() => btnGamePg('shop'));
document.getElementById("mbtn8").addEventListener("click",() => btnGamePg('replay'));

/** Saves settings in the settingsPg. */
window.saveSettings = function(){
	let settings = document.getElementById("settingsCont");
	let grid_len = settings.querySelector("input[name='grid_len']:checked").value;
	let plyr_no = settings.querySelector("input[name='plyr_no']:checked").value;
	let win_req = settings.querySelector("input[name='win_req']:checked").value;
	//If changes to game size and what not are made then reset the grid. 
	let changed = false;
	if(grid_len != sessModule.gconf['grid_len']){
		sessModule.gconf['grid_len'] = grid_len;
		changed = true;
	}	
	if(plyr_no != sessModule.gconf['plyr_no']){
		sessModule.gconf['plyr_no'] = plyr_no;
		changed = true;
	}
	if(win_req != sessModule.gconf['win_req']){
		sessModule.gconf['win_req'] = win_req;
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
		let bg = document.getElementById("bg");
		while(bg.hasChildNodes()) bg.removeChild(bg.lastChild);
	}else if(!bg.hasChildNodes()) genBackgroundClickyTris();
	
	let savedSettings = {
		client_url:client.url,
		client_name:client.name,
		performance_mode:chkbox.checked
	};
	window.localStorage.setItem("settings",JSON.stringify(savedSettings));
	btnBack();
}
document.getElementById("sbtn1").addEventListener("click",() => saveSettings());

/** Handler for buttons on onlinePg */
window.btnOnlinePg = function(which){
	guiState.clickSnd.play();
	if(guiState.pgFocus != guiState.onlinePg) return;
	switch(which){
		case 'quickPlay':
			client.findSession().then(() => switchPg(guiState.onlineGamePg));
			break;
		case 'spectateMenu':
			switchPg(guiState.spectatePg);
			break;
		case 'refreshPg':
			client.getSavedSessions();
			break;
	}
}
document.getElementById("obtn2").addEventListener("click",() => btnOnlinePg('spectateMenu'));
document.getElementById("obtn3").addEventListener("click",() => btnOnlinePg('refreshPg'));
document.getElementById("obtn4").addEventListener("click",() => btnOnlinePg('quickPlay'));

//Generates menu for joining online game
guiState.sessBars = Array.from(guiState.onlinePg.getElementsByClassName("sessionInfo"));
guiState.specBars = Array.from(guiState.spectatePg.getElementsByClassName("sessionInfo"));
window.genSessMenu = function(data,isSpec){
	let bars = (isSpec==true)? guiState.specBars : guiState.sessBars;
	bars.forEach(bar => bar.style.display = "none");
	let i = 0;
	for(let gid in data){
		let bar = bars[i];
		if(bar == null){
			console.log("More save states sent from server than bars?");
			return;
		}
		let curTurn = data[gid].cur;
		if(data[gid].plyrs[curTurn] == client.pid) bar.getElementsByClassName('sessInfo')[0].innerHTML = `Your Turn @ ${data[gid].turn} moves`;
		else bar.getElementsByClassName('sessInfo')[0].innerHTML = data[gid].names[curTurn] + `'s Turn @ ${data[gid].turn} moves`;
		bar.getElementsByClassName('mini')[0].onclick = () => {
			client.cur_gid = gid;
			switchPg(guiState.onlineGamePg);
		};
		
		bar.setAttribute('gid',gid);
		bar.style.display = "block";
		i++;
	}
}

//Animates the disappearance of the grid
window.hideGrid = function(){
	guiState.rstSnd.play();
	if(guiConfig.cont.style.opacity == 0) return Promise.resolve();
	
	Array.from(document.getElementsByClassName("btn")).forEach(btn => btn.style.setProperty("animation",null));
	guiConfig.cont.style = "";
	guiConfig.cont.style.setProperty("transition","transform 1.2s, opacity 0.4s linear, color 0.5s ease 0.1s");
	guiConfig.cont.style.setProperty("transform","rotate(-1440deg)");
	guiConfig.cont.style.setProperty("opacity","0");
	
	return new Promise(callback => setTimeout(callback,400)); //400ms length of opacity transition
}

//Animates the reappearance of the grid
window.showGrid = function(){
	if(guiConfig.cont.style.opacity == 1) return Promise.resolve();
	guiConfig.cont.style.setProperty("opacity","1");
	return new Promise(callback => {
		setTimeout(() => {
			guiConfig.cont.style.setProperty("transition","color 0.5s ease 0.1s");
			guiConfig.cont.style.setProperty("transform",null);
			callback();			
		},800); //800ms length of remaining rotation transition
	});
}

//Resets the grid
guiState.btnReplayInProg = false;
window.resetGrid = function(){
	if(guiState.btnReplayInProg) return Promise.reject(new Error(enums.busy));
	guiState.btnReplayInProg = true;
	return hideGrid().then(() => {
		gui.state = {};
		guiConfig.cont = document.querySelectorAll(".TTTgame")[0];
		return startLocalGame().then(() => {
			//Not returned, chain ends at game being started since used in page transition.
			showGrid().then(() => guiState.btnReplayInProg = false);
		}); 
	})	
}

//Loads online grid
window.onlineGrid = function(){
	guiConfig.cont = document.querySelectorAll(".TTTgame")[1];
	gui.state = {};
	guiState.header.innerHTML = "Waiting...";
	let conc = [hideGrid(),client.joinSession()];
	Promise.all(conc).then(() => showGrid());
	return conc[0];
}

//Update online GUI header
window.updateHeader = function(){
	if(!client.online) return;
	try{
		if(gui.state.plyrs.length < gui.state.conf.plyr_no) guiState.header.innerHTML = "Waiting...";
		else{
			let curTurn = gui.state.plyr;
			if(gui.state.plyrs[gui.state.plyr] == client.pid) guiState.header.innerHTML = `Your Turn @ ${gui.state.turn} moves`;
			else guiState.header.innerHTML = gui.state.names[gui.state.plyr] + `'s Turn @ ${gui.state.turn} moves`;
		}
	}catch(e){
		return;
	}
}

//Win animation for menu
window.menuWinAnim = function(){
	guiState.tadaSnd.play();
	Array.from(document.getElementsByClassName("btn")).forEach(btn => btn.style.setProperty("animation","winBtn 0.5s linear 0s infinite"));
}

//Small thing pops up in the center of the screen declaring poor internet
window.weakInternetAnim = function(){
	guiState.noInternetIndicator.style.opacity = 1;
	setTimeout(() => guiState.noInternetIndicator.style.opacity = 0,1000);
}

window.displayLoadingIndicator = function(){
	document.getElementById("loadingIndicator").style.opacity = 1;
}
window.hideLoadingIndicator = function(){
	document.getElementById("loadingIndicator").style.opacity = 0;
}

//Generates the interactive background and attaches it.
window.genBackgroundClickyTris = function(){
	let bg = bgGen.genBg();
	bg.style.width = "100%";
	bg.style.height = "auto";
	let tris = bg.querySelectorAll("polygon");
	tris.forEach(tri => {
		tri.onclick = function(){
			guiState.snrSnd.pause();
			guiState.snrSnd.currentTime = 0;
			guiState.snrSnd.play();
			let temp = tri.innerHTML;
			tri.innerHTML = "";
			tri.setAttribute("fill","white");
			setTimeout(() => tri.innerHTML = temp,75);
		};
	});
	document.getElementById("bg").appendChild(bg);
}