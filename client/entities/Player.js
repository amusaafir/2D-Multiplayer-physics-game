var Marble = require('./Marble.js');

var Player = function(id) {
	this.id = id;
	this.marbles = [];
};

// TODO: Create it when a list of marbles exist
Player.prototype.drawMarbles = function(showServerPosition) {
	for(var i=0; i<this.marbles.length; i++) {
		this.marbles[i].draw();

		if(showServerPosition) {
			this.marbles[i].drawShadow();
		}
	}
};

Player.prototype.addMarble = function(id, x, y, renderer, material, input, isMainPlayer) {
	var marble = new Marble(id, x, y, renderer, material, input, isMainPlayer);
	this.marbles.push(marble);
};

module.exports = Player;