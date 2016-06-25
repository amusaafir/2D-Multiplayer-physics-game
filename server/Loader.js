// TODO: Pass Game object to Network object. The game object should require the physics.
var Game = require('./Game');
var Network = require('./Network');
var Player = require('./Player');

function Server(io) {
	console.log('Start the game server.');
	
	this.game = new Game(io);
	this.network = new Network(io, this.game);
}

module.exports = Server;

