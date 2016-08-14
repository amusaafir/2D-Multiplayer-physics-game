var Input = function(game) {
	this.trajectory = {
        marbleId: null,
    	startVector: {
    		x: 0,
    		y: 0
    	},
    	endVector: {
    		x: 0,
    		y: 0
    	}
    };
    this.game = game;
    this.drawLine = false;
    this.line = new PIXI.Graphics().lineStyle(.1, 0xFFFFFF);
    this.game.renderer.container.addChild(this.line);
    this.initInputEvents();
};

Input.prototype.drawTrajectory = function() {
    if(this.line&&this.drawLine) {
        this.line.clear();
        this.line.lineStyle(.1, 0xFFFFFF);
        this.line.moveTo(this.trajectory.startVector.x, this.trajectory.startVector.y);
        this.line.lineTo(this.game.renderer.getLocalMousePosition().x, this.game.renderer.getLocalMousePosition().y);
    }
};

Input.prototype.initInputEvents = function() {
    var self = this;

    window.onmouseup = function() {
        self.trajectory.endVector = {
        	x: self.game.renderer.getLocalMousePosition().x,
        	y: self.game.renderer.getLocalMousePosition().y
        };

        var xTrajectory = self.trajectory.endVector.x - self.trajectory.startVector.x;
        var yTrajectory = self.trajectory.endVector.y - self.trajectory.startVector.y;

        self.game.trajectory(self.trajectory.marbleId, xTrajectory, yTrajectory);
        self.drawLine = false;
        self.line.clear();
    };
};

// This will be only invoked when the player clickes on his own objects (circles)
Input.prototype.clickedOnCircle = function(marbleId, x, y) {
	this.trajectory.marbleId = marbleId;
    this.trajectory.startVector = {
		x: x,
		y: y
	};
    this.drawLine = true;
};

// Trajectory method here?

module.exports = Input;