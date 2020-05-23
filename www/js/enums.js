/* Lazy stand-in for both custom errors, status code & logging. */
//Specific
exports.locked = "BOARD LOCKED";
exports.occupied = "SQUARE FULL";
exports.started = "GAME STARTED";
exports.ended = "GAME ENDED";
exports.full = "GAME FULL";
exports.move = "MOVE";
exports.turn = "TURN";
exports.unfound = "NOT FOUND LOL";
//General
exports.okay = "OKAY";
exports.error = "FAIL";
exports.info = "INFO";
exports.busy = "BUSY";
//Server commands
exports.getSessions = "GET SESSIONS";
exports.getSpecSessions = "GET SPEC SESSIONS";
exports.createSession = "MAKE ME A GAME";
exports.findSession = "FIND ME A GAME";
exports.openPoll = "LONG POLLING";
exports.join = "JOIN";
exports.leave = "LEAVE";
//Client states
exports.sessionMenu = "SESSION MENU";
exports.spectatorMenu = "SPEC SESSION MENU";
exports.creatingSession = "CREATING SESSION";
exports.findingSession = "FINDING SESSION";
exports.onlineGame = "ONLINE GAME";
exports.eventReceived = "EVENT RECEIVED";