(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Network = require('./Network.js');
var Material = require('./Material.js');
var World = require('./World.js');
var Player = require('./Player.js');
var Settings = require('./Settings.js');
var Renderer = require('./Renderer.js');

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

Game.prototype.printLocalPositions = function() {
    for (var i = 0; i < this.players.length; i++) {
        console.log(this.players[i].circleBody.position[0] + ', ' + this.players[i].circleBody.position[1]);
    }
};

Game.prototype.moveTo = function(id,x,y) {
    this.players[id].circleBody.position[0] = x;
    this.players[id].circleBody.position[1] = y;
};

Game.prototype.drawCircle = function(x, y) {
    this.graphics = new PIXI.Graphics();
    this.graphics.lineStyle(0);
    this.graphics.beginFill(0xFFFFFF, 1);
    this.graphics.drawCircle(x,y, 1);
    this.renderer.container.addChild(this.graphics);
};

module.exports = Game;
},{"./Material.js":2,"./Network.js":3,"./Player.js":4,"./Renderer.js":5,"./Settings.js":6,"./World.js":7}],2:[function(require,module,exports){
var Material = function() {
    this.ballMaterial = new p2.Material();
};

Material.prototype.getBallMaterial = function() {
    return this.ballMaterial;
};

module.exports = Material;
},{}],3:[function(require,module,exports){
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
            self.game.players[i].shadowX = playersData[i].position[0];
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
},{}],4:[function(require,module,exports){
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

    // One draw call
    this.graphics = new PIXI.Graphics();
    this.graphics.lineStyle(0);
    this.graphics.beginFill(0xFFFFFF, 1);
    this.graphics.drawCircle(0,0, 1);
    this.graphics.position.set(this.circleBody.position[0], this.circleBody.position[1]);
    this.renderer.container.addChild(this.graphics);

    this.shadow = new PIXI.Graphics();
    this.shadow.lineStyle(0);
    this.shadow.beginFill(0xEEEEEE, 0.5);
    this.shadow.drawCircle(0,0, 1);
    this.shadow.position.set(this.circleBody.position[0], this.circleBody.position[1]);
    this.renderer.container.addChild(this.shadow);
};

Player.prototype.draw = function() {
    this.graphics.position.set(this.circleBody.position[0], this.circleBody.position[1]);
};

Player.prototype.drawShadow = function() {
    this.shadow.position.set(this.shadowX, this.shadowY);
};

module.exports = Player;
},{}],5:[function(require,module,exports){
var Renderer = function(players, settings) {
    this.players = players;
    this.settings = settings;
    this.renderer;
    this.container;
    this.zoom = 50;

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
    // Draw all bodies
    for (var i = 0; i < this.players.length; i++) {
        this.players[i].draw();

        if (this.settings.showServerPosition)
            this.players[i].drawShadow();
    }

    // Restore transform
    this.renderer.render(this.container);
};

module.exports = Renderer;
},{}],6:[function(require,module,exports){
var Settings = function() {
    this.showServerPosition = true;
};

module.exports = Settings;
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
var Game = require('./Game.js');

(function() {
    var game = new Game();
    window.game = game; // For debugging only
})();

},{"./Game.js":1}]},{},[8]);
