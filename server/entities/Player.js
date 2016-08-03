var Marble = require('./Marble.js');

var Player = function(id) {
	this.id = id;
	this.marbles = [];
};

// TODO: Create it when a list of marbles exist
Player.prototype.drawMarbles = function() {

};

Player.prototype.addMarble = function(id, x, y, renderer, material, input) {
	this.marbles.push(new Marble(id, x, y, renderer, material, input));
};

module.exports = Player;