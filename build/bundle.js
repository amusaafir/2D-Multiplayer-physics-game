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
Game.prototype.addPlayer = function(id, x, y, isMainplayer) {
    var player = new Player(id);
    var input = null;
    if(isMainplayer) {
        input = this.input;
    }
    player.addMarble(id, x, y, this.renderer, this.material.getBallMaterial(), input);
    this.world.getWorld().addBody(player.marbles[player.marbles.length-1].circleBody);
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
            var marblesContext = self.players[self.currentId].marbles;
            marblesContext[marblesContext.length-1].circleBody.applyForce([self.currentX, self.currentY], marblesContext[marblesContext.length-1].circleBody.position);
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
    var force = 600; // TODO: Add force limit; mainly necessary on the server side.
    x *= force;
    y *= force;
    
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
},{"./Input.js":3,"./Network.js":4,"./Renderer.js":5,"./Settings.js":6,"./entities/Player.js":8,"./entities/Wall.js":9,"./world/Material.js":10,"./world/World.js":11}],3:[function(require,module,exports){
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
};

Network.prototype.getPlayers = function() {
    var self = this;

    this.socket.emit('getPlayers', null);

    this.socket.on('getPlayers', function(playersData) {
        for (var i = 0; i < playersData.length; i++) {
            self.game.addPlayer(playersData[i].id, playersData[i].position[0], playersData[i].position[1]);
            var marblesContext = self.game.players[i].marbles;
            marblesContext[marblesContext.length-1].circleBody.velocity = playersData[i].velocity;
            marblesContext[marblesContext.length-1].circleBody.angularVelocity = playersData[i].angularVelocity;
        }
    });
};

Network.prototype.getWalls = function() {
    var self = this;

    this.socket.emit('getWalls', null);

    this.socket.on('getWalls', function(wallsData) {
        for (var i = 0; i < wallsData.length; i++) {
            self.game.addWall(wallsData[i].position[0], wallsData[i].position[1], wallsData[i].velocity, wallsData[i].angularVelocity, wallsData[i].angle);
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
        self.game.addPlayer(player.id, player.position[0], player.position[1], true);
    });
};

Network.prototype.addNewPlayer = function() {
    var self = this;

    this.socket.on('addNewPlayer', function(player) {
        self.game.addPlayer(player.id, player.position[0], player.position[1], false);
    });
};

Network.prototype.receiveState = function() {
    var self = this;

    this.socket.on('state', function(playersData) {
        for (var i = 0; i < self.game.players.length; i++) {
            var marblesContext = self.game.players[i].marbles;
            marblesContext[marblesContext.length-1].shadowX = playersData[i].position[0];
            marblesContext[marblesContext.length-1].shadowY = playersData[i].position[1];
        }
    });
};

Network.prototype.receiveImpulseState = function() {
    var self = this;

    this.socket.on('impulseState', function(data) {
        if (data.id != self.game.mainPlayerId) {
            self.game.currentId = data.id;
            self.game.currentX = data.x;
            self.game.currentY = data.y;
            self.game.request = true;
        }
    });
};

Network.prototype.setTrajectory = function(x, y) {
    var self = this;

    this.socket.emit('impulse', {
        id: self.game.mainPlayerId,
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
        var marblesContext = this.game.players[i].marbles; 
        marblesContext[marblesContext.length-1].draw();

        if (this.settings.showServerPosition)
            marblesContext[marblesContext.length-1].drawShadow();
    }

    // Draw all walls
    for (var i = 0; i < this.game.walls.length; i++) {
        this.game.walls[i].draw();
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
    this.showServerPosition = false;
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

    this.graphics.interactive = true;
    this.graphics.hitarea = new PIXI.Circle(0, 0, 1);
    
    this.graphics.click = function(event) {
    };
    this.graphics.mousedown = function(event) {
        if(self.input) {
            self.input.clickedOnCircle(self.circleBody.position[0], self.circleBody.position[1]);
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
Player.prototype.drawMarbles = function() {

};

Player.prototype.addMarble = function(id, x, y, renderer, material, input) {
	this.marbles.push(new Marble(id, x, y, renderer, material, input));
};

module.exports = Player;
},{"./Marble.js":7}],9:[function(require,module,exports){
var Wall = function(renderer, material) {
    this.renderer = renderer;
    this.boxShape;
    this.boxBody;
    this.graphics;

    this.initShape(material);
    this.initBody();
    this.createGraphics();
};

Wall.prototype.initShape = function(material) {
    this.boxShape = new p2.Box({width: 2, height: 1, material: material});
};

Wall.prototype.initBody = function() {
    this.boxBody = new p2.Body({
        mass: 15,
        position: [0,2],
        angularDamping:.8
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

    this.renderer.container.addChild(this.graphics);
};

Wall.prototype.draw = function() {
    this.graphics.position.x = this.boxBody.position[0];
    this.graphics.position.y = this.boxBody.position[1];
    this.graphics.rotation = this.boxBody.angle;
};

module.exports = Wall;
},{}],10:[function(require,module,exports){
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
