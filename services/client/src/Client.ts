import { ZIRClientBase } from "./baseObjects/ClientBase";
import { ZIRAssetLoader } from "./AssetLoader";
import { ZIREntityBase } from "./baseObjects/EntityBase";
import { Vector } from "./utilityObjects/Math";
import { IZIRAsset } from "./globalInterfaces/RenderingInterfaces";
import { IZIRResetResult, IZIRUpdateResult, IZIREntityResult, IZIRWorldUpdate } from "./globalInterfaces/IServerUpdate";
import { ZIRInput } from "./Input";
import { ZIRPlayerData } from "./PlayerData";
import { ZIRWorldData } from "./WorldData";
import { ZIRCanvasController } from "./CanvasController";
import { ZIRServerBase } from "./baseObjects/ServerBase";
import { ZIRMenuController } from "./MenuController";

export class ZIRClient extends ZIRClientBase {
    public playersOnline: string[];
    private serverComms: ZIRServerBase;
    private menuController: ZIRMenuController;
    private canvas: ZIRCanvasController;
    private entities: ZIREntityBase[];
    private input: ZIRInput;
    private username: string;
    private debugMessages: string[] = ["Not receiving debug message packets from server"];
    private player: ZIRPlayerData;
    private world: ZIRWorldData;
    private heartAsset: IZIRAsset = ZIRAssetLoader.getAsset("health[30]");
    private running: boolean;
    private updating: boolean;
    private inputBuffer: any[];
    private activePings: {[id: string]: number};
    private lastPing: number;
    private lastRender: number;
    private chat: string[];

    constructor(name: string, renderer: ZIRCanvasController, comms: ZIRServerBase, input: ZIRInput, menus: ZIRMenuController) {
        super();
        this.activePings = {};
        this.serverComms = comms;
        this.menuController = menus;
        this.entities = [];
        this.username = name;
        this.playersOnline = [];
        this.input = input;
        this.player = new ZIRPlayerData();
        this.world = new ZIRWorldData({ zones: [] });
        this.running = false;
        this.updating = false;
        this.inputBuffer = [];
        this.chat = [];
        this.canvas = renderer;
        this.canvas.addHudAsset("health", this.heartAsset);
        this.canvas.createTerrainCache(this.world.getWorldData());
        this.serverComms.setHandler("update", this.handleServerUpdate.bind(this));
        this.serverComms.setHandler("reset", this.handleReset.bind(this));
        this.serverComms.setHandler("message", this.handleMessage.bind(this));
        this.serverComms.setHandler("requestRename", this.fetchUsername.bind(this));
        this.serverComms.setHandler("debug", this.handleDebugMessage.bind(this));
        this.serverComms.setHandler("updateFocus", this.updateFocus.bind(this));
        this.serverComms.setHandler("updateWorld", this.handleWorldUpdate.bind(this));
        this.serverComms.setHandler("requestRespawn", this.handleRespawn.bind(this));
        this.serverComms.setHandler("ping", this.handlePingResponse.bind(this));
        this.serverComms.setHandler("chat", this.handleChatFromServer.bind(this));
        this.input.setInputHandler(this.handleInput.bind(this));
        this.input.setPointInputHandler(this.handlePointInput.bind(this));
        this.input.setChatHandler(this.sendChatToServer.bind(this));
        this.serverComms.registerServerListeners();
        this.runRenderingLoop();
        setInterval(this.requestPing.bind(this), 1000);
    }

    public isDebugMode(): boolean {
        return this.input.getDebug();
    }

    public isChatting(): boolean {
        return this.input.getChatting();
    }

    public getCurrentChatMessages(): string[] {
        return this.chat;
    }

    public shouldRenderHitbox(): boolean {
        return this.input.getRenderHitbox();
    }

    public setLastRender(dt: number) {
        this.lastRender = dt;
    }

    public getTextInputString(): string {
        return this.input.getTextInputString();
    }

    private runRenderingLoop() {
        if (this.running) {
            try {
                this.canvas.render(this);
            } catch (e) {
                console.log(e);
            }
        }
        requestAnimationFrame(this.runRenderingLoop.bind(this));
    }

    private sendChatToServer(message: string) {
        console.log("sent " + message);
        this.serverComms.sendInfoToServer("chat", {content: message})
    }

    private flushInputBuffer(){
        let toSend = [];
        for(const input in this.inputBuffer){
            toSend.push({
                keycode: input,
                state: this.inputBuffer[input]
            });
        }
        if(toSend.length > 0){
            this.serverComms.sendInfoToServer("input", toSend);
            this.inputBuffer = [];
        }
    }

    private fetchUsername() {
        this.serverComms.sendInfoToServer("rename", this.username);
    }

    private handleMessage(message) {
        console.log("From Server: " + message);
    }

    private handleRespawn() {
        this.menuController.showRespawnMenu(this.sendRespawn.bind(this));
    }

