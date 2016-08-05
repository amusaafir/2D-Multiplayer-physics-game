var Input = require('./Input.js');
var Network = require('./Network.js');
var Material = require('./world/Material.js');
var World = require('./world/World.js');
var Player = require('./entities/Player.js');
var Wall = require('./entities/Wall.js');
var Settings = require('./Settings.js');
var Renderer = require('./Renderer.js');

/**
 * The Game class holds the necessary objects for a single game. It can be
 * seen as the core class of the entire game.
 */
var Game = function() {
    this.input = new Input(this);

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

    this.walls = [];
    
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
    this.renderer = new Renderer(this, this.settings);

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

    this.marbleId;

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
        self.world.getWorld().step(1 / 120);
    }, 1000 / 120);
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
Game.prototype.addPlayer = function(id, marbles, isMainplayer) {
    var player = new Player(id);
    var input = null;
    if(isMainplayer) {
        input = this.input;
    }

    for(var id=0; id<marbles.length; id++) {
        player.addMarble(id, marbles[id].position[0], marbles[id].position[1], this.renderer, this.material.getBallMaterial(), input);
        this.world.getWorld().addBody(player.marbles[player.marbles.length-1].circleBody); // Add the body of the (last created) marble to the world
    }
    
    this.players.push(player);

    return player;
};

/**
 * This function determines what needs to be done after stepping the physics engine (after every step).
 * @return {[type]} [description]
 */
Game.prototype.postStep = function() {
    var self = this;

    this.world.getWorld().on("postStep", function() {
        if (self.request) {
            var marblesContext = self.players[self.currentId].marbles;
            marblesContext[self.marbleId].circleBody.applyForce([self.currentX, self.currentY], marblesContext[self.marbleId].circleBody.position);
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
Game.prototype.trajectory = function(marbleId, x, y) {
    var force = 600; // TODO: Add force limit; mainly necessary on the server side.
    x *= force;
    y *= force;
    
    this.currentId = this.mainPlayerId;
    this.currentX = x;
    this.currentY = y;
    this.marbleId = marbleId;
    this.request = true;

    this.network.setTrajectory(x, y);
};

/**
 * Prints out the client's body positions that are not synced with the server.
 */
Game.prototype.arePositionsSynced = function() {
    for (var i = 0; i < this.players.length; i++) {
        /*if (this.players[i].marble.circleBody.position[0] != this.players[i].marble.shadowX) {
            console.log('X not equal for ' + i + ', client: ' + this.players[i].marble.circleBody.position[0] + '; server ' + this.players[i].marble.shadowX);
        }

        if (this.players[i].marble.circleBody.position[1] != this.players[i].marble.shadowY) {
            console.log('Y not equal for ' + i + ', client: ' + this.players[i].marble.circleBody.position[1] + '; server ' + this.players[i].marble.shadowY);
        }*/
    }
};

/**
 * Syncs the body positions of the client to the server's position.
 */
Game.prototype.syncPositions = function() {
    for (var i = 0; i < this.players.length; i++) {
        //this.players[i].marble.circleBody.position = [this.players[i].marble.shadowX, this.players[i].marble.shadowY];
    }
};

Game.prototype.printLocalPositions = function() {
    for (var i = 0; i < this.players.length; i++) {
        //console.log(this.players[i].marble.circleBody.position[0] + ', ' + this.players[i].marble.circleBody.position[1]);
    }
};

Game.prototype.moveTo = function(id,x,y) {
    //this.players[id].marble.circleBody.position[0] = x;
    //this.players[id].marble.circleBody.position[1] = y;
};

Game.prototype.drawTrajectory = function(x, y) {
    
};

Game.prototype.addWall = function(x, y, velocity, angularVelocity, angle) {
    var wall = new Wall(this.renderer, this.material.getBallMaterial());
    wall.boxBody.position[0] = x;
    wall.boxBody.position[1] = y;
    wall.boxBody.angle = angle;
    wall.boxBody.velocity = velocity;
    wall.boxBody.angularVelocity = angularVelocity; 
    this.world.getWorld().addBody(wall.boxBody);
    this.walls.push(wall);
};

module.exports = Game;