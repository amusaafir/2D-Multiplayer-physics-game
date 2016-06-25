var Renderer = function(players) {
    this.players = players;
    this.w; 
    this.h;
    this.canvas;
    this.ctx;
    this.init();
};

Renderer.prototype.init = function() {
    this.canvas = document.getElementById("canvas");
    this.w = this.canvas.width;
    this.h = this.canvas.height;
    this.ctx = canvas.getContext("2d");
    this.ctx.lineWidth = 0.05;
};

Renderer.prototype.render = function() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.save();
    this.ctx.translate(this.w / 2, this.h / 2); // Translate to the center
    this.ctx.scale(30, -30); // Zoom in and flip y axis

    // Draw all bodies
    for(var i=0; i<this.players.length; i++) {
        this.players[i].draw();
        //this.players[i].drawShadow();
    }

    // Restore transform
    this.ctx.restore();
};