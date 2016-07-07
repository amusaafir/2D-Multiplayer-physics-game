/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var Game = __webpack_require__(1);

	var game; // Temporary variable, for debugging purpose

	(function() {
	    game = new Game();
	})();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Network = __webpack_require__(2);
	var Material = __webpack_require__(3);
	var World = __webpack_require__(4);
	var Player = __webpack_require__(5);
	var Settings = __webpack_require__(6);
	var Renderer = __webpack_require__(7);

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

	module.exports = Game;

/***/ },
/* 2 */
/***/ function(module, exports) {

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
	            console.log('Attempting to connect another time..');
	            tryConnect();
	        }, 2000);
	    }
	};

	Network.prototype.connected = function() {
	    this.getPlayers();
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
	            self.game.players[i].circleBody.velocity = playersData[i].velocity;
	            self.game.players[i].circleBody.angularVelocity = playersData[i].angularVelocity;
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
	        self.game.addPlayer(player.id, player.position[0], player.position[1]);
	    });
	};

	Network.prototype.addNewPlayer = function() {
	    var self = this;

	    this.socket.on('addNewPlayer', function(player) {
	        self.game.addPlayer(player.id, player.position[0], player.position[1]);
	    });
	};

	Network.prototype.receiveState = function() {
	    var self = this;

	    this.socket.on('state', function(playersData) {
	        for (var i = 0; i < self.game.players.length; i++) {
	            //players[i].circleBody.position = playersData[i].position;
	            //players[i].circleBody.velocity = playersData[i].velocity;
	            self.game.players[i].shadowX = playersData[i].position[0]
	            self.game.players[i].shadowY = playersData[i].position[1];
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

/***/ },
/* 3 */
/***/ function(module, exports) {

	var Material = function() {
	    this.ballMaterial = new p2.Material();
	};

	Material.prototype.getBallMaterial = function() {
	    return this.ballMaterial;
	}; 

	module.exports = Material;

/***/ },
/* 4 */
/***/ function(module, exports) {

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

/***/ },
/* 5 */
/***/ function(module, exports) {

	var Player = function(id, x, y, renderer, material) {
	    this.id = id;
	    this.circleShape = new p2.Circle({
	        radius: 1,
	        material: material
	    });
	    this.circleBody = new p2.Body({
	        mass: 1,
	        position: [x, y],
	        angularVelocity: 1
	    });
	    this.circleBody.damping = .8;
	    this.circleBody.addShape(this.circleShape);
	    this.circleBody.allowSleep = true;
	    this.circleBody.sleepSpeedLimit = 1;
	    this.circleBody.sleepTimeLimit = 1;
	    this.shadowX = x;
	    this.shadowY = y;
	    this.renderer = renderer;
	};

	Player.prototype.draw = function() {
	    this.renderer.ctx.beginPath();
	    var x = this.circleBody.position[0],
	        y = this.circleBody.position[1];
	    this.renderer.ctx.save();
	    this.renderer.ctx.translate(x, y); // Translate to the center of the circle
	    this.renderer.ctx.rotate(this.circleBody.angle); // Rotate to the circle body frame
	    this.renderer.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
	    this.renderer.ctx.fillStyle = 'orange';
	    this.renderer.ctx.fill();
	    this.renderer.ctx.stroke();
	    this.renderer.ctx.restore();
	};

	Player.prototype.drawShadow = function() {
	    this.renderer.ctx.beginPath();
	    this.renderer.ctx.save();
	    this.renderer.ctx.translate(this.shadowX, this.shadowY);
	    this.renderer.ctx.rotate(this.circleBody.angle);
	    this.renderer.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
	    this.renderer.ctx.stroke();
	    this.renderer.ctx.restore();
	};

	module.exports = Player;

/***/ },
/* 6 */
/***/ function(module, exports) {

	var Settings = function() {
	    this.showServerPosition = true;
	};

	module.exports = Settings;

/***/ },
/* 7 */
/***/ function(module, exports) {

	var Renderer = function(players, settings) {
	    this.players = players;
	    this.w;
	    this.h;
	    this.canvas;
	    this.ctx;
	    this.init();
	    this.settings = settings;
	};

	Renderer.prototype.init = function() {
	    this.canvas = document.getElementById("canvas");
	    this.w = this.canvas.width;
	    this.h = this.canvas.height;
	    this.ctx = canvas.getContext("2d");
	    this.ctx.lineWidth = 0.05;
	};

	Renderer.prototype.render = function() {
	    // Clear the canvas
	    this.ctx.clearRect(0, 0, this.w, this.h);
	    this.ctx.save();
	    this.ctx.translate(this.w / 2, this.h / 2); // Translate to the center
	    this.ctx.scale(30, -30); // Zoom in and flip y axis

	    // Draw all bodies
	    for (var i = 0; i < this.players.length; i++) {
	        this.players[i].draw();

	        if (this.settings.showServerPosition)
	            this.players[i].drawShadow();
	    }

	    // Restore transform
	    this.ctx.restore();
	};

	module.exports = Renderer;

/***/ }
/******/ ]);