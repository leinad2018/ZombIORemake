declare function io();

export class ZIRServerCommunications {
    private updateHandler: () => void;
    private usernameHandler: () => void;
    private socket;
    public playersOnline: string[] = [];

    constructor() {
        this.registerServerListener();
    }

    private registerServerListener() {
        var socket = io();
        socket.emit('login');
        socket.on('update', ((data) => {
            this.updateClient();
        }).bind(this));
        socket.on('requestUsername', ((data) => {
            this.usernameHandler();
        }).bind(this));
        socket.on('players', ((data) => {
            this.playersOnline = JSON.parse(data)
        }).bind(this));
        this.socket = socket;
    }

    public setUpdateHandler(handler: () => void) {
        this.updateHandler = handler;
    }
    public setUsernameHandler(handler: () => void) {
        this.usernameHandler = handler;
    }

    public sendMessageToServer(message: string) {
        this.socket.emit('rename', message);
    }

    private updateClient() {
        this.updateHandler();
    }
}