import { IZIRServerCommunications } from "../globalInterfaces/MainInterfaces";

export abstract class ZIRServerBase implements IZIRServerCommunications {
    protected updateHandler: (data) => void;
    protected resetHandler: (data) => void;
    protected messageHandler: (message) => void;
    protected usernameHandler: () => void;
    protected debugMessageHandler: (message) => void;

    public setUpdateHandler(handler: (data) => void) {
        this.updateHandler = handler;
    }

    public setResetHandler(handler: (data) => void) {
        this.resetHandler = handler;
    }

    public setMessageHandler(hander: (message) => void) {
        this.messageHandler = hander
    }

    public setUsernameHandler(handler: () => void) {
        this.usernameHandler = handler;
    }

    public setDebugMessageHandler(handler: (data) => void) {
        console.log("This was called too");
        this.debugMessageHandler = handler;
    }

    public abstract sendInfoToServer(type: string, message: any): void;
    public abstract getPlayersOnline(): string[];
    public abstract registerServerListeners(): void;
}