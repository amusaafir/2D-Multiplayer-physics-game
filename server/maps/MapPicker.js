var DefaultMap = require('./DefaultMap');

var MapPicker = function(material, world) {
	this.material = material
	this.world = world;
};

MapPicker.prototype.selectRandomMap = function() {
	// TODO: implement
};

MapPicker.prototype.selectDefaultMap = function() {
	return new DefaultMap(this.material, this.world);
};

module.exports = MapPicker;
