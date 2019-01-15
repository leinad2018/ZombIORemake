import { addListener } from "cluster";
import { ZIRSessionManager } from "./SessionManager";

export class ZIRServerEngine {
    dt: number = 0;
    sessionManager: ZIRSessionManager = new ZIRSessionManager();
    TPS: number = 30;

    constructor() {
        setInterval(() => { this.gameLoop() }, 1000 / this.TPS);
    }

    /**
     * Return delta time from the
     * previous game tick
     */
    public getDT = () : number => {
        return this.dt;
    }

    /**
     * Regulates game ticks and other
     * core engine functions
     */
    private gameLoop = () : void => {
        const t = Date.now()

        this.tick();

        this.dt = Date.now() - t + (1000 / this.TPS);
    }

    /**
     * Triggers calculation of all game mechanics
     */
    private tick = () : void => {
        this.sessionManager.broadcast("players", JSON.stringify(this.sessionManager.getUsernames()));
        this.sessionManager.broadcast("update", {updates:[]});

        this.sendDebugInfo();
    }

    /**
     * Emits a packet of debug info for the client
     * to render if debug rendering is enabled
     */
    private sendDebugInfo = () : void => {
        for (let session of this.sessionManager.getSessions()) {
            let debugMessages = [];
            debugMessages.push("Controls: " + JSON.stringify(session.getInputs()));
            debugMessages.push("Server Tick Speed: " + this.getDT().toFixed(0));
            debugMessages.push("Current Session: " + session);
            session.setDebugMessages(debugMessages);
            this.sessionManager.sendToClient(session.socket, "debug", debugMessages);
        }
    }
}