    private handleChatFromServer(message) {
        if(this.chat.length > 19) {
            this.chat = this.chat.slice(1);
        }
        const messageString = "[" + message.sender + "] " + message.content;
        this.chat.push(messageString);
    }

    private requestPing() {
        const uniqueKey = "" + Math.random(); // Help ensure integrity against multiple requests
        this.activePings[uniqueKey] = new Date().getTime();
        this.serverComms.sendInfoToServer("ping", uniqueKey);
    }

    private handlePingResponse(data: string) {
        const sent = this.activePings[data];
        const received = new Date().getTime();
        this.lastPing = (received - sent)/2; // Compensate for two-way traffic
        delete this.activePings[data];
    }

    private sendRespawn() {
        this.serverComms.sendInfoToServer("respawn", "");
        this.menuController.hideRespawnMenu();
    }

    private handleReset(data: IZIRResetResult) {
        if (!this.updating) {
            this.updating = true;
            this.entities = [];
            for (const entity of data.entities) {
                const newEntity = this.parseEntityResult(entity);
                this.entities.push(newEntity);
            }
            this.updateObjects();
            this.flushInputBuffer();
            this.updating = false;
        }
    }

    private handleDebugMessage(data: string[]) {
        this.debugMessages = data;
        if(this.lastPing === 0) {
            data.push("Ping: <0.5 ms")
        } else {
            data.push("Ping: " + this.lastPing + " ms")
        }

        if(this.lastRender === 0) {
            data.push("Render: <1 ms");
        } else {
            data.push("Render: " + this.lastRender + " ms");
        }
    }

    private handleServerUpdate(data: IZIRUpdateResult) {
        if (!this.updating) {
            this.updating = true;
            for (const entity of data.updates) {
                const id = entity.id;
                switch (entity.type) {
                    case "update":
                        const newEntity = this.parseEntityResult(entity);
                        const index = this.getEntityIndexById(id);
                        if (index === -1) {
                            this.entities.push(newEntity);
                        } else {
                            this.entities[index].updateEntity(newEntity);
                        }
                        break;
                    case "delete":
                        if (this.getEntityById(id)) {
                            this.entities.splice(this.getEntityIndexById(id), 1);
                        }
                        break;
                }
            }
            this.playersOnline = this.serverComms.getPlayersOnline();
            this.updateObjects();
            this.flushInputBuffer();
            this.running = true;
            this.setViewSize(this.canvas.getDimensions());
            this.updating = false;
        }
    }

    private handleWorldUpdate(data: IZIRWorldUpdate) {
        this.world = new ZIRWorldData(data);
        this.canvas.createTerrainCache(this.world.getWorldData());
    }


    private handleInput(keycode: string, state: boolean) {
        this.handleClientInput(keycode, state);
        this.inputBuffer[keycode] = state;
    }

    private handleClientInput(keycode: string, state: boolean) {
        if (keycode === "openInventory" && state === true) {
            this.menuController.toggleMenu("inventory", this.player.getInventory());
        }
        if (keycode === "buildMenu" && state === true) {
            this.menuController.toggleMenu("build", () => { });
        }
    }

    /**
     * @param renderOffset gets global coordinate of point instead of
     * screen coordinate when true
     */
    private handlePointInput(keycode: string, state: Vector, renderOffset: boolean = true) {
        if (renderOffset) {
            state = this.canvas.transformRenderToPlayer(state);
        }
        this.inputBuffer[keycode] = state;
    }

    private parseEntityResult(result: IZIREntityResult) {
        const position: Vector = new Vector(result.x, result.y);
        const size: Vector = new Vector(result.xsize, result.ysize);
        const asset: IZIRAsset = ZIRAssetLoader.getAsset(result.asset);
        const name: string = result.name;
        return new ZIREntityBase(result.id, position, size, asset, name);
    }

    private getEntityById(id: string) {
        for (const entity of this.entities) {
            if (entity.getEntityId() === id) {
                return entity;
            }
        }
    }

    private getEntityIndexById(id: string) {
        return this.entities.indexOf(this.getEntityById(id));
    }

    private updateFocus(data) {
        this.player.setPlayerID(data.playerID);
        this.player.setHealth(data.health);
        this.player.setName(data.name);
        this.player.setInventory(data.inventory);
    }

    public getPlayersOnline() {
        return this.playersOnline;
    }

    public getDebugMessages() {
        return this.debugMessages;
    }

    public getBackgroundImage() {
        return ZIRAssetLoader.getAsset("grass");
    }

    public getEntitiesToRender() {
        return this.entities;
    }

    public setUsername(name: string) {
        this.username = name;
    }

    public getPlayerPosition(): Vector {
        const player: ZIREntityBase = this.getEntityById(this.player.getPlayerID());
        if (player) {
            return player.getPosition();
        }
        return (undefined);
    }

    public getPlayerHealth(): number {
        return (this.player.getHealth());
    }

    public getWorldData() {
        return this.world.getWorldData();
    }
}
