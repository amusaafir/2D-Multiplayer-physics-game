var Renderer = function(game, settings) {
    this.game = game;
    this.settings = settings;
    this.renderer;
    this.container;
    this.zoom = 40;

    this.initRenderer();
    this.initContainer();
    this.windowResize();
};

Renderer.prototype.initRenderer = function() {
    var width = 1920;
    var height = 1080;
    
    this.renderer = PIXI.autoDetectRenderer(width, height);
    this.ratio = width / height;

    this.resize(); // Resize the render according to the client's screen
    
    // Add the renderer to the document
    this.renderer.view.style.display = "block";
    document.body.appendChild(this.renderer.view);
};

Renderer.prototype.initContainer = function() {
    this.container = new PIXI.Container();
    this.container.position.x = this.renderer.width / 2;
    this.container.position.y = this.renderer.height / 2;
    
    this.container.scale.x = this.zoom;
    this.container.scale.y = -this.zoom; // Flip to behave like the physics engine
    window.container = this.container; // For debugging purposes only
    window.renderer = this.renderer; // For debugging purposes only
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
    // Draw all players
    for (var i = 0; i < this.game.players.length; i++) {
        this.game.players[i].drawMarbles((this.settings.showServerPosition));
    }

    // Draw all walls
    for (var i = 0; i < this.game.walls.length; i++) {
        this.game.walls[i].draw();
        
        if(this.settings.showServerPosition)
            this.game.walls[i].drawShadow();
    }    

    // Restore transform
    this.renderer.render(this.container);
};

Renderer.prototype.getLocalMousePosition = function() {
    return this.renderer.plugins.interaction.mouse.getLocalPosition(this.container);
};

module.exports = Renderer;