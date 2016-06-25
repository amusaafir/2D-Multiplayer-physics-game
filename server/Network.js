function Network(io, game, p2) {
	this.io = io;
	this.game = game;
	
	this.connect();
}

Network.prototype.connect = function() {
	var self = this.io;

	this.io.sockets.on('connect', function(socket) {
	    self.sockets.connected[socket.id].emit('connected', true);

	    socket.on('getPlayers', function() {
	        /*var data = [];
	        for (var i = 0; i < players.length; i++) {
	            data.push(players[i].getClientDetails());
	        }
	        socket.emit('getPlayers', data);*/
	    });

	    socket.on('getWorldDetails', function() {
	       /* var data = {
	            time: world.time
	        };
	        socket.emit('getWorldDetails', data);*/
	    });

	    socket.on('addMainPlayer', function() {
	        /*var id = players.length;
	        var player = new Player(id, positions.pop());
	        players.push(player);
	        self.sockets.connected[socket.id].emit('addMainPlayer', player.getClientDetails());
	        socket.broadcast.emit('addNewPlayer', player.getClientDetails());*/
	    });

	    socket.on('impulse', function(data) {
	       /* currentId = data.id;
	        currentX = data.x;
	        currentY = data.y;
	        request = true;
	        if (self) {
	           	self.emit('impulseState', data);
	        }*/
	    });
	});
};

module.exports = Network;