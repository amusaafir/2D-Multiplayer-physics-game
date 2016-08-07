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

    // Poststep data
    this.applyForce = {
        playerId: null,
        marbleId: null,
        x: null,
        y: null,
        request: false
    };

    this.countSteps = false;
    this.step = 0;
    this.maxStep = 1000;

    this.run();
    this.sendState();
    this.postStep();
}

Game.prototype.run = function() {
    var self = this;

    setInterval(function() {
        if(self.countSteps) {
            var fastForwardSpeed = 10;
            for(var i=0; i<fastForwardSpeed; i++) { // Fast forward physics simulation
                self.world.world.step(1 / 120);

                self.step++;
                if(self.step==self.maxStep) {
                    console.log('Enforce v=0.');
                    var bodies = self.world.world.bodies;
                    for(var i=0; i<bodies.length; i++) { // Enforce v = 0 for all bodies
                        bodies[i].velocity[0] = 0;
                        bodies[i].velocity[1] = 0; 
                        self.syncClientsPositions();
                    }
                    self.step = 0;
                    self.countSteps = false;
                }
            }
        }
    }, 1000 / 120);
};

// TODO: Remove later (only for debugging)
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

// TODO: Through network class?
Game.prototype.syncClientsPositions = function() {
    var players = [];
    var walls = [];
    var clientDetails = {};

    for (var i = 0; i < this.players.length; i++) {
        players.push(this.players[i].getClientDetails());
    }

    for (var i = 0; i < this.map.walls.length; i++) {
        walls.push(this.map.walls[i].getClientDetails());
    }    

    clientDetails.walls = walls;
    clientDetails.players = players;
    
    this.io.emit('sync', clientDetails);
};

Game.prototype.postStep = function() {
    var self = this;

    this.world.world.on("postStep", function() {
        if (self.applyForce.request) {
            var marblesContext = self.players[self.applyForce.playerId].marbles;
            marblesContext[self.applyForce.marbleId].circleBody.applyForce([self.applyForce.x, self.applyForce.y], marblesContext[self.applyForce.marbleId].circleBody.position);
            self.applyForce.request = false;
        }
    });
};

Game.prototype.addPlayer = function() {
    var id = this.players.length;
    var player = new Player(id);

    for(var i=0; i<this.map.initialNumberMarblesPerPlayer; i++) {
        player.addMarble(id, this.map.positions.pop(), this.material.getBallMaterial(), this.world.world);
    }

    this.players.push(player);

    return player;
};

module.exports = Game;
