var p2 = require('p2');

var Wall = function(material) {
    this.boxShape;
    this.boxBody;

    this.initShape(material);
    this.initBody();
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

Wall.prototype.getClientDetails = function() {
    var self = this;

    return {
        position: self.boxBody.position,
        velocity: self.boxBody.velocity,
        angle: self.boxBody.angle,
        angularVelocity: self.boxBody.angularVelocity
    };
};


module.exports = Wall;