var Network = function(game) {
    this.game = game;
    this.socket = io.connect();
    this.tryConnect();
};

Network.prototype.tryConnect = function() {
    if (this.socket.emit('connect', null)) {
        console.log('Successfully connected.');
        this.connected();
    } else {
        setTimeout(function() {
            console.log('Attempting to connect..');
            tryConnect();
        }, 2000);
    }
};

Network.prototype.connected = function() {
    this.getPlayers();
    this.getWalls();
    this.getWorldDetails();
    this.addMainPlayer();
    this.addNewPlayer();
    this.receiveState();
    this.receiveImpulseState();
    this.syncPositionsWithServer();
};

Network.prototype.getPlayers = function() {
    var self = this;

    this.socket.emit('getPlayers', null);

    this.socket.on('getPlayers', function(playersData) {
        for (var i = 0; i<playersData.length; i++) {
            var player = self.game.addPlayer(playersData[i].id, playersData[i].marbles, false);

            for(var m=0; m<player.marbles.length; m++) {
                player.marbles[m].circleBody.velocity = playersData[i].marbles[m].velocity;
                player.marbles[m].circleBody.angularVelocity = playersData[i].marbles[m].angularVelocity;
            }
        }
    });
};

Network.prototype.getWalls = function() {
    var self = this;

    this.socket.emit('getWalls', null);

    this.socket.on('getWalls', function(wallsData) {
        for (var i = 0; i < wallsData.length; i++) {
            self.game.addWall(wallsData[i].position[0], wallsData[i].position[1], wallsData[i].width, wallsData[i].height, wallsData[i].angle, wallsData[i].mass, wallsData[i].velocity, wallsData[i].angularVelocity, wallsData[i].angle);
        }
    });
};

Network.prototype.getWorldDetails = function() {
    var self = this;

    this.socket.emit('getWorldDetails', null);

    this.socket.on('getWorldDetails', function(data) {
        self.game.world.time = data.time;
    });
};

Network.prototype.addMainPlayer = function() {
    var self = this;

    this.socket.emit('addMainPlayer', null);

    this.socket.on('addMainPlayer', function(player) {
        self.game.mainPlayerId = player.id;
        self.game.addPlayer(player.id, player.marbles, true);
    });
};

Network.prototype.addNewPlayer = function() {
    var self = this;

    this.socket.on('addNewPlayer', function(player) {
        self.game.addPlayer(player.id, player.marbles, false);
    });
};

Network.prototype.receiveState = function() {
    var self = this;

    this.socket.on('state', function(playersData) { // List containing clientdata for each player
        if(playersData.length == self.game.players.length) {
            for(var i = 0; i < playersData.length; i++) {
                var playerMarbles = playersData[i].marbles;

                if(playerMarbles.length != playersData[i].marbles.length) {
                    console.log('Inconsistent marbles for player ' + i);
                    continue;
                } else {
                    for(var m = 0; m < playerMarbles.length; m++) {
                        self.game.players[i].marbles[m].shadowX = playersData[i].marbles[m].position[0];
                        self.game.players[i].marbles[m].shadowY = playersData[i].marbles[m].position[1];
                    }
                }
            }
        } else {
            console.log('State error: players inconsistent.');
        }
    });
};

Network.prototype.syncPositionsWithServer = function() {
    var self = this;

    this.socket.on('sync', function(clientData) { // List containing clientdata for each player
        self.game.clientData = clientData;
    });
};

Network.prototype.receiveImpulseState = function() {
    var self = this;

    this.socket.on('impulseState', function(data) { 
        if (data.id != self.game.mainPlayerId) { // TODO: extract to separate method inside the game class
            self.game.applyForce.playerId= data.id;
            self.game.applyForce.marbleId = data.marbleId;
            self.game.applyForce.x = data.x;
            self.game.applyForce.y = data.y;
            self.game.applyForce.request = true;
            self.game.countSteps = true;
        }
    });
};

Network.prototype.setTrajectory = function(marbleId, x, y) {
    var self = this;
    
    this.socket.emit('impulse', {
        id: self.game.mainPlayerId,
        marbleId: marbleId,
        x: x,
        y: y
    });
};

module.exports = Network;