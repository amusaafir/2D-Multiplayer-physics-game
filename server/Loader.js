var Game = require('./Game');
var Network = require('./Network');

function Server(io) {
    console.log('Start the game server.');
    this.network = new Network(io);
}

module.exports = Server;
