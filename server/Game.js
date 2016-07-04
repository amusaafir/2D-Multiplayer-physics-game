var Player = require('./Player');
var Position = require('./Position');
var World = require('./World');

function Game(io) {
	this.io = io;

	this.players = [];
	this.positions = [];
	this.world = new World();

	this.init();
	this.run();
	this.sendState();
	this.postStep();

	// Poststep data
	this.currentId;
	this.currentX;
	this.currentY;
	this.request = false;
}

// TODO: Initialize in constructor; separate the creation of positions; separate world object
Game.prototype.init = function() {
    for (var x = -10; x < 10; x += 3) {
        for (var y = -8; y < 8; y += 3) {
            this.positions.push(new Position(x, y));
        }
    }
};

Game.prototype.run = function() {
	var self = this;
	
	setInterval(function() {
    	self.world.world.step(1/60);
	}, 1000/60);
};

Game.prototype.sendState = function() {
	var self = this;

	setInterval(function() {
		var clientDetails = [];
	    
	    for (var i = 0; i < self.players.length; i++) {
	        clientDetails.push(self.players[i].getClientDetails());
	    }

	    if (self.io) {
	        self.io.emit('state', clientDetails);
	    }
	}, 500);
};

Game.prototype.postStep = function() {
	var self = this;

	this.world.world.on("postStep", function() {
	    if (self.request) {
	        self.players[self.currentId].circleBody.applyForce([self.currentX, self.currentY], self.players[self.currentId].circleBody.position);
	        self.request = false;
	    }
	});
};

Game.prototype.addPlayer = function() {
	var id = this.players.length;
	var startPosition = this.positions.pop();
	var player = new Player(id, startPosition);
	this.world.world.addBody(player.circleBody);
	this.players.push(player);

	return player;
};

module.exports = Game;