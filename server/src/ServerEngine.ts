import { ZIRSessionManager, Session } from "./SessionManager";
import { ZIREntity } from "./baseObjects/EntityBase";
import { ZIRPhysicsEngine } from "./PhysicsEngine";
import { ZIRWorld } from "./baseObjects/World";
import { ZIRPlayerWorld } from "./PlayerWorld";
import { ZIRPlayer } from "./entities/mobs/Player";
import { IZIRResetResult, IZIRUpdateResult } from "./globalInterfaces/IServerUpdate";
import { ZIRSpite } from "./baseObjects/Spite";
import { ZIREventScheduler } from "./EventScheduler";
import { ZIRConsoleManager } from "./ConsoleManager";
import { ZIRTimer } from "./Timer";

export class ZIRServerEngine {
    public readonly IS_DEVELOPMENT = true;
    private readonly TPS: number = 60;

    private sessionManager: ZIRSessionManager;
    private consoleManager: ZIRConsoleManager;
    private physicsEngine: ZIRPhysicsEngine = new ZIRPhysicsEngine();
    private eventScheduler: ZIREventScheduler;

    private defaultView: ZIREntity;
    private tickCounter: number = 0;
    private dt: number = 0;

    private sessions: Session[] = [];
    private universe: ZIRWorld[] = [];
    private entityCache: ZIREntity[] = [];

    constructor() {
        this.defaultView = new ZIRSpite();

        this.sessionManager = new ZIRSessionManager(this.registerSession.bind(this), this.handleSpawn.bind(this), this.defaultView);
        this.eventScheduler = ZIREventScheduler.getInstance();

        if (this.IS_DEVELOPMENT) {
            this.consoleManager = new ZIRConsoleManager();
        }

        this.gameLoop();
    }

    /**
     * Return delta time from the
     * previous game tick
     */
    public getDT(): number {
        return this.dt;
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

    public getAllEntities() {
        const toReturn: ZIREntity[] = [];
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
            this.dt = (dt + pause)/1000;
            setTimeout(this.gameLoop, pause);
        });
    }

    /**
     * Triggers calculation of all game mechanics
     */
    private async tick() {
        ZIRTimer.start("tick");

        this.entityCache = this.getAllEntities();

        ZIRTimer.start("usernames");
        this.sendUsernames();
        ZIRTimer.stop("usernames");

        if (this.IS_DEVELOPMENT) {
            ZIRTimer.start("debug");
            this.sendDebugInfo();
            ZIRTimer.stop("debug");
        }

        ZIRTimer.start("physics");
        this.calculatePhysics();
        ZIRTimer.stop("physics");

        ZIRTimer.start("input");
        this.handleInput();
        ZIRTimer.stop("input");

        ZIRTimer.start("collision");
        this.checkCollision();
        ZIRTimer.stop("collision");

        ZIRTimer.start("events");
        this.eventScheduler.update(this.tickCounter);
        ZIRTimer.stop("events");

        ZIRTimer.start("packets");
        const shouldReset = this.tickCounter % 30 === 0;
        this.sendUpdate(shouldReset);
        ZIRTimer.stop("packets");

        ZIRTimer.start("console");
        this.consoleManager.updateClients();
        ZIRTimer.stop("console");

        this.entityCache = null;
        
        ZIRTimer.start("garbagecollect");
        this.collectGarbage();
        ZIRTimer.stop("garbagecollect");

        ZIRTimer.stop("tick");
    }

    private checkCollision() {
        for (const world in this.universe) {
            this.universe[world].runCollisionLogic();
        }
    }

    private collectGarbage() {
        for (const world in this.universe) {
            this.universe[world].collectGarbage();
        }
    }

    private calculatePhysics() {
        const entities = this.entityCache;
        for (const entity of entities) {
            entity.update(this);
            this.physicsEngine.applyPhysics(entity, this.getDT());
        }
    }

    private sendUpdate(reset: boolean = false) {
        for (const session of this.sessions) {
            const calculatedUpdates = [];
            const world = this.findWorldById(session.getWorldID());
            let entitiesToUpdate = world.getEntities();

            if (!reset) {
                entitiesToUpdate = entitiesToUpdate.filter((entity) => {
                    const e = entity.shouldUpdate();
                    return e;
                });
            } else {
                entitiesToUpdate = entitiesToUpdate.filter((entity) => {
                    return !entity.isDead();
                });
            }

            for (const entity of entitiesToUpdate) {
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

        const entities = this.entityCache;
        for (const e of entities) {
            e.setUpdated(true);
        }
    }

    private createUpdate(entity: ZIREntity) {
        
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

    private findWorldById(worldID: string): ZIRWorld {
        return this.universe[worldID];
    }

    private sendUsernames() {
        const usernames: string[] = [];
        for (const session of this.sessions) {
            usernames.push(session.getUsername());
            session.update();
        }
        this.sessionManager.broadcast("players", JSON.stringify(usernames));
    }

    /**
     * Emits a packet of debug info for the client
     * to render if debug rendering is enabled
     */
    private sendDebugInfo = (): void => {
        for (const session of this.sessions) {
            const debugMessages = [];
            //debugMessages.push("Controls: " + JSON.stringify(session.getInputs()));
            debugMessages.push("Server Tick Speed: " + this.getDT().toFixed(4));
            debugMessages.push("Current Session: " + session);
            debugMessages.push("Entities (" + this.entityCache.length + " total)");//: " + this.entityCache);
            session.setDebugMessages(debugMessages);
            this.sessionManager.sendToClient(session.getSocket(), "debug", debugMessages);
        }
    }
}
