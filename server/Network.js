var Player = require('./Player');

function Network(io, game) {
	this.io = io;
	this.game = game;
	
	this.connect();
}

Network.prototype.connect = function() {
	var network = this;
	var self = this.io;

	this.io.sockets.on('connect', function(socket) {
	    self.sockets.connected[socket.id].emit('connected', true);

	    socket.on('getPlayers', function() {
	        var data = [];

	        for (var i = 0; i < network.game.players.length; i++) {
	            data.push(network.game.players[i].getClientDetails());
	        }

	        socket.emit('getPlayers', data);
	    });

	    socket.on('getWorldDetails', function() {
	        var data = {
	            time: network.game.world.time
	        };

	        socket.emit('getWorldDetails', data);
	    });

	    // TODO: Add add player logic inside the game class
	    socket.on('addMainPlayer', function() {
	        var id = network.game.players.length;
	        var player = new Player(id, network.game.positions.pop());
	        network.game.world.addBody(player.circleBody);
	        network.game.players.push(player);
	        self.sockets.connected[socket.id].emit('addMainPlayer', player.getClientDetails());
	        socket.broadcast.emit('addNewPlayer', player.getClientDetails());
	    });

	    socket.on('impulse', function(data) {
	    	console.log('impulse received');
	       	network.game.currentId = data.id;
	        network.game.currentX = data.x;
	        network.game.currentY = data.y;
	        network.game.request = true;
	        
	        if (self) {
	           	self.emit('impulseState', data);
	        }
	    });
	});
};

module.exports = Network;