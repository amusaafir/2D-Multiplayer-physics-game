var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var io = require('socket.io').listen(server);

server.listen(3000);

// Client and server data
app.use('/node_modules/p2/build/p2.js', express.static(path.join(__dirname, '/node_modules/p2/build/p2.js')));
app.use('/node_modules/socket.io/node_modules/socket.io-client/socket.io.js', express.static(path.join(__dirname, '/node_modules/socket.io/node_modules/socket.io-client/socket.io.js')));

// Client data
app.use('/client/Loader.js', express.static(path.join(__dirname, '/client/Loader.js')));
app.use('/client/Settings.js', express.static(path.join(__dirname, '/client/Settings.js')));
app.use('/client/Game.js', express.static(path.join(__dirname, '/client/Game.js')));
app.use('/client/Renderer.js', express.static(path.join(__dirname, '/client/Renderer.js')));
app.use('/client/World.js', express.static(path.join(__dirname, '/client/World.js')));
app.use('/client/Network.js', express.static(path.join(__dirname, '/client/Network.js')));
app.use('/client/Player.js', express.static(path.join(__dirname, '/client/Player.js')));

// Server loader
var GameServer = require('./server/Loader');

var game = new GameServer(io); 

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
