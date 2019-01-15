import { ZIRServerBase } from "./baseObjects/ServerBase";
import { IZIRResetResult, IZIRUpdateResult } from "./globalInterfaces/IServerUpdate";

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
        socket.on('update', this.updateClient.bind(this));
        socket.on('reset', this.resetClient.bind(this));
        socket.on('message', this.messageClient.bind(this));
        socket.on('requestUsername', this.usernameHandler.bind(this));
        this.socket = socket;
    }

    public sendInfoToServer(type: string, message: any) {
        this.socket.emit(type, message);
    }

    public getPlayersOnline(){
        return this.playersOnline;
    }

    private updateClient(data:IZIRUpdateResult) {
        this.updateHandler(data);
    }

    private resetClient(data: IZIRResetResult){
        this.resetHandler(data);
    }

    private messageClient(message: string){
        this.messageHandler(message);
    }
}