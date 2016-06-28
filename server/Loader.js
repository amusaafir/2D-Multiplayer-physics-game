var Game = require('./Game');
var Network = require('./Network');
var Player = require('./Player');

function Server(io) {
	console.log('Start the game server.');
	this.network = new Network(io);
}

module.exports = Server;

