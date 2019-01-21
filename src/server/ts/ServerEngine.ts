import { ZIRSessionManager, Session } from "./SessionManager";
import { ZIREntity } from "./baseObjects/EntityBase"
import { ZIRPhysicsEngine } from "./PhysicsEngine";
import { ZIRSpite } from "./baseObjects/Spite";
import { Vector } from "./utilityObjects/Math";
import { ZIRWorld } from "./baseObjects/World";
import { ZIRPlayerWorld } from "./PlayerWorld";
import { ZIRPlayer } from "./baseObjects/Player";
import { ZIRProjectile } from "./baseObjects/ProjectileBase"
import { ZIRLogger } from "./Logger";
import { IZIRResetResult, IZIRUpdateResult } from "./globalInterfaces/IServerUpdate";
import { ZIRTimedEvent } from "./baseObjects/TimedEvent";

export class ZIRServerEngine {
    dt: number = 0;
    sessionManager: ZIRSessionManager;
    physicsEngine: ZIRPhysicsEngine = new ZIRPhysicsEngine();
    TPS: number = 30;
    protected sessions: Session[] = [];
    universe: ZIRWorld[] = [];
    tickCounter: number = 0;
    packetLogger: ZIRLogger;
    protected currentEvents: ZIRTimedEvent[] = [];

    constructor() {
        setInterval(() => { this.gameLoop() }, 1000 / this.TPS);

        this.packetLogger = new ZIRLogger("packets");
        this.sessionManager = new ZIRSessionManager(this.registerSession.bind(this), this.packetLogger);
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
        this.sessions.push(session);
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
            let session = this.sessions[i];
            session.getPlayer().kill();
            if (session.socket = socket) {
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

    public destroyEntityInWorlds(entity : ZIREntity) {
        for(let world of this.universe) {
            world.destroyEntity(entity)
        }
    }

    public registerEntity(worldID: string, e: ZIREntity) {
        for (let world of this.universe) {
            if (world.getWorldID() == worldID) {
                world.registerEntity(e);
                return;
            }
        }
    }

    public registerEvent(event: ZIRTimedEvent) {
        event.setStartingFrame(this.tickCounter);
        this.currentEvents.push(event);
    }

    /**
     * Regulates game ticks and other
     * core engine functions
     */
    private gameLoop = (): void => {
        const t = Date.now()

        this.tick().then(() => {
            this.tickCounter++;

            this.dt = Date.now() - t + (1000 / this.TPS);
        });
    }

    /**
     * Triggers calculation of all game mechanics
     */
    private async tick() {
        this.packetLogger.log("ticked")
        let usernames: string[] = [];
        for (let session of this.sessions) {
            usernames.push(session.username);
        }
        this.sessionManager.broadcast("players", JSON.stringify(usernames));

        this.sendDebugInfo();

        await this.calculatePhysics();

        this.handleInput();

        await this.updateEvents();

        let shouldReset = false;
        if (this.tickCounter % 30 == 0) {
            shouldReset = true;
        }
        this.sendUpdate(shouldReset);

        this.collectGarbage();
    }

    private collectGarbage() {
        this.getAllEntities().forEach(
            (entity) => {if (entity.isDead()) this.destroyEntityInWorlds(entity)}
        );
    }

    private async calculatePhysics() {
        let updates: Promise<void>[] = [];
        this.getAllEntities().forEach((entity) => {
            updates.push(this.physicsEngine.applyPhysics(entity, this.getDT()));
        });
        await Promise.all(updates);
    }

    private sendUpdate(reset: boolean = false) {
        let calculatedUpdates = [];
        let entities = this.getAllEntities();

        if (!reset) entities = entities.filter((entity) => {
            let e = entity.shouldUpdate();
            entity.setUpdated(true);
            return e;
        });

        for (let entity of entities) {

            let update = {
                id: entity.getEntityId(),
                type: entity.isDead() ? "delete" : "update",
                asset: entity.getAssetName(),
                x: entity.getPosition().getX(),
                y: entity.getPosition().getY(),
                xspeed: null,
                yspeed: null
            }
            calculatedUpdates.push(update);
        }
        if (reset) {
            this.sessionManager.broadcast("reset", { entities: calculatedUpdates } as IZIRResetResult);
        } else {
            this.sessionManager.broadcast("update", { updates: calculatedUpdates } as IZIRUpdateResult);
        }
    }

    private handleInput = (): void => {
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
                        case "space":
                            let p = new ZIRProjectile(new Vector(100000, 0).add(player.getVelocity()), player.getPosition());
                            this.registerEntity(player.getEntityId(), p)
                            break;
                    }
                }
            }
            if (a.getMagnitude() != 0) {
                a = a.getUnitVector().scale(m);
            }
            player.setAcceleration(a);
        }
    }

    private async updateEvents() {
        let events: Promise<void>[] = [];
        for (let event of this.currentEvents) {
            events.push(this.updateEvent(event));
        }
        await Promise.all(events);
    }

    private async updateEvent(event) {
        if (this.tickCounter > event.getEndingFrame()) {
            this.currentEvents.splice(this.currentEvents.indexOf(event))
        } else {
            event.updateEvent(this.tickCounter);
        }
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
            debugMessages.push("Entities (" + this.getAllEntities().length + " total): " + this.getAllEntities());
            session.setDebugMessages(debugMessages);
            this.sessionManager.sendToClient(session.socket, "debug", debugMessages);
        }
    }
}