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

export class ZIRClient extends ZIRClientBase {
    public playersOnline: string[];
    private serverComms: ZIRServerBase;
    private canvas: ZIRCanvasController;
    private entities: ZIREntityBase[];
    private input: ZIRInput;
    private username: string;
    private debugMessages: string[] = ["Not receiving debug message packets from server"];
    private player: ZIRPlayerData;
    private world: ZIRWorldData;

    constructor(name: string, renderer: ZIRCanvasController, comms: ZIRServerBase, input: ZIRInput) {
        super();
        this.serverComms = comms;
        this.entities = [];
        this.username = name;
        this.playersOnline = [];
        this.input = input;
        this.player = new ZIRPlayerData();
        this.world = new ZIRWorldData({ zones: [] });
        this.canvas = renderer;
        this.serverComms.setHandler('update', this.handleServerUpdate.bind(this));
        this.serverComms.setHandler('reset', this.handleReset.bind(this));
        this.serverComms.setHandler('message', this.handleMessage.bind(this));
        this.serverComms.setHandler('requestUsername', this.fetchUsername.bind(this));
        this.serverComms.setHandler('debug', this.handleDebugMessage.bind(this));
        this.serverComms.setHandler('updatePlayer', this.updatePlayer.bind(this));
        this.serverComms.setHandler('updateWorld', this.handleWorldUpdate.bind(this));
        this.input.setInputHandler(this.handleInput.bind(this));
        this.input.setPointInputHandler(this.handlePointInput.bind(this));
        this.serverComms.registerServerListeners();
    }

    private fetchUsername() {
        this.serverComms.sendInfoToServer('rename', this.username);
    }

    private handleMessage(message) {
        console.log("From Server: " + message);
    }

    private handleReset(data: IZIRResetResult) {
        this.entities = [];
        for (var entity of data.entities) {
            var newEntity = this.parseEntityResult(entity);
            this.entities.push(newEntity);
        }
        this.updateObjects();
    }

    private handleDebugMessage(data: string[]) {
        this.debugMessages = data;
    }

    private handleServerUpdate(data: IZIRUpdateResult) {
        for (var entity of data.updates) {
            var id = entity.id;
            switch (entity.type) {
                case 'update':
                    let newEntity = this.parseEntityResult(entity);
                    let index = this.getEntityIndexById(id);
                    if(index == -1){
                        this.entities.push(newEntity);
                    }else{
                        this.entities[index] = newEntity;
                    }
                    break;
                case 'delete':
                    if (this.getEntityById(id)) {
                        this.entities.splice(this.getEntityIndexById(id), 1);
                    }
                    break;
            }
        }
        this.playersOnline = this.serverComms.getPlayersOnline();
        this.updateObjects();
        this.canvas.render(this);
        this.setViewSize(this.canvas.getDimensions());
    }

    private handleWorldUpdate(data: IZIRWorldUpdate) {
        this.world = new ZIRWorldData(data);
    }


    private handleInput(keycode: string, state: boolean) {
        this.serverComms.sendInfoToServer("input", {
            keycode: keycode,
            state: state
        });
    }

    /**
     * @param renderOffset gets global coordinate of point instead of
     * screen coordinate when true
     */
    private handlePointInput(keycode: string, state: Vector, renderOffset: boolean=true) {
        if(renderOffset) {
            state = this.canvas.transformRenderToPlayer(state);
        }
        this.serverComms.sendInfoToServer("input", {
            keycode: keycode,
            state: state
        });
    }

    private parseEntityResult(result: IZIREntityResult) {
        var position: Vector = new Vector(result.x, result.y);
        var size: Vector = new Vector(result.xsize, result.ysize);
        var asset: IZIRAsset = ZIRAssetLoader.getAsset(result.asset);
        return new ZIREntityBase(result.id, position, size, asset);
    }

    private getEntityById(id: string) {
        for (let entity of this.entities) {
            if (entity.getEntityId() == id) {
                return entity;
            }
        }
    }

    private getEntityIndexById(id: string) {
        return this.entities.indexOf(this.getEntityById(id));
    }

    private updatePlayer(data) {
        this.player.setPlayerID(data.playerID);
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

    public getPlayerPosition() : Vector {
        var player: ZIREntityBase = this.getEntityById(this.player.getPlayerID());
        if (player) {
            return player.getPosition();
        }
        return(undefined);
    }

    public getWorldData() {
        return this.world.getWorldData();
    }
}