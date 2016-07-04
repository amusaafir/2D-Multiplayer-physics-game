var Game = function() {
	this.network = new Network(this);
	this.mainPlayerId;
	this.players = [];
	this.world = new World();
	this.settings = new Settings();
	this.renderer = new Renderer(this.players, this.settings);
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
            self.players[self.currentId].circleBody.applyForce([self.currentX, self.currentY],  self.players[self.currentId].circleBody.position);
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

Game.prototype.areTheyInSync = function() {
	for(var i=0; i<this.players.length; i++) {
		if(this.players[i].circleBody.position[0] != this.players[i].shadowX) {
			console.log('X not equal for ' + i + ', client: ' + this.players[i].circleBody.position[0] + '; server ' + this.players[i].shadowX);
		}

		if(this.players[i].circleBody.position[1] != this.players[i].shadowY) {
			console.log('Y not equal for ' + i + ', client: ' + this.players[i].circleBody.position[1] + '; server ' + this.players[i].shadowY);
		}
	}
};

Game.prototype.syncPositions = function() {
    for(var i=0; i<this.players.length; i++) {
        this.players[i].circleBody.position = [this.players[i].shadowX, this.players[i].shadowY];
   	}
};