// TODO: Pass Game object to Network object. The game object should require the physics.

var p2 = require('p2');
var Network = require('./Network');
var Player = require('./Player');

function Server(io) {
	console.log('Start the game server.');
	this.io = io;
	this.network = new Network(io, null, p2);
	this.load();
}

Server.prototype.load = function() {
	var self = this.io;

	var players = [];
	var positions = [];
	var world;

	init();

	function init() {
	    for (var x = -10; x < 10; x += 3) {
	        for (var y = -8; y < 8; y += 3) {
	            positions.push(new Position(x, y));
	        }
	    }

	    world = new p2.World({ gravity: [0, 0] });
	    world.frictionGravity = 1;
	    world.applyDamping = true;
	}

	function Position(x, y) {
	    this.x = x;
	    this.y = y;
	}

	setInterval(function() {
	    sendState();
	}, 500);

	function sendState() {
	    var data = [];
	    for (var i = 0; i < players.length; i++) {
	        data.push(players[i].getClientDetails());
	    }
	        if (self) {
	            self.emit('state', data);
	        }
	}

	var aCount = 0;
	var fixedTimeStep = 1 / 60, maxSubSteps = 10, lastTimeMilliseconds;

	setInterval(function() {
	    world.step(1 / 60);
	}, 1000 / 60);

	var currentId;
	var currentX;
	var currentY;
	var request = false;

	world.on("postStep", function() {
	    if (request) {
	        players[currentId].circleBody.applyForce([currentX, currentY], players[currentId].circleBody.position);
	        request = false;
	    }
	});

};

module.exports = Server;

