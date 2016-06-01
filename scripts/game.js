var Game = function() {
	this.network = new Network(this);
	this.mainPlayerId;
	this.players = [];
	this.world = new World();
	this.renderer = new Renderer(this.players);
	this.currentId;
	this.currentX;
	this.currentY;
	this.request;

	this.run();
	this.postStep();
	this.draw();
};

Game.prototype.run = function() {
	var self = this;
	setInterval(function() {
    	self.world.getWorld().step(1/60);
	}, 1000/60);
};

Game.prototype.draw = function() {
	var self = this;
	
	draw();
	
	function draw() {
		requestAnimationFrame(draw);
    	self.renderer.render();
	}
};

Game.prototype.addPlayer = function(id, x, y) {
	var player = new Player(id, x, y, this.renderer);
    this.world.getWorld().addBody(player.circleBody);
    this.players.push(player);
};

Game.prototype.postStep = function() {
	var self = this;

	this.world.getWorld().on("postStep", function() {
        if(self.request) {
            self.players[self.mainPlayerId].circleBody.applyForce([self.currentX, self.currentY],  self.players[self.currentId].circleBody.position);
            self.request = false;
        }
    });
};

Game.prototype.trajectory = function(x, y) {
	this.currentId = this.mainPlayerId;
    this.currentX = x;
    this.currentY = y;
    this.request = true;

    this.network.setTrajectory(x,y);
};
