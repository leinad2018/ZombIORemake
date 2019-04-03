import { IZIREntityUpdateResult, IZIRResetResult } from "./globalInterfaces/IServerUpdate";
import { Inputs } from "./globalInterfaces/UtilityInterfaces";
import { ZIRPlayer } from "./entities/mobs/Player";
import { ZIREntity } from "./baseObjects/EntityBase";
import * as express from "express";
import * as http from "http";
import * as path from "path";
import * as socketIO from "socket.io";

export class ZIRSessionManager {
    private listeners: { [header: string]: () => void } = {};
    private io: any;
    private defaultView: ZIREntity;
    public registerSessionHandler: (session: Session) => void;
    private spawnHandler: (session: Session) => void;

    constructor(registerSessionHandler, spawnHandler, defaultView: ZIREntity) {
        this.registerSessionHandler = registerSessionHandler;
        this.spawnHandler = spawnHandler;
        const app = express();
        const server = new http.Server(app);
        this.io = socketIO(server);
        this.defaultView = defaultView;

        const PORT: number = 5000;
        const CLIENT_ROOT = __dirname + "/../../services/client/";
        app.set("port", PORT);
        app.use(express.static(CLIENT_ROOT));

        // Routing
        app.get("/", (request, response) => {
            response.sendFile(path.resolve(CLIENT_ROOT + "web/index.html"));
        });

        // Starts the server.
        server.listen(PORT, () => {
            console.log("Starting game server on port " + PORT);
        });
        // Add the WebSocket handlers
        this.io.on("connection", (socket) => {
            this.onConnection(socket);
        });

        // setInterval(() => {
        //     this.io.sockets.emit('message', 'hi!');
        //     this.io.sockets.emit('message', JSON.stringify(this.sessions));
        // }, 1000);
    }

    private onConnection(socket): void {
        this.handleLogin(socket);
    }

    private handleInput(this: Session, data): void {
        // console.log(data.keycode);
        if (data.keycode) {
            // console.log(data.state);
            this.getInputs()[data.keycode] = data.state;
        }
    }

    /**
     * Handle dropped connection by removing
     * any sessions corresponding to the connection
     */
    private handleDisconnection(this: Session, data): void {
        console.log("Disconnecting " + this.getSocket());

        this.deactivate();
    }

    /**
     * Handle new connection by generating
     * a new Session object storing the user's
     * socket for future reference
     */
    private handleRename(this: Session, data): void {
        if (data) {
            this.setUsername(data);
        }
    }

    private handleLogin(socket): void {
        const s = new Session(socket.id, this.defaultView, this.io);
        socket.on("rename", this.handleRename.bind(s));
        socket.on("disconnect", this.handleDisconnection.bind(s));
        socket.on("input", this.handleInput.bind(s));
        socket.on("respawn", (() => { this.spawnHandler(s); }).bind(this));
        this.registerSessionHandler(s);
        socket.emit("requestRename");
    }

    private addHandler = (key: string, callback: () => void): void => {
        this.listeners[key] = callback;
    }

    public sendToClient = (socketId: string, header: string, data: any): void => {
        this.io.to(socketId).emit(header, data);
    }

    public broadcast = (header: string, data: any): void => {
        this.io.sockets.emit(header, data);
    }

    public resetClients = (entitiesReset: IZIRResetResult): void => {
        this.io.sockets.emit("reset", entitiesReset);
    }

    public updateClients = (entitiesUpdate: IZIREntityUpdateResult): void => {
        this.io.sockets.emit("update", entitiesUpdate);
    }

    public messageClients = (message: any): void => {
        this.io.sockets.emit("message", message);
    }
}

export class Session {
    private static sessionCount: number = 0;
    private active: boolean;
    private username: string;
    private socket: string;
    private inputs: Inputs = {};
    private debugMessages: string[] = [];
    private player: ZIREntity;
    private defaultView: ZIREntity;
    private worldID: string;
    private disconnectHandler: (session: Session) => void;
    private respawnRequested = false;
    private io;

    constructor(socket: string, defaultView: ZIREntity, io) {
        this.socket = socket;
        this.defaultView = defaultView;
        this.active = true;
        this.username = "Player" + Session.sessionCount;
        this.io = io;
        Session.sessionCount++;
    }

    public update() {
        if (this.player.isDead()) {
            this.setFocus(this.defaultView);
            if (!this.respawnRequested) {
                this.requestRespawn();
            }
        } else {
            this.respawnRequested = false;
            this.setFocus(this.player);
        }
    }

    public requestRespawn() {
        this.io.to(this.socket).emit("requestRespawn");
        this.respawnRequested = true;
    }

    public setDisconnectHandler(handler: (session: Session) => void) {
        this.disconnectHandler = handler;
    }

    public setWorldID(id: string) {
        this.worldID = id;
    }

    public getSocket() {
        return this.socket;
    }

    public getUsername(): string {
        return this.username;
    }

    public getWorldID() {
        return this.worldID;
    }

    public deactivate(): void {
        this.active = false;
        this.disconnectHandler(this);
    }

    public setFocus(entity: ZIREntity) {
        this.io.to(this.socket).emit("updateFocus", entity.getObject());
    }

    public setPlayer(player: ZIREntity) {
        this.player = player;
        if (this.player instanceof ZIRPlayer) {
            (this.player as ZIRPlayer).setName(this.username);
        }
        this.setFocus(this.player);
    }

    public getPlayer(): ZIREntity {
        return this.player;
    }

    public getInputs(): Inputs {
        return this.inputs;
    }

    public setUsername(username: string): void {
        this.username = username;
        this.player.setName(this.username);

    }

    public toString(): string {
        return this.username + "/" + this.socket;
    }

    public setDebugMessages(messages: string[]): void {
        this.debugMessages = messages;
    }
}
