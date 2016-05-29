var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var io = require('socket.io').listen(server);
var p2 = require('p2');

server.listen(3000);

app.use('/node_modules/p2/build/p2.js', express.static(path.join(__dirname, '/node_modules/p2/build/p2.js')));
app.use('/node_modules/socket.io/node_modules/socket.io-client/socket.io.js', express.static(path.join(__dirname, '/node_modules/socket.io/node_modules/socket.io-client/socket.io.js')));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

var socketIdToPlayerId = {};

io.sockets.on('connect', function(socket) {
    io.sockets.connected[socket.id].emit('connected', true);

    socket.on('getPlayers', function() {
        var data = [];
        for (var i = 0; i < players.length; i++) {
            data.push(players[i].getClientDetails());
        }
        socket.emit('getPlayers', data);
    });

    socket.on('getWorldDetails', function() {
        var data = {
            time: world.time
        };
        socket.emit('getWorldDetails', data);
    });

    socket.on('addMainPlayer', function() {
        var id = players.length;
        var player = new Player(id, positions.pop());
        players.push(player);
        io.sockets.connected[socket.id].emit('addMainPlayer', player.getClientDetails());
        socket.broadcast.emit('addNewPlayer', player.getClientDetails());
    });

    socket.on('impulse', function(data) {
        currentId = data.id;
        currentX = data.x;
        currentY = data.y;
        request = true;

        if (io) {
            io.emit('impulseState', data);
        }
    });
});



var players = [];
var positions = [];
var world;

init();

function init() {
    for (var x = -10; x < 10; x += 3) {
        for (var y = -8; y < 8; y += 3) {
            positions.push(new Position(x, y));
        }
    }

    world = new p2.World({ gravity: [0, 0] });
    world.frictionGravity = 1;
    world.applyDamping = true;
}

function Player(id, position) {
    this.id = id;
    this.circleShape = new p2.Circle({
        radius: 1,
    });
    this.circleBody = new p2.Body({
        mass: 1,
        position: [position.x, position.y],
        angularVelocity: 1
    });
    this.circleBody.damping = .8;
    this.circleBody.addShape(this.circleShape);
    world.addBody(this.circleBody);

    this.getClientDetails = function() {
        return {
            id: this.id,
            position: this.circleBody.position,
            velocity: this.circleBody.velocity,
            angularVelocity: this.circleBody.angularVelocity
        };
    };
}

function Position(x, y) {
    this.x = x;
    this.y = y;
}

setInterval(function() {
    sendState();
}, 500);

function sendState() {
    var data = [];
    for (var i = 0; i < players.length; i++) {
        data.push(players[i].getClientDetails());
    }
    if (io) {
        if (io) {
            io.emit('state', data);
        }
    }
}

var aCount = 0;
var fixedTimeStep = 1 / 60, maxSubSteps = 10, lastTimeMilliseconds;

setInterval(function() {
    world.step(1 / 60);
}, 1000 / 60);

var currentId;
var currentX;
var currentY;
var request = false;

world.on("postStep", function() {
    if (request) {
        players[currentId].circleBody.applyForce([currentX, currentY], players[currentId].circleBody.position);
        request = false;
    }
});
