import { addListener } from "cluster";
import { ZIRSessionManager } from "./SessionManager";

export class ZIRServerEngine {
    dt: number = 0;
    sessionManager: ZIRSessionManager = new ZIRSessionManager();
    TPS: number = 30;

    constructor() {
        setInterval(() => { this.gameLoop() }, 1000 / this.TPS);
    }

    private gameLoop = () => {
        const t = Date.now()

        this.tick();

        this.dt = Date.now() - t + (1000 / this.TPS);
    }
    //console.log(this.dt);
    private tick = () => {
        this.sessionManager.broadcast("players", JSON.stringify(this.sessionManager.getUsernames()));
    }
}