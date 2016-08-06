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
    this.addWall(0, 2, 4, 2, 10, 15, this.material.getBallMaterial());
    this.addWall(5, 6, 3, 2, 10, 15, this.material.getBallMaterial());
};

DefaultMap.prototype.addWall = function(x, y, width, height, angle, mass, material) {
    var wall = new Wall(x, y, width, height, angle, mass, material);
    this.world.world.addBody(wall.boxBody);
    this.walls.push(wall);
};

module.exports = DefaultMap;