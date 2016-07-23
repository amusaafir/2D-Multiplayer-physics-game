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
    this.graphics.drawCircle(0,0, 1);
    this.graphics.position.set(this.circleBody.position[0], this.circleBody.position[1]);
    this.renderer.container.addChild(this.graphics);

    this.shadow = new PIXI.Graphics();
    this.shadow.lineStyle(0);
    this.shadow.beginFill(0xEEEEEE, 0.5);
    this.shadow.drawCircle(0,0, 1);
    this.shadow.position.set(this.circleBody.position[0], this.circleBody.position[1]);
    this.renderer.container.addChild(this.shadow);
};

Player.prototype.draw = function() {
    this.graphics.position.set(this.circleBody.position[0], this.circleBody.position[1]);
};

Player.prototype.drawShadow = function() {
    this.shadow.position.set(this.shadowX, this.shadowY);
};

module.exports = Player;