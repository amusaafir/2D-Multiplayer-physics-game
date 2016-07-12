var Player = function(id, x, y, renderer, material) {
    this.id = id;
    this.circleShape = new p2.Circle({
        radius: 1,
        material: material
    });
    this.circleBody = new p2.Body({
        mass: 1,
        position: [x, y],
        angularVelocity: 1
    });
    this.circleBody.damping = .8;
    this.circleBody.addShape(this.circleShape);
    this.circleBody.allowSleep = true;
    this.circleBody.sleepSpeedLimit = 1;
    this.circleBody.sleepTimeLimit = 1;
    this.shadowX = x;
    this.shadowY = y;
    this.renderer = renderer;

    // One draw call
    this.graphics = new PIXI.Graphics();
    this.graphics.lineStyle(0);
    this.graphics.beginFill(0xFFFFFF, 1);
    this.graphics.drawCircle(this.circleBody.position[0],this.circleBody.position[1], 1);
    this.renderer.container.addChild(this.graphics);

    this.shadow = new PIXI.Graphics();
    this.shadow.lineStyle(0);
    this.shadow.beginFill(0xEEEEEE, 0.5);
    this.shadow.drawCircle(this.circleBody.position[0],this.circleBody.position[1], 1);
    this.renderer.container.addChild(this.shadow);
};

Player.prototype.draw = function() { // TODO: should be called 'Transform'
    /*this.renderer.ctx.beginPath();
    var x = this.circleBody.position[0],
        y = this.circleBody.position[1];
    this.renderer.ctx.save();
    this.renderer.ctx.translate(x, y); // Translate to the center of the circle
    this.renderer.ctx.rotate(this.circleBody.angle); // Rotate to the circle body frame
    this.renderer.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    this.renderer.ctx.fillStyle = 'orange';
    this.renderer.ctx.fill();
    this.renderer.ctx.stroke();
    this.renderer.ctx.restore();*/
     var x = this.circleBody.position[0],
        y = this.circleBody.position[1];
    this.graphics.position.x = x;
    this.graphics.position.y = y;
};

Player.prototype.drawShadow = function() {
    /*this.renderer.ctx.beginPath();
    this.renderer.ctx.save();
    this.renderer.ctx.translate(this.shadowX, this.shadowY);
    this.renderer.ctx.rotate(this.circleBody.angle);
    this.renderer.ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    this.renderer.ctx.stroke();
    this.renderer.ctx.restore();*/
     this.shadow.position.x = this.shadowX;
    this.shadow.position.y =  this.shadowY;  
};

module.exports = Player;