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
     * Called each game tick
     */
    private gameLoop = () : void => {
        const t = Date.now()

        this.tick();

        this.dt = Date.now() - t + (1000 / this.TPS);
    }

    private tick = () : void => {
        this.sessionManager.broadcast("players", JSON.stringify(this.sessionManager.getUsernames()));
        this.sessionManager.broadcast("update", {updates:[]});
    }
}