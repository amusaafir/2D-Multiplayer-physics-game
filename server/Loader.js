function Server() {
	console.log('Start the game server.');
};

Server.prototype.load = function() {
	console.log('Load game');
};

module.exports = new Server();