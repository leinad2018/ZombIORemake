declare function io();

export class ZIRServerCommunications {
    private updateHandler: () => void;
    private socket;

    constructor() {
        this.registerServerListener();
    }

    private registerServerListener() {
        var socket = io();
        socket.emit('login');
        socket.on('message', ((data) => {
            console.log(data);
            this.updateClient();
        }).bind(this));
        this.socket = socket;
    }

    public setUpdateHandler(handler: () => void) {
        this.updateHandler = handler;
    }

    public sendMessageToServer(message: string) {
        this.socket.emit('rename', message);
    }

    private updateClient() {
        this.updateHandler();
    }
}