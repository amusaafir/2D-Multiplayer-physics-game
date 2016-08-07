var Game = require('./Game');

function Network(io) {
    this.io = io;
    this.game = new Game(io);

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

        socket.on('getWalls', function() {
            var data = [];

            for (var i = 0; i < network.game.map.walls.length; i++) {
                data.push(network.game.map.walls[i].getClientDetails());
            }

            socket.emit('getWalls', data);
        });

        socket.on('getWorldDetails', function() {
            var data = {
                time: network.game.world.time
            };

            socket.emit('getWorldDetails', data);
        });

        // TODO: Add player logic inside the game class
        socket.on('addMainPlayer', function() {
            var player = network.game.addPlayer();
            self.sockets.connected[socket.id].emit('addMainPlayer', player.getClientDetails());
            socket.broadcast.emit('addNewPlayer', player.getClientDetails());
        });

        socket.on('impulse', function(data) {
            network.game.applyForce.playerId = data.id;
            network.game.applyForce.marbleId = data.marbleId;
            network.game.applyForce.x = data.x;
            network.game.applyForce.y = data.y;
            network.game.applyForce.request = true;
            network.game.countSteps = true;

            if (self) {
                self.emit('impulseState', data);
            }
        });
    });
};

module.exports = Network;
