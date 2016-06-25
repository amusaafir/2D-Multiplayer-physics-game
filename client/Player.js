var Player = function(id, x, y, renderer, material) {
    console.log(material);
    this.id = id;
    this.circleShape = new p2.Circle({
        radius: 1,
        material: material
    });
    this.circleBody = new p2.Body({
        mass: 1,
        position: [x, y],
        angularVelocity: 1,
    });
    this.circleBody.damping = .8;
    this.circleBody.addShape(this.circleShape);
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