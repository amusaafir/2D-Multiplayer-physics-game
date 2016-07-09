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
app.use('/resources/pixi.js', express.static(path.join(__dirname, '/resources/pixi.js')));
app.use('/build/bundle.js', express.static(path.join(__dirname, '/build/bundle.js')));

// Server loader
var GameServer = require('./server/Loader');

var game = new GameServer(io);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
