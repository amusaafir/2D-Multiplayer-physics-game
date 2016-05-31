var Game = function() {
	this.mainPlayerId;
	this.players = [];
	this.world = new World();
	this.renderer = new Renderer(this.players);
	this.run();
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
	this.world.on("postStep", function() {
        //if(request) {
        //    players[currentId].circleBody.applyForce([currentX, currentY],  players[currentId].circleBody.position);
        //    request = false;
        //}
    });
};