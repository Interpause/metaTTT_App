/* Lazy stand-in for both custom errors, status code & logging. */
//Specific
module.exports.locked = "BOARD LOCKED";
module.exports.occupied = "SQUARE FULL";
module.exports.started = "GAME STARTED";
module.exports.ended = "GAME ENDED";
module.exports.full = "GAME FULL";
module.exports.move = "MOVE";
module.exports.turn = "TURN";
module.exports.unfound = "NOT FOUND LOL";
//General
module.exports.okay = "OKAY";
module.exports.error = "FAIL";
module.exports.info = "INFO";
module.exports.busy = "BUSY";
//Server commands
module.exports.getSessions = "GET SESSIONS";
module.exports.getSpecSessions = "GET SPEC SESSIONS";
module.exports.createSession = "MAKE ME A GAME";
module.exports.findSession = "FIND ME A GAME";
module.exports.openPoll = "LONG POLLING";
module.exports.join = "JOIN";
module.exports.leave = "LEAVE";
//Client states
module.exports.sessionMenu = "SESSION MENU";
module.exports.spectatorMenu = "SPEC SESSION MENU";
module.exports.creatingSession = "CREATING SESSION";
module.exports.findingSession = "FINDING SESSION";
module.exports.onlineGame = "ONLINE GAME";
module.exports.eventReceived = "EVENT RECEIVED";