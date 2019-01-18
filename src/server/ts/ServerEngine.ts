import { addListener } from "cluster";
import { ZIRSessionManager, Session } from "./SessionManager";
import { ZIREntity } from "./baseObjects/EntityBase"
import { ZIRPhysicsEngine } from "./PhysicsEngine";
import { ZIRSpite } from "./baseObjects/Spite";
import { Vector } from "./utilityObjects/Math";
import { ZIRWorld } from "./baseObjects/World";
import { ZIRPlayerWorld } from "./PlayerWorld";
import { ZIRPlayer } from "./baseObjects/Player";

export class ZIRServerEngine {
    dt: number = 0;
    sessionManager: ZIRSessionManager = new ZIRSessionManager(this.registerSession.bind(this));
    physicsEngine: ZIRPhysicsEngine = new ZIRPhysicsEngine();
    TPS: number = 30;
    protected sessions: Session[] = [];
    universe: ZIRWorld[] = [];

    constructor() {
        setInterval(() => { this.gameLoop() }, 1000 / this.TPS);
    }

    /**
     * Return delta time from the
     * previous game tick
     */
    public getDT = (): number => {
        return this.dt / 1000;
    }

    /**
     * Registers a player to a world
     * If the world does not exist, one is created
     * @param worldID 
     * @param player 
     */
    public registerSession(session: Session) {
        session.setDisconnectHandler(this.disconnectSession.bind(this));
        let player = new ZIRPlayer();
        let worldID = player.getEntityId();
        session.setPlayer(player);
        session.setWorldID(worldID);
        this.sessionManager.sendToClient(session.socket, "updatePlayer", player.getObject());
        for (let world of this.universe) {
            if (world.getWorldID() == worldID) {
                world.registerEntity(player);
                this.sessionManager.sendToClient(session.socket, "updateWorld", world.getTerrainMap());
                return;
            }
        }
        let newWorld = new ZIRPlayerWorld(worldID);
        newWorld.registerEntity(player);
        this.universe.push(newWorld);
        this.sessionManager.sendToClient(session.socket, "updateWorld", newWorld.getTerrainMap());
    }

    public disconnectSession(socket: string) {
        for (let i = 0; i < this.sessions.length; i++) {
            let sesson = this.sessions[i];
            if (sesson.socket = socket) {
                this.sessions.splice(i, 1);
            }
        }
    }

    public getAllEntities() {
        let toReturn: ZIREntity[] = [];
        for (let world of this.universe) {
            toReturn = toReturn.concat(world.getEntities());
        }
        return toReturn;
    }

    public registerEntity(worldID: string, e: ZIREntity) {
        for (let world of this.universe) {
            if (world.getWorldID() == worldID) {
                world.registerEntity(e);
                return;
            }
        }
    }

    /**
     * Regulates game ticks and other
     * core engine functions
     */
    private gameLoop = (): void => {
        const t = Date.now()

        this.tick();

        this.dt = Date.now() - t + (1000 / this.TPS);
    }

    /**
     * Triggers calculation of all game mechanics
     */
    private tick = (): void => {
        let usernames: string[] = [];
        for (let session of this.sessions) {
            usernames.push(session.username);
        }
        this.sessionManager.broadcast("players", JSON.stringify(usernames));

        let calculatedUpdates = [];
        for (let entity of this.getAllEntities()) {

            this.physicsEngine.applyPhysics(entity, this.getDT());

            let update = {
                id: entity.getEntityId(),
                type: "update",
                asset: entity.getAssetName(),
                x: entity.getPosition().getX(),
                y: entity.getPosition().getY(),
                xspeed: null,
                yspeed: null
            }
            calculatedUpdates.push(update);
        }

        for (let session of this.sessions) {
            let player = session.getPlayer();
            let m = player.getMoveSpeed();
            let a = new Vector(0, 0);

            for (let input in session.getInputs()) {
                if (session.getInputs()[input]) {
                    switch (input) {
                        case "upArrow":
                            a.setY(a.getY() - m);
                            break;
                        case "downArrow":
                            a.setY(a.getY() + m);
                            break;
                        case "leftArrow":
                            a.setX(a.getX() - m);
                            break;
                        case "rightArrow":
                            a.setX(a.getX() + m);
                            break;
                    }
                }
            }
            if (a.getMagnitude() != 0) {
                a = a.getUnitVector().scale(m);
            }
            player.setAcceleration(a);
        }

        this.sessionManager.broadcast("update", { updates: calculatedUpdates });

        this.sendDebugInfo();
    }

    /**
     * Emits a packet of debug info for the client
     * to render if debug rendering is enabled
     */
    private sendDebugInfo = (): void => {
        for (let session of this.sessions) {
            let debugMessages = [];
            debugMessages.push("Controls: " + JSON.stringify(session.getInputs()));
            debugMessages.push("Server Tick Speed: " + this.getDT().toFixed(0));
            debugMessages.push("Current Session: " + session);
            debugMessages.push("Entities: " + this.getAllEntities());
            session.setDebugMessages(debugMessages);
            this.sessionManager.sendToClient(session.socket, "debug", debugMessages);
        }
    }
}