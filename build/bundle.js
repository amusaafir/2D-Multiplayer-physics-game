(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Game = require('./Game.js');

(function() {
    var game = new Game();
    window.game = game; // For debugging only
})();

},{"./Game.js":2}],2:[function(require,module,exports){
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

    this.applyForce = {
        playerId: null,
        marbleId: null,
        x: null,
        y: null,
        request: false
    };

    this.maxStep = 1000;

    this.step = 0;

    this.countSteps = false;

    this.clientData = {};

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
        
        if(self.countSteps) {
            self.step++;
            if(self.step==self.maxStep) {
                console.log('Enforce v=0.');
                var bodies = self.world.getWorld().bodies;
                for(var i=0; i<bodies.length; i++) { // Enforce v = 0 for all bodies
                    bodies[i].velocity[0] = 0;
                    bodies[i].velocity[1] = 0; 
                    self.sync();
                }
                self.step = 0;
                self.countSteps = false;
            }
        }

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

// TODO: Consider moving this to network
// Refactor: single method instead of two for bodies
Game.prototype.sync = function() {
    var playersData = this.clientData.players;
    var wallsData = this.clientData.walls;

    if(playersData.length == this.players.length) {
        for(var i = 0; i < playersData.length; i++) {
            var playerMarbles = playersData[i].marbles;

            if(playerMarbles.length != playersData[i].marbles.length) {
                console.log('Inconsistent marbles for player ' + i);
                continue;
            } else {
                for(var m = 0; m < playerMarbles.length; m++) {
                    this.players[i].marbles[m].circleBody.position[0] = playersData[i].marbles[m].position[0];
                    this.players[i].marbles[m].circleBody.position[1] = playersData[i].marbles[m].position[1];
                }
            }
        }
    } else {
        console.log('State error: players inconsistent.');
    }
    
    if(wallsData.length == this.walls.length) {
        for(var i = 0; i < wallsData.length; i++) {
            var wall = wallsData[i];
            this.walls[i].boxBody.position[0] = wall.position[0];
            this.walls[i].boxBody.position[1] = wall.position[1];
            this.walls[i].boxBody.angle = wall.angle;   
        }
    } else {
        console.log('State error: walls inconsistent.');
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
        if (self.applyForce.request) {
            var marblesContext = self.players[self.applyForce.playerId].marbles;
            marblesContext[self.applyForce.marbleId].circleBody.applyForce([self.applyForce.x, self.applyForce.y], marblesContext[self.applyForce.marbleId].circleBody.position);
            self.applyForce.request = false;
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
    
    this.applyForce = {
        playerId: this.mainPlayerId,
        x: x,
        y: y,
        marbleId: marbleId,
        request: true
    };

    this.countSteps = true;
    this.network.setTrajectory(marbleId, x, y);
};

/**
 * Prints out the client's body positions that are not synced with the server.
 */
Game.prototype.arePositionsSynced = function() {
    for (var i = 0; i < this.players.length; i++) {
        for (var m = 0; m < this.players[i].marbles.length; m++) {
            if (this.players[i].marbles[m].circleBody.position[0] != this.players[i].marbles[m].shadowX) {
                console.log('X not equal for ' + i + ', client: ' + this.players[i].marbles[m].circleBody.position[0] + '; server ' + this.players[i].marbles[m].shadowX);
            }

            if (this.players[i].marbles[m].circleBody.position[1] != this.players[i].marbles[m].shadowY) {
                console.log('Y not equal for ' + i + ', client: ' + this.players[i].marbles[m].circleBody.position[1] + '; server ' + this.players[i].marbles[m].shadowY);
            }
        }
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

Game.prototype.addWall = function(x, y, width, height, angle, mass, velocity, angularVelocity) {
    var wall = new Wall(x, y, width, height, angle, mass, this.renderer, this.material.getBallMaterial());
    wall.boxBody.angle = angle;
    wall.boxBody.velocity = velocity;
    wall.boxBody.angularVelocity = angularVelocity;
    this.world.getWorld().addBody(wall.boxBody);
    this.walls.push(wall);
};

module.exports = Game;
},{"./Input.js":3,"./Network.js":4,"./Renderer.js":5,"./Settings.js":6,"./entities/Player.js":8,"./entities/Wall.js":9,"./world/Material.js":10,"./world/World.js":11}],3:[function(require,module,exports){
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

        self.game.trajectory(self.trajectory.marbleId, xTrajectory, yTrajectory);
    };
};

// This will be only invoked when the player clickes on his own objects (circles)
Input.prototype.clickedOnCircle = function(marbleId, x, y) {
	this.trajectory.marbleId = marbleId;
    this.trajectory.startVector = {
		x: x,
		y: y
	};
};

// Trajectory method here?

module.exports = Input;
},{}],4:[function(require,module,exports){
var Network = function(game) {
    this.game = game;
    this.socket = io.connect();
    this.tryConnect();
};

Network.prototype.tryConnect = function() {
    if (this.socket.emit('connect', null)) {
        console.log('Successfully connected.');
        this.connected();
    } else {
        setTimeout(function() {
            console.log('Attempting to connect..');
            tryConnect();
        }, 2000);
    }
};

Network.prototype.connected = function() {
    this.getPlayers();
    this.getWalls();
    this.getWorldDetails();
    this.addMainPlayer();
    this.addNewPlayer();
    this.receiveState();
    this.receiveImpulseState();
    this.syncPositionsWithServer();
};

Network.prototype.getPlayers = function() {
    var self = this;

    this.socket.emit('getPlayers', null);

    this.socket.on('getPlayers', function(playersData) {
        for (var i = 0; i<playersData.length; i++) {
            var player = self.game.addPlayer(playersData[i].id, playersData[i].marbles, false);

            for(var m=0; m<player.marbles.length; m++) {
                player.marbles[m].circleBody.velocity = playersData[i].marbles[m].velocity;
                player.marbles[m].circleBody.angularVelocity = playersData[i].marbles[m].angularVelocity;
            }
        }
    });
};

Network.prototype.getWalls = function() {
    var self = this;

    this.socket.emit('getWalls', null);

    this.socket.on('getWalls', function(wallsData) {
        for (var i = 0; i < wallsData.length; i++) {
            var mass = (wallsData[i].isStatic) ? 0 : wallsData[i].mass; // Has to be 0 if it is static
            self.game.addWall(wallsData[i].position[0], wallsData[i].position[1], wallsData[i].width, wallsData[i].height, wallsData[i].angle, mass, wallsData[i].velocity, wallsData[i].angularVelocity);
        }
    });
};

Network.prototype.getWorldDetails = function() {
    var self = this;

    this.socket.emit('getWorldDetails', null);

    this.socket.on('getWorldDetails', function(data) {
        self.game.world.time = data.time;
    });
};

Network.prototype.addMainPlayer = function() {
    var self = this;

    this.socket.emit('addMainPlayer', null);

    this.socket.on('addMainPlayer', function(player) {
        self.game.mainPlayerId = player.id;
        self.game.addPlayer(player.id, player.marbles, true);
    });
};

Network.prototype.addNewPlayer = function() {
    var self = this;

    this.socket.on('addNewPlayer', function(player) {
        self.game.addPlayer(player.id, player.marbles, false);
    });
};

Network.prototype.receiveState = function() {
    var self = this;

    this.socket.on('state', function(playersData) { // List containing clientdata for each player
        if(playersData.length == self.game.players.length) {
            for(var i = 0; i < playersData.length; i++) {
                var playerMarbles = playersData[i].marbles;

                if(playerMarbles.length != playersData[i].marbles.length) {
                    console.log('Inconsistent marbles for player ' + i);
                    continue;
                } else {
                    for(var m = 0; m < playerMarbles.length; m++) {
                        self.game.players[i].marbles[m].shadowX = playersData[i].marbles[m].position[0];
                        self.game.players[i].marbles[m].shadowY = playersData[i].marbles[m].position[1];
                    }
                }
            }
        } else {
            console.log('State error: players inconsistent.'); // TODO: Fix for initial startup or refreshing the page.
        }
    });

    this.socket.on('stateWalls', function(wallsData) { // List containing clientdata for each player
        if(wallsData.length == self.game.walls.length) {
            for(var i = 0; i < self.game.walls.length; i++) {
                var wall = wallsData[i];

                if(wallsData.length != self.game.walls.length) {
                    console.log('Inconsistent marbles for player ' + i);
                    continue;
                } else {
                        self.game.walls[i].xPosServer = wallsData[i].position[0];
                        self.game.walls[i].yPosServer = wallsData[i].position[1];
                        self.game.walls[i].angleServer = wallsData[i].angle;
                }
            }
        } else {
            console.log('State error: players inconsistent.');
        }
    });
};

Network.prototype.syncPositionsWithServer = function() {
    var self = this;

    this.socket.on('sync', function(clientData) { // List containing clientdata for each player
        self.game.clientData = clientData;
    });
};

Network.prototype.receiveImpulseState = function() {
    var self = this;

    this.socket.on('impulseState', function(data) { 
        if (data.id != self.game.mainPlayerId) { // TODO: extract to separate method inside the game class
            self.game.applyForce.playerId= data.id;
            self.game.applyForce.marbleId = data.marbleId;
            self.game.applyForce.x = data.x;
            self.game.applyForce.y = data.y;
            self.game.applyForce.request = true;
            self.game.countSteps = true;
        }
    });
};

Network.prototype.setTrajectory = function(marbleId, x, y) {
    var self = this;
    
    this.socket.emit('impulse', {
        id: self.game.mainPlayerId,
        marbleId: marbleId,
        x: x,
        y: y
    });
};

module.exports = Network;
},{}],5:[function(require,module,exports){
var Renderer = function(game, settings) {
    this.game = game;
    this.settings = settings;
    this.renderer;
    this.container;
    this.zoom = 40;

    this.initRenderer();
    this.initContainer();
    this.windowResize();
};

Renderer.prototype.initRenderer = function() {
    var width = 1920;
    var height = 1080;
    
    this.renderer = PIXI.autoDetectRenderer(width, height);
    this.ratio = width / height;

    this.resize(); // Resize the render according to the client's screen
    
    // Add the renderer to the document
    this.renderer.view.style.display = "block";
    document.body.appendChild(this.renderer.view);
};

Renderer.prototype.initContainer = function() {
    this.container = new PIXI.Container();
    this.container.position.x = this.renderer.width / 2;
    this.container.position.y = this.renderer.height / 2;
    
    this.container.scale.x = this.zoom;
    this.container.scale.y = -this.zoom; // Flip to behave like the physics engine
    window.container = this.container; // For debugging purposes only
    window.renderer = this.renderer; // For debugging purposes only
};

Renderer.prototype.resize = function() {
    if (window.innerWidth / window.innerHeight < this.ratio) {
        this.renderer.view.style.width = window.innerWidth;
        this.renderer.view.style.height = window.innerWidth / this.ratio;
    } else {
        this.renderer.view.style.width = window.innerHeight * this.ratio;
        this.renderer.view.style.height = window.innerHeight;
    }
};

Renderer.prototype.windowResize = function() {
    var self = this;
   
    window.onresize = function(event) {
        self.resize();
    };
};

Renderer.prototype.render = function() {
    // Draw all players
    for (var i = 0; i < this.game.players.length; i++) {
        this.game.players[i].drawMarbles((this.settings.showServerPosition));
    }

    // Draw all walls
    for (var i = 0; i < this.game.walls.length; i++) {
        this.game.walls[i].draw();
        
        if(this.settings.showServerPosition)
            this.game.walls[i].drawShadow();
    }    

    // Restore transform
    this.renderer.render(this.container);
};

Renderer.prototype.getLocalMousePosition = function() {
    return this.renderer.plugins.interaction.mouse.getLocalPosition(this.container);
};

module.exports = Renderer;
},{}],6:[function(require,module,exports){
var Settings = function() {
    this.showServerPosition = true;
};

module.exports = Settings;
},{}],7:[function(require,module,exports){
var Settings = require('../Settings.js');

var Marble = function(id, x, y, renderer, material, input) {
    this.id = id;
    this.circleShape;
    this.circleBody;
    this.shadowX = x;
    this.shadowY = y;
    this.renderer = renderer;
    this.input = input;
    this.settings = new Settings();
    this.initCircleShape(material);
    this.initPhysicsBody(x, y);
    this.createGraphics();
    this.createHitArea();
};

Marble.prototype.initCircleShape = function(material) {
    this.circleShape = new p2.Circle({
        radius: 1,
        material: material
    });
};

Marble.prototype.initPhysicsBody = function(x, y) {
    this.circleBody = new p2.Body({
        mass: 1,
        position: [x, y],
        angularVelocity: 1
    });
    this.circleBody.damping = .7;
    this.circleBody.addShape(this.circleShape);
    this.circleBody.allowSleep = true;
    this.circleBody.sleepSpeedLimit = 1;
    this.circleBody.sleepTimeLimit = 1;
};

Marble.prototype.draw = function() {
    this.graphics.position.set(this.circleBody.position[0], this.circleBody.position[1]);
};

Marble.prototype.drawShadow = function() {
    this.shadow.position.set(this.shadowX, this.shadowY);
};

Marble.prototype.createGraphics = function() {
    this.graphics = new PIXI.Graphics();
    this.graphics.lineStyle(0);
    this.graphics.beginFill(0xFFFFFF, 1);
    this.graphics.drawCircle(0, 0, 1);
    this.graphics.position.set(this.circleBody.position[0], this.circleBody.position[1]);
    this.renderer.container.addChild(this.graphics);

    // Server position
    if(this.settings.showServerPosition) {
        this.shadow = new PIXI.Graphics();
        this.shadow.lineStyle(0);
        this.shadow.beginFill(0xEEEEEE, 0.5);
        this.shadow.drawCircle(0,0, 1);
        this.shadow.position.set(this.circleBody.position[0], this.circleBody.position[1]);
        this.renderer.container.addChild(this.shadow);
   }
};

Marble.prototype.createHitArea = function () {
    var self = this;

    this. graphics.interactive = true;
    this.graphics.hitarea = new PIXI.Circle(0, 0, 1);
    
    this.graphics.click = function(event) {
    };
    this.graphics.mousedown = function(event) {
        if(self.input) {
            self.input.clickedOnCircle(self.id, self.circleBody.position[0], self.circleBody.position[1]);
        }
    };
    this.graphics.mouseout = function(event) {
    };
    this.graphics.mouseup = function(event) {
    };
};

module.exports = Marble;
},{"../Settings.js":6}],8:[function(require,module,exports){
var Marble = require('./Marble.js');

var Player = function(id) {
	this.id = id;
	this.marbles = [];
};

// TODO: Create it when a list of marbles exist
Player.prototype.drawMarbles = function(showServerPosition) {
	for(var i=0; i<this.marbles.length; i++) {
		this.marbles[i].draw();

		if(showServerPosition) {
			this.marbles[i].drawShadow();
		}
	}
};

Player.prototype.addMarble = function(id, x, y, renderer, material, input) {
	this.marbles.push(new Marble(id, x, y, renderer, material, input));
};

module.exports = Player;
},{"./Marble.js":7}],9:[function(require,module,exports){
var Settings = require('../Settings.js');

var Wall = function(x, y, width, height, angle, mass, renderer, material) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = angle;
    this.mass = mass;
    this.material = material;
    this.renderer = renderer;
    this.boxShape;
    this.boxBody;
    this.graphics;
    this.shadow;
    this.xPosServer;
    this.yPosServer;
    this.angleServer;
    this.settings = new Settings();

    this.initShape();
    this.initBody();
    this.createGraphics();
};

Wall.prototype.initShape = function() {
    this.boxShape = new p2.Box({width: this.width, height: this.height, material: this.material});
};

Wall.prototype.initBody = function() {
    this.boxBody = new p2.Body({
        mass: this.mass,
        position: [this.x, this.y],
        angularDamping:.8,
        angle: this.angle
    });
    this.boxBody.damping = .8;
    this.boxBody.allowSleep = true;
    this.boxBody.sleepSpeedLimit = 1;
    this.boxBody.sleepTimeLimit = 1;
    this.boxBody.addShape(this.boxShape);
};

Wall.prototype.createGraphics = function() {
    this.graphics = new PIXI.Graphics();
    this.graphics.beginFill(0xff0000);
    this.graphics.drawRect(-this.boxShape.width/2, -this.boxShape.height/2, this.boxShape.width, this.boxShape.height);
    this.graphics.rotation = this.boxBody.angle;
    this.renderer.container.addChild(this.graphics);

    if(this.settings.showServerPosition) {
        this.shadow = new PIXI.Graphics();
        this.shadow.beginFill(0xEEEEEE, 0.5);
        this.shadow.drawRect(-this.boxShape.width/2, -this.boxShape.height/2, this.boxShape.width, this.boxShape.height);
        this.shadow.rotation = this.boxBody.angle;
        this.renderer.container.addChild(this.shadow);
    }
};

Wall.prototype.draw = function() {
    this.graphics.position.x = this.boxBody.position[0];
    this.graphics.position.y = this.boxBody.position[1];
    this.graphics.rotation = this.boxBody.angle;
};

Wall.prototype.drawShadow = function() {
    this.shadow.position.x = this.xPosServer;
    this.shadow.position.y = this.yPosServer;
    this.shadow.rotation = this.angleServer;
};

module.exports = Wall;
},{"../Settings.js":6}],10:[function(require,module,exports){
var Material = function() {
    this.ballMaterial = new p2.Material();
};

Material.prototype.getBallMaterial = function() {
    return this.ballMaterial;
};

module.exports = Material;
},{}],11:[function(require,module,exports){
var World = function(material) {
    this.world = new p2.World({ gravity: [0, 0] });
    this.world.frictionGravity = 1;
    this.world.applyDamping = true;
    this.world.sleepMode = p2.World.BODY_SLEEPING;
    this.createMaterials(material);
};

World.prototype.createMaterials = function(material) {
    this.world.addContactMaterial(new p2.ContactMaterial(material.getBallMaterial(), material.getBallMaterial(), {
        restitution: 1,
        stiffness: Number.MAX_VALUE // Infinite stiffness to get the exact restitution, according to the p2 example
    }));
};

World.prototype.getWorld = function() {
    return this.world;
};

module.exports = World;
},{}]},{},[1]);
