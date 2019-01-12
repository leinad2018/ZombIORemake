declare function io();

export class ZIRServerEngine {
    dt: number = 0;
    players: { [socket: string]: string; } = { };
    playerID: number = 1;
    TPS: number = 30;

    constructor() {
        var express = require('express');
        var http = require('http');
        var path = require('path');
        var socketIO = require('socket.io');
        var app = express();
        var server = http.Server(app);
        var io = socketIO(server);
        const PORT = 5000;
        
        app.set('port', PORT);
        app.use('/static', express.static(__dirname + '/static'));
        
        // Routing
        app.get('/', function (request, response) {
          response.sendFile(path.join(__dirname, 'index.html'));
        });
        
        // Starts the server.
        server.listen(PORT, function () {
          console.log('Starting server on port ' + PORT);
        });
        
        // Add the WebSocket handlers
        io.on('connection', (socket) => {
            this.onConnection(socket);
        });

        setInterval(() => {this.gameLoop()}, 1000/this.TPS);
        setInterval(function () {
            io.sockets.emit('message', 'hi!');
            io.sockets.emit('message',JSON.stringify(this.players));
          }, 10000);
    }

    private onConnection = (socket) => {
        socket.on('login', (() => {
            console.log(socket.id);
            return function() {
                this.players[socket] = "Player " + this.playerID;
                this.playerID++;
            }
        }).bind(this));
        socket.on('rename', (data) => {
            this.players[socket] = data;
        })
    }

    private gameLoop = () => {
        const t = Date.now()
        
        this.tick();
        
        this.dt = Date.now() - t + (1000/this.TPS);
    }

    private tick = () => {
        //console.log(this.dt);
    }
}