var Player = require('./entities/Player');
var World = require('./world/World');
var Material = require('./world/Material');
var MapPicker = require('./maps/MapPicker');

function Game(io) {
    this.io = io;

    this.players = [];
    this.material = new Material();
    this.world = new World(this.material);
    
    this.map = new MapPicker(this.material, this.world).selectDefaultMap();

    this.run();
    this.sendState();
    this.postStep();

    // Poststep data
    this.currentId;
    this.marbleId;
    this.currentX;
    this.currentY;
    this.request = false;
}

Game.prototype.run = function() {
    var self = this;

    setInterval(function() {
        self.world.world.step(1 / 120);
    }, 1000 / 120);
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
            var marblesContext = self.players[self.currentId].marbles;
            marblesContext[self.marbleId].circleBody.applyForce([self.currentX, self.currentY], marblesContext[self.marbleId].circleBody.position);
            self.request = false;
        }
    });
};

Game.prototype.addPlayer = function() {
    var id = this.players.length;
    var player = new Player(id);

    // Add a marble
    player.addMarble(id, this.map.positions.pop(), this.material.getBallMaterial(), this.world.world);
    // Add another marble (this will not be shown since this is not being sent yet to the client)
    player.addMarble(id, this.map.positions.pop(), this.material.getBallMaterial(), this.world.world);
    
    this.players.push(player);

    return player;
};

module.exports = Game;
