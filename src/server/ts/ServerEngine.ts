import { ZIRSessionManager, Session } from "./SessionManager";
import { ZIREntity } from "./baseObjects/EntityBase"
import { ZIRPhysicsEngine } from "./PhysicsEngine";
import { ZIRWorld } from "./baseObjects/World";
import { ZIRPlayerWorld } from "./PlayerWorld";
import { ZIRPlayer } from "./entities/mobs/Player";
import { ZIRLogger } from "./Logger";
import { IZIRResetResult, IZIRUpdateResult } from "./globalInterfaces/IServerUpdate";
import { ZIRTimedEvent } from "./baseObjects/TimedEvent";
import { ZIRSpite } from "./baseObjects/Spite";

export class ZIRServerEngine {
    dt: number = 0;
    sessionManager: ZIRSessionManager;
    physicsEngine: ZIRPhysicsEngine = new ZIRPhysicsEngine();
    TPS: number = 30;
    protected sessions: Session[] = [];
    universe: ZIRWorld[] = [];
    defaultView: ZIREntity;
    tickCounter: number = 0;
    packetLogger: ZIRLogger;
    protected currentEvents: ZIRTimedEvent[] = [];

    constructor() {
        setInterval(() => { this.gameLoop() }, 1000 / this.TPS);

        this.packetLogger = new ZIRLogger("packets.log");
        this.packetLogger.disable();
        this.defaultView = new ZIRSpite();

        this.sessionManager = new ZIRSessionManager(this.registerSession.bind(this), this.handleSpawn.bind(this), this.packetLogger, this.defaultView);
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
        let worldID = "wilderness";
        session.setWorldID(worldID);

        for (let world of this.universe) {
            if (world.getWorldID() == worldID) {
                this.sessionManager.sendToClient(session.getSocket(), "updateWorld", world.getTerrainMap());
                this.handleSpawn(session);
                return;
            }
        }
        let newWorld = new ZIRPlayerWorld(worldID);
        newWorld.registerEntity(this.defaultView);
        this.universe.push(newWorld);
        this.sessionManager.sendToClient(session.getSocket(), "updateWorld", newWorld.getTerrainMap());
        this.handleSpawn(session);
    }

    public handleSpawn(session: Session) {
        let player = new ZIRPlayer();
        session.setPlayer(player);
        let world = this.findWorldById(session.getWorldID());
        world.registerEntity(player);
    }

    public disconnectSession(disconnectedSession: Session) {
        for (let i = 0; i < this.sessions.length; i++) {
            let session = this.sessions[i];
            if (session == disconnectedSession) {
                session.getPlayer().kill();
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

    public destroyEntityInWorlds(entity: ZIREntity) {
        for (let world of this.universe) {
            world.destroyEntity(entity)
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
            usernames.push(session.getUsername());
            session.update();
        }
        this.sessionManager.broadcast("players", JSON.stringify(usernames));

        this.sendDebugInfo();

        await this.calculatePhysics();

        this.handleInput();

        this.checkCollision();

        await this.updateEvents();

        let shouldReset = false;
        if (this.tickCounter % 30 == 0) {
            shouldReset = true;
        }
        this.sendUpdate(shouldReset);

        this.collectGarbage();
    }

    private checkCollision() {
        for (let world of this.universe) {
            world.runCollisionLogic();
        }
    }

    private collectGarbage() {
        this.getAllEntities().forEach(
            (entity) => { if (entity.isDead()) this.destroyEntityInWorlds(entity) }
        );
    }

    private async calculatePhysics() {
        let updates: Promise<void>[] = [];
        this.getAllEntities().forEach((entity) => {
            entity.update(this);
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

        if (reset) entities = entities.filter((entity) => {
            return !entity.isDead();
        });

        for (let entity of entities) {

            let update = {
                id: entity.getEntityId(),
                type: entity.isDead() ? "delete" : "update",
                asset: entity.getAssetName(),
                x: entity.getPosition().getX(),
                y: entity.getPosition().getY(),
                xspeed: null,
                yspeed: null,
                xsize: entity.getSize().getX(),
                ysize: entity.getSize().getY(),
                name: entity.getName()
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
            let world = this.findWorldById(session.getWorldID());
            let player = session.getPlayer();
            if (player instanceof ZIRPlayer) {
                (player as ZIRPlayer).do(session.getInputs(), world);
            }
        }
    }

    private findWorldById(worldID: string){
        for(let world of this.universe){
            if(world.getWorldID() == worldID){
                return world;
            }
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
            debugMessages.push("Server Tick Speed: " + this.getDT().toFixed(4));
            debugMessages.push("Current Session: " + session);
            debugMessages.push("Entities (" + this.getAllEntities().length + " total): " + this.getAllEntities());
            session.setDebugMessages(debugMessages);
            this.sessionManager.sendToClient(session.getSocket(), "debug", debugMessages);
        }
    }
}