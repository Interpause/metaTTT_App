const bgGen = require("./triangle_background");
const enums = require("./common/utils/enums");

/** Information about html for code. */
let guiState = {
	//Get the pages from the document
	gamePg:document.querySelector("#gamePg"),
	settingsPg:document.querySelector("#settingsPg"),
	creditsPg:document.querySelector("#creditsPg"),
	onlinePg:document.querySelector("#onlinePg"),
	onlineGamePg:document.querySelector("#onlineGamePg"),
	spectatePg:document.querySelector("#spectatePg"),

	sessBars:Array.from(document.querySelectorAll("#onlinePg .sessionInfo")),
	specBars:Array.from(document.querySelectorAll("#spectatePg .sessionInfo")),
	header:document.querySelector("#onlineGameHeader"),

	forfeitBtn:document.querySelector("#endSession"),
	loadIndicator:document.querySelector("#loadingIndicator"),
	noInternetIndicator:document.querySelector("#weakInternetIndicator"),

	clickSnd:document.querySelector('#clkSnd'),
	rstSnd:document.querySelector('#clkSnd'),
	tadaSnd:document.querySelector('#tadaSnd'),

	pgFocus:null,		//Set to gamePg in index via changeFocus()
	backSeq:[document.querySelector("#gamePg")], 	//Sequence of pages to return back through.
	pgTransitionInProg:false,
	btnReplayInProg:false
};
window.guiState = guiState;

//Functions to be called when focus is switching to the page.
guiState.gamePg.arrive = async () => window.client.disconnect();
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
guiState.onlinePg.arrive = async () => window.client.connect().then(() => window.client.getSavedSessions());
guiState.onlineGamePg.arrive = async () => window.onlineGrid();
guiState.spectatePg.arrive = async () => window.client.getSpecSessions();

//Functions to be called when focus is leaving from the page.
guiState.gamePg.leave = async () => {};
guiState.settingsPg.leave = async () => {};
guiState.creditsPg.leave = async () => {};
guiState.onlinePg.leave = async () => {};
guiState.onlineGamePg.leave = async () => {
	if(window.gui.state.names != null && window.gui.state.names.length == 1) window.client.quitSession();
	window.client.online = false;
	window.client.gid = null;
	window.resetGrid();
};
guiState.spectatePg.leave = async () => {};

//Other handlers
document.querySelector("#endSession").addEventListener("click",() => window.client.quitSession());
document.querySelector("#sobtn2").addEventListener("click",() => window.client.getSpecSessions());

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

	try{
		await window.changeFocus(page);
	}catch(e){
		guiState.pgTransitionInProg = false;
		throw e;
	}

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

	try{
		await window.changeFocus(prevPg);
	}catch(e){
		guiState.pgTransitionInProg = false;
		throw e;
	}

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
for(let btn of document.querySelectorAll(".backBtn")) btn.addEventListener("click", () => window.btnBack());

/** Handler for buttons on gamePg. Somewhat obsolete but maybe user-initiated actions could have special animations?*/
window.btnGamePg = function(which){
	guiState.clickSnd.play();
	if(guiState.pgFocus != guiState.gamePg) return;
	switch(which){
		case 'settings':window.switchPg(guiState.settingsPg);break;
		case 'share':break;
		case 'credits':window.switchPg(guiState.creditsPg);break;
		case 'feedback':window.LaunchReview.launch();break;
		case 'multiplayer':window.switchPg(guiState.onlinePg);break;
		case 'puzzle':break;
		case 'shop':break;
		case 'replay':window.resetGrid();break;
	}
}
document.querySelector("#mbtn1").addEventListener("click",() => window.btnGamePg('settings'));
document.querySelector("#mbtn2").addEventListener("click",() => window.btnGamePg('share'));
document.querySelector("#mbtn3").addEventListener("click",() => window.btnGamePg('credits'));
document.querySelector("#mbtn4").addEventListener("click",() => window.btnGamePg('feedback'));
document.querySelector("#mbtn5").addEventListener("click",() => window.btnGamePg('multiplayer'));
document.querySelector("#mbtn6").addEventListener("click",() => window.btnGamePg('puzzle'));
document.querySelector("#mbtn7").addEventListener("click",() => window.btnGamePg('shop'));
document.querySelector("#mbtn8").addEventListener("click",() => window.btnGamePg('replay'));

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
	if(changed) window.resetGrid();
	
	let url = settings.querySelector("input[name='client_url']").value;
	window.client.url = (url == "")? window.client.url : url;
	let name = settings.querySelector("input[name='client_name']").value;
	window.client.name = (name == "")? window.client.name : name;
	
	let chkbox = settings.querySelector("input[name='performance_mode']");
	let bg = document.querySelector("#bg");
	if(chkbox.checked) while(bg.hasChildNodes()) bg.removeChild(bg.lastChild);
	else if(!bg.hasChildNodes()) window.generateBg();
	
	let savedSettings = {
		client_url:url,
		client_name:window.client.name,
		performance_mode:chkbox.checked
	};
	window.localStorage.setItem("settings",JSON.stringify(savedSettings));
	window.btnBack();
}
document.querySelector("#sbtn1").addEventListener("click",() => window.saveSettings());

