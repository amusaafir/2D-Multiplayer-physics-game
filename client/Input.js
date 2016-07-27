var Input = function(game) {
	this.trajectory = {
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
    this.initInputEvents();
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

        self.game.trajectory(xTrajectory, yTrajectory);
    };
};

// This will be only invoked when the player clickes on his own objects (circles)
Input.prototype.clickedOnCircle = function(x, y) {
	this.trajectory.startVector = {
		x: x,
		y: y
	};
};

// Trajectory method here?

module.exports = Input;