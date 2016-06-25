var World = function(material) {
    this.world = new p2.World({gravity:[0,0]});
    this.world.frictionGravity = 1;
    this.world.applyDamping = true;
    console.log(material);
   	this.world.addContactMaterial(new p2.ContactMaterial(material.getBallMaterial(), material.getBallMaterial(), {
        restitution: 1,
        stiffness: Number.MAX_VALUE // We need infinite stiffness to get exact restitution
    }));
};

World.prototype.getWorld = function() {
    return this.world;
};