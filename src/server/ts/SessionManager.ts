import { Socket } from "net";

//declare function io();

export class ZIRSessionManager {
    sessions : Session[] = [];
    listeners : {[header: string]: Function} = {};
    io : any;


    constructor() {
        var express = require('express');
        var http = require('http');
        var path = require('path');
        var socketIO = require('socket.io');
        var app = express();
        var server = http.Server(app);
        this.io = socketIO(server);
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
        this.io.on('connection', (socket) => {
            this.onConnection(socket);
        });
        
        setInterval(() => {
            this.io.sockets.emit('message', 'hi!');
            this.io.sockets.emit('message', JSON.stringify(this.sessions));
        }, 1000);
        

    }

    private onConnection = function(socket) : void {
        socket.emit("requestUsername")

        this.handleLogin(socket)
        
        for(var listener in this.listeners) {
            const listenerHandler = this.listeners[listener];
            socket.on(listener, (data) => {
                listenerHandler(data)
            });
        }

        socket.on('rename', (data) => {
            console.log(data);
            for(let i=0; i < this.sessions.length; i++){
                let session = this.sessions[i];
                if(session.socket == socket.id) {
                    console.log("found");
                    this.sessions[i].username = data;
                }
            }
        });

        socket.on('disconnect', () => {
            this.onDisconnection(socket);
        });
    }

    /**
     * Handle dropped connection by removing
     * any sessions corresponding to the connection
     */
    private onDisconnection = function(socket) : void {
        console.log("Attempting to disconnect " + socket.id)
        for(let i=0; i < this.sessions.length; i++){
            let session = this.sessions[i];
            if(session.socket == socket.id) {
                this.sessions.splice(i,1)
            }
        }
    }

    /**
     * Handle new connection by generating
     * a new Session object storing the user's
     * socket for future reference
     */
    private handleLogin = (socket) : void => {
        console.log("Detected new login");
        console.log(socket.id);
        const s = new Session(socket.id);
        this.sessions.push(s);
        console.log("Added session: " + this.sessions);
    }

    private addSocketListener(key:string, callback: Function) {
        this.listeners[key] = callback;
    }

    public getUsernames = () : string[] => {
        let usernames : string[] = [];
        for(let session of this.sessions) {
            usernames.push(session.username);
        }
        return usernames;
    }

    public broadcast = (header : string, data : any) : void => {
        this.io.sockets.emit(header, data)
    }
}

export class Session {
    static sessionCount : number = 0;
    username : string;
    socket : string;

    constructor(socket : string) {
        this.socket = socket;
        this.username = "Player" + Session.sessionCount;
        Session.sessionCount++;
    }

    public toString = () : string => {
        return this.username + "/" + this.socket;
    }
}