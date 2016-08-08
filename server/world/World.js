var p2 = require('p2');

function World(material) {
    this.world = new p2.World({ gravity: [0, 0] });
    this.world.frictionGravity = 1;
    this.world.applyDamping = true;
    this.world.sleepMode = p2.World.BODY_SLEEPING;
    this.world.solver = new p2.GSSolver();
	this.world.solver.iterations =  20; // Fast, but contacts might look squishy...
	//this.world.solver.iterations = 50; // Slow, but contacts look good!
    this.createMaterials(material);
};

World.prototype.createMaterials = function(material) {
    this.world.addContactMaterial(new p2.ContactMaterial(material.getBallMaterial(), material.getBallMaterial(), {
        restitution: 1,
        stiffness: Number.MAX_VALUE // Infinite stiffness to get the exact restitution, according to the p2 example
    }));
};

module.exports = World;
