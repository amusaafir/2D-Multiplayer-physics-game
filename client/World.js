var World = function() {
    this.world = new p2.World({gravity:[0,0]});
    this.world.frictionGravity = 1;
    this.world.applyDamping = true;
    this.world.sleepMode = p2.World.BODY_SLEEPING;
};

World.prototype.getWorld = function() {
    return this.world;
};