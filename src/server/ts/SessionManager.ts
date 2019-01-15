import { Socket } from "net";
import { IZIREntityUpdateResult, IZIRResetResult } from "./globalInterfaces/IServerUpdate"
import { Inputs } from "./globalInterfaces/UtilityInterfaces"
import { ZIRPlayer } from "./baseObjects/Player";
import { Vector } from "./utilityObjects/Math";

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
        const PORT : number = 5000;

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
        
        //setInterval(() => {
        //    this.io.sockets.emit('message', 'hi!');
        //    this.io.sockets.emit('message', JSON.stringify(this.sessions));
        //}, 1000);

        this.addHandler("rename", this.handleRename);
        this.addHandler("disconnect", this.handleDisconnection);
        this.addHandler("input", this.handleInput);
    }

    private onConnection = function(socket) : void {
        this.handleLogin(socket)

        for(var listener in this.listeners) {
            const listenerHandler = this.listeners[listener];
            socket.on(listener, (data) => {
                listenerHandler(socket, data)
            });
        }
    }

    private handleInput = (socket, data) : void => {
        if(data.keycode) {
            this.getSessionBySocket(socket).inputs[data.keycode] = data.state;
        }
    }

    /**
     * Handle dropped connection by removing
     * any sessions corresponding to the connection
     */
    private handleDisconnection = (socket, data) : void => {
        console.log("Disconnecting " + socket.id)
        let session = this.getSessionBySocket(socket);

        session.deactivate();

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
    private handleRename = (socket, data) : void => {
        this.getSessionBySocket(socket).setUsername(data);
    }

    /**
     * Finds session in SessionManager.sessions
     * that corresponds to a given socket, based
     * on socket id
     */
    private getSessionBySocket = (socket) : Session => {
        for(let i=0; i < this.sessions.length; i++){
            let session = this.sessions[i];
            if(session.socket == socket.id) {
                return session;
            }
        }
    }

    private handleLogin = (socket) : void => {
        const s = new Session(socket.id);
        this.sessions.push(s);
        socket.emit("requestUsername");
        socket.emit("playerID",s.player.getEntityId());
    }

    private addHandler = (key : string, callback : Function) : void => {
        this.listeners[key] = callback;
    }

    public getUsernames = () : string[] => {
        let usernames : string[] = [];
        for(let session of this.sessions) {
            usernames.push(session.username);
        }
        return usernames;
    }

    public getInputs = (session : Session) : {[input: string]: boolean} => {
        return session.inputs;
    }

    public sendToClient = (socketId : string, header : string, data : any): void => {
        this.io.to(socketId).emit(header, data);
    }

    public broadcast = (header : string, data : any) : void => {
        this.io.sockets.emit(header, data)
    }

    public resetClients = (entitiesReset : IZIRResetResult) : void => {
        this.io.sockets.emit("reset", entitiesReset)
    }

    public updateClients = (entitiesUpdate : IZIREntityUpdateResult) : void => {
        this.io.sockets.emit("update", entitiesUpdate);
    }

    public messageClients = (message : any) : void => {
        this.io.sockets.emit("message", message);
    }

    public getSessions = () : Session[] => {
        return this.sessions;
    }
}

export class Session {
    static sessionCount : number = 0;
    active : boolean;
    username : string;
    socket : string;
    inputs : Inputs = {};
    debugMessages : string[] = [];
    player : ZIRPlayer;

    constructor(socket : string) {
        this.socket = socket;
        this.active = true;
        this.username = "Player" + Session.sessionCount;
        this.player = new ZIRPlayer();
        Session.sessionCount++;
    }

    public deactivate = () : void => {
        this.active = false;
    }

    public getInputs = () : Inputs => {
        return this.inputs;
    } 

    public setUsername(username : string) : void {
        this.username = username;
    }

    public toString = () : string => {
        return this.username + "/" + this.socket;
    }

    public setDebugMessages = (messages : string[]) : void => {
        this.debugMessages = messages;
    }
}