/** Handler for buttons on onlinePg */
window.btnOnlinePg = function(which){
	guiState.clickSnd.play();
	if(guiState.pgFocus != guiState.onlinePg) return;
	switch(which){
		case 'quickPlay':window.client.findSession().then(() => window.switchPg(guiState.onlineGamePg));break;
		case 'spectateMenu':window.switchPg(guiState.spectatePg);break;
		case 'refreshPg':window.client.getSavedSessions();break;
	}
}
document.querySelector("#obtn2").addEventListener("click",() => window.btnOnlinePg('spectateMenu'));
document.querySelector("#obtn3").addEventListener("click",() => window.btnOnlinePg('refreshPg'));
document.querySelector("#obtn4").addEventListener("click",() => window.btnOnlinePg('quickPlay'));

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
		if(barData.plyrs[barData.cur] == window.client.pid) bar.querySelectorAll('.sessInfo')[0].innerHTML = `Your Turn @ ${barData.turn} moves`;
		else bar.querySelectorAll('.sessInfo')[0].innerHTML = barData.names[barData.cur] + `'s Turn @ ${barData.turn} moves`;
		bar.querySelectorAll('.mini')[0].onclick = () => {
			window.client.gid = gid;
			window.switchPg(guiState.onlineGamePg);
		};
		
		bar.setAttribute('gid',gid);
		bar.style.display = "block";
		i++;
	}
}

//Animates the disappearance of the grid
window.hideGrid = async function(){
	guiState.rstSnd.play();
	let cont = window.guiConfig.cont;
	if(cont.style.opacity == 0) return;
	
	Array.from(document.querySelectorAll(".btn")).forEach(btn => btn.style.setProperty("animation",null));
	cont.style = "";
	cont.style.setProperty("transition","transform 1.2s, opacity 0.4s linear, color 0.5s ease 0.1s");
	cont.style.setProperty("transform","rotate(-1440deg)");
	cont.style.setProperty("opacity","0");
	
	return wait(400); //400ms length of opacity transition
}

//Animates the reappearance of the grid
window.showGrid = async function(){
	let cont = window.guiConfig.cont;
	if(cont.style.opacity == 1) return;
	cont.style.setProperty("opacity","1");

	await wait(800); //800ms length of remaining rotation transition
	cont.style.setProperty("transition","color 0.5s ease 0.1s");
	cont.style.setProperty("transform",null);
}

//Resets the grid
window.resetGrid = async function(){
	if(guiState.btnReplayInProg) throw new Error(enums.busy);
	guiState.btnReplayInProg = true;
	await window.hideGrid();
	window.gui.state = {};
	window.guiConfig.cont = document.querySelector("#gamePg .TTTgame");
	await window.startLocalGame();
	await window.showGrid();
	guiState.btnReplayInProg = false
}

//Loads online grid
window.onlineGrid = async function(){
	window.guiConfig.cont = document.querySelector("#onlineGamePg .TTTgame");
	window.gui.state = {};
	guiState.header.innerHTML = "Waiting...";
	let conc = [window.hideGrid(),window.client.joinSession()];
	await Promise.all(conc);
	return window.showGrid();
}

//Update online GUI header
window.updateHeader = function(){
	if(!window.client.online) return;
	let state = window.gui.state;
	if(state.player_ids.length < state.config.num_players) guiState.header.innerHTML = "Waiting...";
	else{
		if(state.cur_player == window.client.pid) guiState.header.innerHTML = `Your Turn @ ${state.turns} moves`;
		else guiState.header.innerHTML = state.names[state.cur_player_ind] + `'s Turn @ ${state.turns} moves`;
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