import { ZIRSessionManager, Session } from "./SessionManager";
import { ZIREntity } from "../baseObjects/EntityBase";
import { ZIRPhysicsEngine } from "./PhysicsEngine";
import { ZIRWorld } from "../baseObjects/World";
import { ZIRLoadTestWorld } from "../worlds/LoadTestWorld";
import { ZIRPlayer } from "../entities/mobs/Player";
import { IZIRResetResult, IZIRUpdateResult } from "../globalInterfaces/IServerUpdate";
import { ZIRSpite } from "../entities/Spite";
import { ZIREventScheduler } from "./EventScheduler";
import { ZIRConsoleManager } from "./ConsoleManager";
import { ZIRTimer } from "../utilityObjects/Timer";
import { EntityQuadtree } from "../utilityObjects/DataStructures";
import { ZIRChatManager} from "./ChatManager";
import { ZIRCommandManager } from "./CommandManager";

export class ZIRServerEngine {
    // Constants
    public readonly IS_DEVELOPMENT = true;
    private readonly GAMELOOP_OVERHEAD: number = 3; // Compensate for delay in game loop
    private readonly TPS: number = 30;

    // Process Managers
    private sessionManager: ZIRSessionManager;
    private chatManager: ZIRChatManager;
    private commandManager: ZIRCommandManager;
    private consoleManager: ZIRConsoleManager;
    private physicsEngine: ZIRPhysicsEngine = new ZIRPhysicsEngine();
    private eventScheduler: ZIREventScheduler;

    // Tick management
    private tickCounter: number = 0;
    private dt: number = 0;

    // TODO: Make this world-based
    private defaultView: ZIREntity;

    // Global data structures
    private sessions: Session[] = [];
    private universe: ZIRWorld[] = [];
    private entityCache: ZIREntity[] = [];

    constructor() {
        this.defaultView = new ZIRSpite();

        this.sessionManager = new ZIRSessionManager(this.registerSession.bind(this), this.handleSpawn.bind(this), this.defaultView);
        this.eventScheduler = ZIREventScheduler.getInstance();
        this.commandManager = new ZIRCommandManager(this);
        this.chatManager = new ZIRChatManager(this.commandManager);
        this.chatManager.registerAgent(this.commandManager);

        if (this.IS_DEVELOPMENT) {
            this.consoleManager = new ZIRConsoleManager(this);
            this.chatManager.registerAgent(this.consoleManager);
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

    public getQuadtree(): EntityQuadtree {
        for(let world in this.universe) {
            return this.universe[world].getQuadtree();
        }
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
        this.chatManager.registerAgent(session);

        let world = this.findWorldById(worldID);
        if (!world) {
            const newWorld = new ZIRLoadTestWorld(worldID);
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
                this.chatManager.removeAgent(session);
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

    public getAllPlayers(): ZIRPlayer[] {
        const players = [];
        for(const session of this.sessions) {
            const player = session.getPlayer();
            if(player) {
                players.push(session.getPlayer());
            }
        }
        return players;
    }

    /**
     * Regulates game ticks and other
     * core engine functions
     */
    private gameLoop = (): void => {
        ZIRTimer.start("gameLoop");
        const t = Date.now();

        this.tick().then(() => {
            this.tickCounter++;

            const dt = Date.now() - t;
            const pause = Math.max((1000 / this.TPS) - dt - this.GAMELOOP_OVERHEAD, 0);
            this.dt = (dt + pause)/1000;
            setTimeout(() => {
                ZIRTimer.stop("gameLoop");
                this.gameLoop()}
                ,pause);
        });
    }

    /**
     * Triggers calculation of all game mechanics
     */
    private async tick() {
        ZIRTimer.start("tick", "gameLoop");

        this.entityCache = this.getAllEntities();
        ZIRTimer.count(this.entityCache.length, "entities", "count");

        ZIRTimer.start("usernames", "tick");
        this.sendUsernames();
        ZIRTimer.stop("usernames");

        if (this.IS_DEVELOPMENT) {
            ZIRTimer.start("debug", "tick");
            this.sendDebugInfo();
            ZIRTimer.stop("debug");
        }

        ZIRTimer.start("physics", "tick");
        this.calculatePhysics();
        ZIRTimer.stop("physics");

        ZIRTimer.start("input", "tick");
        this.handleInput();
        this.chatManager.routeMessages();
        ZIRTimer.stop("input");

        ZIRTimer.start("collision", "tick");
        this.checkCollision();
        ZIRTimer.stop("collision");

        ZIRTimer.start("events", "tick");
        this.eventScheduler.update(this.tickCounter);
        ZIRTimer.stop("events");

        ZIRTimer.start("packets", "tick");
        const shouldReset = this.tickCounter % 30 === 0;
        this.sendUpdate(shouldReset);
        ZIRTimer.stop("packets");

        ZIRTimer.start("console", "tick");
        this.consoleManager.updateClients();
        ZIRTimer.stop("console");

        this.entityCache = null;
        
        ZIRTimer.start("garbagecollect", "tick");
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
            ZIRTimer.start("entityUpdates", "physics");
            entity.update(this);
            ZIRTimer.stop("entityUpdates");
            ZIRTimer.start("applyPhysics", "physics");
            this.physicsEngine.applyPhysics(entity, this.getDT());
            ZIRTimer.stop("applyPhysics");
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

    // TODO: Change to leaderboard
    private sendUsernames() {
        const usernames: string[] = [];
        for (const session of this.sessions) {
            usernames.push(session.getUsername());
            session.update();
        }
        // this.sessionManager.broadcast("players", JSON.stringify(usernames));
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
            debugMessages.push("Quadtree Address: " + session.getPlayer().getCollisionQuadtreeAddress());
            session.setDebugMessages(debugMessages);
            this.sessionManager.sendToClient(session.getSocket(), "debug", debugMessages);
        }
    }
}
