var Renderer = function(players, settings) {
    this.players = players;
    this.settings = settings;

    // Canvas
    this.w;
    this.h;
    this.canvas;
    
    // Stage
    this.stage = new PIXI.Stage(0xFFFFFF, true);
    this.stage.interactive = true;
    this.renderer = PIXI.autoDetectRenderer(1920, 1080);
    this.ratio = 1920 / 1080;
    this.resize();
    this.renderer.view.style.display = "block";
    document.body.appendChild(this.renderer.view);

    // Container
    this.container = new PIXI.Container();
    this.container.position.x =  this.renderer.width/2;
    this.container.position.y =  this.renderer.height/2;
    this.zoom = 50;
    this.container.scale.x =  this.zoom;  // zoom in
    this.container.scale.y = -this.zoom; // Note: we flip the y axis to make "up" the physics "up"
    this.stage.addChild(this.container);
    window.container = this.container; // For debugging purposes only
    window.renderer = this.renderer; // For debugging purposes only

    this.windowResize();
};

Renderer.prototype.resize = function() {
    if (window.innerWidth / window.innerHeight < this.ratio) {
        this.renderer.view.style.width = window.innerWidth;
        this.renderer.view.style.height = window.innerWidth / this.ratio;
    } else {
        this.renderer.view.style.width = window.innerHeight * this.ratio;
        this.renderer.view.style.height = window.innerHeight;
    }
};

Renderer.prototype.windowResize = function() {
    var self = this;
    window.onresize = function(event) {
        self.resize();
    };
};

Renderer.prototype.render = function() {
    // Draw all bodies
    for (var i = 0; i < this.players.length; i++) {
        this.players[i].draw();

        if (this.settings.showServerPosition)
            this.players[i].drawShadow();
    }

    // Restore transform
    this.renderer.render(this.stage);
};

module.exports = Renderer;