import { ZIRServerBase } from "./baseObjects/ServerBase";

declare function io();

export class ZIRServerCommunications extends ZIRServerBase {
    private socket;
    public playersOnline: string[] = [];

    constructor() {
        super();
    }

    public registerServerListeners() {
        var socket = io();
        socket.emit('login');
        socket.on('players', ((data) => {
            this.playersOnline = JSON.parse(data)
        }).bind(this));
        socket.on('update', (data) => { this.handlers['update'](data) });
        socket.on('reset', (data) => { this.handlers['reset'](data) });
        socket.on('message', (data) => { this.handlers['message'](data) });
        socket.on('requestUsername', () => { this.handlers['requestUsername']() });
        socket.on('debug', (data) => { this.handlers['debug'](data) });
        socket.on('playerID', (data) => { this.handlers['playerID'](data) });
        this.socket = socket;
    }

    public sendInfoToServer(type: string, message: any) {
        this.socket.emit(type, message);
    }

    public getPlayersOnline() {
        return this.playersOnline;
    }

    private callHandler(type: string, data?: any) {
        this.handlers[type](data);
    }
}