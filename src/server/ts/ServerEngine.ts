import { ZIRSessionManager, Session } from "./SessionManager";
import { ZIREntity } from "./baseObjects/EntityBase";
import { ZIRPhysicsEngine } from "./PhysicsEngine";
import { ZIRWorld } from "./baseObjects/World";
import { ZIRPlayerWorld } from "./PlayerWorld";
import { ZIRPlayer } from "./entities/mobs/Player";
import { ZIRLogger } from "./Logger";
import { IZIRResetResult, IZIRUpdateResult } from "./globalInterfaces/IServerUpdate";
import { ZIRSpite } from "./baseObjects/Spite";
import { ZIREventScheduler } from "./EventScheduler";

export class ZIRServerEngine {
    private dt: number = 0;
    private sessionManager: ZIRSessionManager;
    private physicsEngine: ZIRPhysicsEngine = new ZIRPhysicsEngine();
    private eventScheduler: ZIREventScheduler;
    private readonly TPS: number = 30;
    protected sessions: Session[] = [];

    // TODO: Refactor to World ID-indexed hashmap
    private universe: ZIRWorld[] = [];
    private defaultView: ZIREntity;
    private tickCounter: number = 0;

    constructor() {
        this.defaultView = new ZIRSpite();

        this.sessionManager = new ZIRSessionManager(this.registerSession.bind(this), this.handleSpawn.bind(this), this.defaultView);
        this.eventScheduler = ZIREventScheduler.getInstance();

        this.gameLoop();
    }

    /**
     * Return delta time from the
     * previous game tick
     */
    public getDT(): number {
        // TODO: Store in divided form
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
        const worldID = "wilderness";
        session.setWorldID(worldID);

        // TODO: Use findWorldById
        let world = this.findWorldById(worldID);
        if (!world) {
            const newWorld = new ZIRPlayerWorld(worldID);
            newWorld.registerEntity(this.defaultView);
            this.universe[worldID] = newWorld;
            world = newWorld;
        }

        this.sessionManager.sendToClient(session.getSocket(), "updateWorld", world.getTerrainMap());
        this.handleSpawn(session);
    }

    public handleSpawn(session: Session) {
        const player = new ZIRPlayer();
        session.setPlayer(player);
        const world = this.findWorldById(session.getWorldID());
        world.registerEntity(player);
    }

    public disconnectSession(disconnectedSession: Session) {
        for (let i = 0; i < this.sessions.length; i++) {
            const session = this.sessions[i];
            if (session === disconnectedSession) {
                session.getPlayer().kill();
                this.sessions.splice(i, 1);
            }
        }
    }

    // TODO: Cache at the beginning of each tick
    // but not Dan's way
    public getAllEntities() {
        let toReturn: ZIREntity[] = [];
        for (const world in this.universe) {
            toReturn.push(...this.universe[world].getEntities());
        }
        return toReturn;
    }

    /**
     * Regulates game ticks and other
     * core engine functions
     */
    private gameLoop = (): void => {
        const t = Date.now();

        this.tick().then(() => {
            this.tickCounter++;

            const dt = Date.now() - t;
            const pause = Math.max((1000 / this.TPS) - dt, 0);
            this.dt = dt + pause;
            setTimeout(this.gameLoop, pause);
        });
    }

    /**
     * Triggers calculation of all game mechanics
     */
    private async tick() {
        const usernames: string[] = [];
        for (const session of this.sessions) {
            usernames.push(session.getUsername());
            session.update();
        }

        // TODO: Consider moving broadcast packets to central list and reading within SessionManager
        this.sessionManager.broadcast("players", JSON.stringify(usernames));

        // TODO: Debug flag
        this.sendDebugInfo();

        await this.calculatePhysics();

        this.handleInput();

        this.checkCollision();

        this.eventScheduler.update(this.tickCounter);

        const shouldReset = this.tickCounter % 30 === 0;
        this.sendUpdate(shouldReset);

        this.collectGarbage();
    }

    private checkCollision() {
        for (const world in this.universe) {
            this.universe[world].runCollisionLogic();
        }
    }

    // TODO: Refactor to place in World
    private collectGarbage() {
        for (const world in this.universe) {
            this.universe[world].collectGarbage();
        }
    }

    private async calculatePhysics() {
        const updates: Array<Promise<void>> = [];
        this.getAllEntities().forEach((entity) => {
            entity.update(this);
            updates.push(this.physicsEngine.applyPhysics(entity, this.getDT()));
        });
        await Promise.all(updates);
    }

    private sendUpdate(reset: boolean = false) {
        for (const session of this.sessions) {
            const calculatedUpdates = [];
            const world = this.findWorldById(session.getWorldID());
            let entities = world.getEntities();

            if (!reset) {
                entities = entities.filter((entity) => {
                    const e = entity.shouldUpdate();
                    return e;
                });
            } else {
                entities = entities.filter((entity) => {
                    return !entity.isDead();
                });
            }

            for (const entity of entities) {

                const update = {
                    asset: entity.getAssetName(),
                    id: entity.getEntityId(),
                    name: entity.getName(),
                    type: entity.isDead() ? "delete" : "update",
                    x: entity.getPosition().getX(),
                    xsize: entity.getSize().getX(),
                    xspeed: null,
                    y: entity.getPosition().getY(),
                    ysize: entity.getSize().getY(),
                    yspeed: null,
                };
                calculatedUpdates.push(update);
            }


            if (reset) {
                this.sessionManager.sendToClient(session.getSocket(), "reset", { entities: calculatedUpdates } as IZIRResetResult);
            } else {
                this.sessionManager.sendToClient(session.getSocket(), "update", { updates: calculatedUpdates } as IZIRUpdateResult);
            }
        }

        const entities = this.getAllEntities();
        for (const e of entities) {
            e.setUpdated(true);
        }
    }

    private handleInput = (): void => {
        for (const session of this.sessions) {
            const world = this.findWorldById(session.getWorldID());
            const player = session.getPlayer();
            if (player instanceof ZIRPlayer) {
                (player as ZIRPlayer).do(session.getInputs(), world);
            }
        }
    }

    private findWorldById(worldID: string) {
        return this.universe[worldID];
    }

    /**
     * Emits a packet of debug info for the client
     * to render if debug rendering is enabled
     */
    private sendDebugInfo = (): void => {
        for (const session of this.sessions) {
            const debugMessages = [];
            debugMessages.push("Controls: " + JSON.stringify(session.getInputs()));
            debugMessages.push("Server Tick Speed: " + this.getDT().toFixed(4));
            debugMessages.push("Current Session: " + session);
            debugMessages.push("Entities (" + this.getAllEntities().length + " total): " + this.getAllEntities());
            session.setDebugMessages(debugMessages);
            this.sessionManager.sendToClient(session.getSocket(), "debug", debugMessages);
        }
    }
}
