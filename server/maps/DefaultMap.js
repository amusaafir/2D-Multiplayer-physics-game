var Position = require('./Position');
var Wall = require('../entities/Wall');

var DefaultMap = function(material, world) {
	this.material = material;
	this.world = world;
    this.walls = [];
    this.positions = [];

    this.loadScenery();
};

DefaultMap.prototype.loadScenery = function() {
    this.initPlayerPositions();
    this.createWalls();
};

DefaultMap.prototype.initPlayerPositions = function() {
    for (var x = -10; x < 10; x += 3) {
        for (var y = -8; y < 8; y += 3) {
            this.positions.push(new Position(x, y));
        }
    }
};

DefaultMap.prototype.createWalls = function() {
    this.addWall();
};

DefaultMap.prototype.addWall = function() {
    var wall = new Wall(this.material.getBallMaterial());
    this.world.world.addBody(wall.boxBody);
    this.walls.push(wall);
};

module.exports = DefaultMap;
