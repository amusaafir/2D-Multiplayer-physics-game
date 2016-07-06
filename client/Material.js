var Material = function() {
    this.ballMaterial = new p2.Material();
};

Material.prototype.getBallMaterial = function() {
    return this.ballMaterial;
};

module.exports = Material;