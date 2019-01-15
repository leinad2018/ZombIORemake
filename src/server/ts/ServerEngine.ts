import { addListener } from "cluster";
import { ZIRSessionManager } from "./SessionManager";
import {ZIREntity} from "./baseObjects/EntityBase"
import { ZIRPhysicsEngine } from "./PhysicsEngine";
import { ZIRSpite } from "./baseObjects/Spite";
import { Vector } from "./utilityObjects/Math";

export class ZIRServerEngine {
    dt: number = 0;
    sessionManager: ZIRSessionManager = new ZIRSessionManager(this.registerEntity.bind(this));
    physicsEngine: ZIRPhysicsEngine = new ZIRPhysicsEngine();
    TPS: number = 30;
    entities: ZIREntity[] = [];

    constructor() {
        setInterval(() => { this.gameLoop() }, 1000 / this.TPS);
        let spite = new ZIRSpite();
        this.registerEntity(spite);
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
            
            this.physicsEngine.applyPhysics(entity,this.dt);

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

        for (let session of this.sessionManager.getSessions()) {
            let player = session.getPlayer();
            for (let input in session.getInputs()) {
                if(session.getInputs()[input]) {
                    switch(input) {
                        case "upArrow":
                            player.setAcceleration(player.getAcceleration().add(new Vector(0,1)));
                            break;
                        case "downArrow":
                            player.setAcceleration(player.getAcceleration().add(new Vector(0,-1)));
                            break;
                        case "leftArrow":
                            player.setAcceleration(player.getAcceleration().add(new Vector(-1,0)));
                            break;
                        case "rightArrow":
                            player.setAcceleration(player.getAcceleration().add(new Vector(1,0)));
                            break;
                    }
                }
            }
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