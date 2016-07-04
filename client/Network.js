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
            console.log('Attempting to connect another time..');
            tryConnect();
        }, 2000);
    }
};

Network.prototype.connected = function() {
    this.getPlayers();
    this.getWorldDetails();
    this.addMainPlayer();
    this.addNewPlayer();
    this.receiveState();
    this.receiveImpulseState();
};

Network.prototype.getPlayers = function() {
    var self = this;

    this.socket.emit('getPlayers', null);

    this.socket.on('getPlayers', function(playersData) {
        for (var i = 0; i < playersData.length; i++) {
            self.game.addPlayer(playersData[i].id, playersData[i].position[0], playersData[i].position[1]);
            self.game.players[i].circleBody.velocity = playersData[i].velocity;
            self.game.players[i].circleBody.angularVelocity = playersData[i].angularVelocity;
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
        self.game.addPlayer(player.id, player.position[0], player.position[1]);
    });
};

Network.prototype.addNewPlayer = function() {
    var self = this;

    this.socket.on('addNewPlayer', function(player) {
        self.game.addPlayer(player.id, player.position[0], player.position[1]);
    });
};

Network.prototype.receiveState = function() {
    var self = this;

    this.socket.on('state', function(playersData) {
        for (var i = 0; i < self.game.players.length; i++) {
            //players[i].circleBody.position = playersData[i].position;
            //players[i].circleBody.velocity = playersData[i].velocity;
            self.game.players[i].shadowX = playersData[i].position[0]
            self.game.players[i].shadowY = playersData[i].position[1];
        }
    });
};

Network.prototype.receiveImpulseState = function() {
    var self = this;

    this.socket.on('impulseState', function(data) {
        if (data.id != self.game.mainPlayerId) {
            self.game.currentId = data.id;
            self.game.currentX = data.x;
            self.game.currentY = data.y;
            self.game.request = true;
        }
    });
};

Network.prototype.setTrajectory = function(x, y) {
    var self = this;

    this.socket.emit('impulse', {
        id: self.game.mainPlayerId,
        x: x,
        y: y
    });
};
