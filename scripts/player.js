var Player = function(id, x, y) {
    this.id = id;
    this.circleShape = new p2.Circle({
        radius: 1,
    });
    this.circleBody = new p2.Body({
        mass: 1,
        position: [x, y],
        angularVelocity: 1
    });
    this.circleBody.damping = .8;
    this.circleBody.addShape(this.circleShape);
    this.shadowX = x;
    this.shadowY = y;
};

Player.prototype.draw = function() {
    ctx.beginPath();
    var x = this.circleBody.position[0],
        y = this.circleBody.position[1];
    ctx.save();
    ctx.translate(x, y); // Translate to the center of the circle
    ctx.rotate(this.circleBody.angle); // Rotate to the circle body frame
    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    ctx.fillStyle = 'orange';
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}; 

Player.prototype.drawShadow = function() {
    ctx.beginPath();
    ctx.save();
    ctx.translate(this.shadowX, this.shadowY);
    ctx.rotate(this.circleBody.angle);
    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.restore();
};