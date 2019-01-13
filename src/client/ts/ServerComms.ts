declare function io();

export class ZIRServerCommunications {
    private updateHandler: () => void;
    private usernameHandler: () => void;
    private socket;

    constructor() {
        this.registerServerListener();
    }

    private registerServerListener() {
        var socket = io();
        socket.emit('login');
        socket.on('update', ((data) => {
            console.log(data);
            this.updateClient();
        }).bind(this));
        socket.on('requestUsername', ((data) => {
            console.log("username request data " + data);
            this.usernameHandler();
        }).bind(this));
        socket.on('players', ((data) => {
            console.log("Players online: " + data);
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