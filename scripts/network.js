var Network = function() {
	this.socket = io.connect();
	this.tryConnect();
};

Network.prototype.tryConnect = function() {
	if(this.socket.emit('connect', null)) {
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
    this.socket.emit('getPlayers', null);
    this.socket.on('getPlayers', function(playersData) {
	    console.log('getplayers!');
    });
};

Network.prototype.getWorldDetails = function() {
    this.socket.emit('getWorldDetails', null);
    this.socket.on('getWorldDetails', function(data) {
        console.log('world details!');
    });
};

Network.prototype.addMainPlayer = function() {
    this.socket.emit('addMainPlayer', null);
    this.socket.on('addMainPlayer', function(player) {
        console.log('addmainplayer!');
    });
};

Network.prototype.addNewPlayer = function() {
    this.socket.on('addNewPlayer', function(player) {
        console.log('add new player!');
    });
}

Network.prototype.receiveState = function() {
    this.socket.on('state', function(playersData) {
        console.log('receiveState');
    });
};

Network.prototype.receiveImpulseState = function() {
    this.socket.on('impulseState', function(data) {
        console.log('receiveimpulsestate');
    });
}