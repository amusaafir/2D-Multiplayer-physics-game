var Game = function() {
	this.players = [];
	this.world = new World();
	this.network = new Network();
	this.renderer = new Renderer(this.players);
	this.run();
};

Game.prototype.run = function() {
	var self = this;
	setInterval(function() {
    	self.world.getWorld().step(1/60);
	}, 1000/60);
};

Game.prototype.draw = function() {
    requestAnimationFrame(this.draw);
    this.renderer.render();
};