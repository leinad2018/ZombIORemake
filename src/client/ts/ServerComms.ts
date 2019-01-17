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
        for (let handler in this.handlers) {
            socket.on(handler, (data) => { this.handlers[handler](data) });
        }
        // socket.on('update', (data) => { this.handlers['update'](data) });
        // socket.on('reset', (data) => { this.handlers['reset'](data) });
        // socket.on('message', (data) => { this.handlers['message'](data) });
        // socket.on('requestUsername', () => { this.handlers['requestUsername']() });
        // socket.on('debug', (data) => { this.handlers['debug'](data) });
        // socket.on('updatePlayer', (data) => { this.handlers['updatePlayer'](data) });
        // socket.on('updateWorld', (data) => { this.handlers['updateWorld'](data) });
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