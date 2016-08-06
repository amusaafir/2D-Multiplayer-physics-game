var p2 = require('p2');

var Wall = function(x, y, width, height, material) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.material = material;
    this.boxShape;
    this.boxBody;

    this.initShape();
    this.initBody();
};

Wall.prototype.initShape = function() {
    this.boxShape = new p2.Box({width: this.width, height: this.height, material: this.material});
};

Wall.prototype.initBody = function() {
    this.boxBody = new p2.Body({
        mass: 15,
        position: [this.x, this.y],
        angularDamping:.8
    });
    this.boxBody.damping = .8;
    this.boxBody.allowSleep = true;
    this.boxBody.sleepSpeedLimit = 1;
    this.boxBody.sleepTimeLimit = 1;
    this.boxBody.addShape(this.boxShape);
};

Wall.prototype.getClientDetails = function() {
    var self = this;

    return {
        height: self.height,
        width: self.width,
        position: self.boxBody.position,
        velocity: self.boxBody.velocity,
        angle: self.boxBody.angle,
        angularVelocity: self.boxBody.angularVelocity
    };
};


module.exports = Wall;