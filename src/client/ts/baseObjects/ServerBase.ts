export abstract class ZIRServerBase {
    protected handlers: Array<(data?: any) => void>;

    constructor() {
        this.handlers = [];
    }

    public setHandler(type: string, handler: (data?: any) => void) {
        this.handlers[type] = handler;
    }

    public abstract sendInfoToServer(type: string, message: any): void;
    public abstract getPlayersOnline(): string[];
    public abstract registerServerListeners(): void;
}
