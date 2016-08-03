var Player = require('./entities/Player');
var Wall = require('./entities/Wall');
var Position = require('./Position');
var World = require('./world/World');
var Material = require('./world/Material');

function Game(io) {
    this.io = io;

    this.players = [];
    this.walls = [];
    this.positions = [];
    this.material = new Material();
    this.world = new World(this.material);
    
    this.loadScenery(); // TODO: Create separate 'scene' object
    this.run();
    this.sendState();
    this.postStep();

    // Poststep data
    this.currentId;
    this.currentX;
    this.currentY;
    this.request = false;
}

Game.prototype.loadScenery = function() {
    this.initPlayerPositions();
    this.createWalls();
};

Game.prototype.initPlayerPositions = function() {
    for (var x = -10; x < 10; x += 3) {
        for (var y = -8; y < 8; y += 3) {
            this.positions.push(new Position(x, y));
        }
    }
};

Game.prototype.createWalls = function() {
    this.addWall();
};

Game.prototype.addWall = function() {
    var wall = new Wall(this.material.getBallMaterial());
    this.world.world.addBody(wall.boxBody);
    this.walls.push(wall);
};

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
            var marblesContext = self.players[i].marbles;
            clientDetails.push(marblesContext[marblesContext.length-1].getClientDetails());
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
            marblesContext[marblesContext.length-1].circleBody.applyForce([self.currentX, self.currentY], marblesContext[marblesContext.length-1].circleBody.position);
            self.request = false;
        }
    });
};

Game.prototype.addPlayer = function() {
    var id = this.players.length;
    var player = new Player(id);

    // Add a marble
    player.addMarble(id, this.positions.pop(), this.material.getBallMaterial(), this.world.world);
    // Add another marble (this will not be shown since this is not being sent yet to the client)
    player.addMarble(id, this.positions.pop(), this.material.getBallMaterial(), this.world.world);
    
    this.players.push(player);

    return player;
};

module.exports = Game;
