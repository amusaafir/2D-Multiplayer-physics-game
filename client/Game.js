/**
 * The Game class holds the necessary objects for a single game. It can be
 * seen as the core class of the entire game.
 */
var Game = function() {
    /**
     * The Network object with the current game instance.
     * @type {Network}
     */
    this.network = new Network(this);

    /**
     * The id of the client (main player).
     * @type {Number}
     */
    this.mainPlayerId;
    
    /**
     * List containing all the players.
     * @type {Array of type Player}
     */
    this.players = [];
    
    /**
     * The material object, which holds the materials for the current game.
     * @type {Material}
     */
    this.material = new Material();

    /**
     * The World object.
     * @type {World}
     */
    this.world = new World(this.material);
    
    /**
     * The Settings object.
     * @type {Settings}
     */
    this.settings = new Settings();
    
    /**
     * The Renderer object.
     * @type {Renderer}
     */
    this.renderer = new Renderer(this.players, this.settings);

    /**
     * The id of the player performing an action on postStep.
     * @type {Number}
     */
    this.currentId;

    /**
     * The x coordinate of the trajectory that is performed on postStep.
     * @type {Number}
     */
    this.currentX;

    /**
     * The y coordinate of the trajectory that is performed on postStep.
     * @type {Number}
     */
    this.currentY;

    /**
     * Determines whether a force needs to be executed on the ball of a player.
     * @type {Boolean}
     */
    this.request;

    /**
     * Run the physics simulation.
     */
    this.run();

    /**
     * Add the functionality of the postStep.
     */
    this.postStep();

    /**
     * Initiate the rendering.
     */
    this.draw();
};

/**
 * This function runs the physics simulation on a fixed timestep.
 */
Game.prototype.run = function() {
    var self = this;

    setInterval(function() {
        self.world.getWorld().step(1 / 60);
    }, 1000 / 60);
};

/**
 * This function calls the renderer method to draw the scene. The amount of time depends on the 
 * monitor refresh rate of the client.
 */
Game.prototype.draw = function() {
    var self = this;

    draw();

    function draw() {
        requestAnimationFrame(draw);
        self.renderer.render();
    }
};

/**
 * This function adds a new player to the game.
 * @param {[Number]} id [The id of the to be added player.]
 * @param {[Number]} x  [The x starting position.]
 * @param {[Number]} y  [The y starting position.]
 */
Game.prototype.addPlayer = function(id, x, y) {
    var player = new Player(id, x, y, this.renderer, this.material.getBallMaterial());
    this.world.getWorld().addBody(player.circleBody);
    this.players.push(player);
};

/**
 * This function determines what needs to be done after stepping the physics engine (after every step).
 * @return {[type]} [description]
 */
Game.prototype.postStep = function() {
    var self = this;

    this.world.getWorld().on("postStep", function() {
        if (self.request) {
            self.players[self.currentId].circleBody.applyForce([self.currentX, self.currentY], self.players[self.currentId].circleBody.position);
            self.request = false;
        }
    });
};

/**
 * This function creates a request to apply a force on the ball body of a player.
 * The size of the force depends on the given x and y values.
 * @param  {[type]} x [The x coordinate of the trajectory.]
 * @param  {[type]} y [The y coordinate of the trajectory.]
 */
Game.prototype.trajectory = function(x, y) {
    this.currentId = this.mainPlayerId;
    this.currentX = x;
    this.currentY = y;
    this.request = true;

    this.network.setTrajectory(x, y);
};

/**
 * Prints out the client's body positions that are not synced with the server.
 */
Game.prototype.arePositionsSynced = function() {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].circleBody.position[0] != this.players[i].shadowX) {
            console.log('X not equal for ' + i + ', client: ' + this.players[i].circleBody.position[0] + '; server ' + this.players[i].shadowX);
        }

        if (this.players[i].circleBody.position[1] != this.players[i].shadowY) {
            console.log('Y not equal for ' + i + ', client: ' + this.players[i].circleBody.position[1] + '; server ' + this.players[i].shadowY);
        }
    }
};

/**
 * Syncs the body positions of the client to the server's position.
 */
Game.prototype.syncPositions = function() {
    for (var i = 0; i < this.players.length; i++) {
        this.players[i].circleBody.position = [this.players[i].shadowX, this.players[i].shadowY];
    }
};
