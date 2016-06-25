// Not tested yet, missing Game.js class
// TODO: Abstract physics engine.

function Player(id, position, p2) {
	this.id = id;
    this.circleShape = new p2.Circle({
        radius: 1,
    });
    this.circleBody = new p2.Body({
        mass: 1,
        position: [position.x, position.y],
        angularVelocity: 1
    });
    this.circleBody.damping = .8;
    this.circleBody.addShape(this.circleShape);
    world.addBody(this.circleBody);
}

Player.prototype.getClientDetails = function() {
	var self = this;

	return {
        id: self.id,
        position: self.circleBody.position,
        velocity: self.circleBody.velocity,
        angularVelocity: self.circleBody.angularVelocity
    };
};

module.exports = Player;