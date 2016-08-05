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