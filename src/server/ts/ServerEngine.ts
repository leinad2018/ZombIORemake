import { addListener } from "cluster";
import { ZIRSessionManager } from "./SessionManager";
import {ZIREntity} from "./baseObjects/EntityBase"

export class ZIRServerEngine {
    dt: number = 0;
    sessionManager: ZIRSessionManager = new ZIRSessionManager(this.registerEntity.bind(this));
    TPS: number = 30;
    entities: ZIREntity[] = [];

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

    public registerEntity(e : ZIREntity) {
        this.entities.push(e);
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
        
        let calculatedUpdates = [];
        for (let entity of this.entities) {
            let update = {
                id: entity.getEntityId(),
                type: "update",
                asset: "player",
                x: entity.getPosition().getX(),
                y: entity.getPosition().getY(),
                xspeed: null,
                yspeed: null
            }
            calculatedUpdates.push(update);
        }

        this.sessionManager.broadcast("update", {updates:calculatedUpdates});

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
            debugMessages.push("Entities: " + this.entities);
            session.setDebugMessages(debugMessages);
            this.sessionManager.sendToClient(session.socket, "debug", debugMessages);
        }
    }
}