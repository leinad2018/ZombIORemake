import { ZIRClientBase } from "./baseObjects/ClientBase";
import { ZIRAssetLoader } from "./AssetLoader";
import { IZIRServerCommunications, IZIREntity } from "./globalInterfaces/MainInterfaces";
import { ZIREntityBase } from "./baseObjects/EntityBase";
import { Point } from "./globalInterfaces/UtilityInterfaces";
import { IZIRAsset } from "./globalInterfaces/RenderingInterfaces";
import { IZIRResetResult, IZIRUpdateResult, IZIREntityResult } from "./globalInterfaces/IServerUpdate";
import { ZIRInput } from "./Input";

export class ZIRClient extends ZIRClientBase {
    public playersOnline: string[];
    private serverComms: IZIRServerCommunications;
    private entities: IZIREntity[];
    private input: ZIRInput;
    private username: string;
    private debugMessages: string[] = ["hello world"];

    constructor(comms: IZIRServerCommunications, input: ZIRInput, name: string) {
        super();
        this.serverComms = comms;
        this.input = input;
        this.entities = [];
        this.username = name;
        this.playersOnline = [];
        this.setUpdateHandler();
        this.setResetHandler();
        this.setMessageHandler();
        this.setUsernameHandler();
        this.setInputHandler();
        this.serverComms.registerServerListeners();
        this.setDebugMessageHandler();
    }

    private setInputHandler() {
        this.input.setInputHandler(this.handleInput.bind(this));
    }

    private setUpdateHandler() {
        this.serverComms.setHandler('update', this.handleServerUpdate.bind(this));
    }

    private setMessageHandler() {
        this.serverComms.setHandler('message', this.handleMessage.bind(this));
    }

    private setResetHandler() {
        this.serverComms.setHandler('reset', this.handleReset.bind(this));
    }

    private setUsernameHandler() {
        this.serverComms.setHandler('requestUsername', this.fetchUsername.bind(this));
    }

    private setDebugMessageHandler() {
        this.serverComms.setHandler('debug', this.handleDebugMessage.bind(this));
    }

    private fetchUsername() {
        this.serverComms.sendInfoToServer('rename', this.username);
    }

    private handleMessage(message) {
        console.log("From Server: " + message);
    }

    private handleReset(data: IZIRResetResult) {
        this.entities = [];
        for (var enitity of data.entities) {
            var newEntity = this.parseEntityResult(enitity);
            this.entities.push(newEntity);
        }
        this.updateObjects();
    }

    private handleDebugMessage(data: string[]) {
        console.log("debug message handling is called");
        this.debugMessages = data;
    }

    private handleServerUpdate(data: IZIRUpdateResult) {
        for (var enitity of data.updates) {
            var id = enitity.id;
            for (var i = 0; i < this.entities.length; i++) {
                switch (enitity.type) {
                    case "update":
                        var oldEntity = this.entities[i];
                        if (oldEntity.getEntityId() == id) {
                            var newEntity = this.parseEntityResult(enitity);
                            this.entities[i] = newEntity;
                        }
                        break;
                    case "delete":
                        this.entities.splice(i, 1);
                        break;
                    case "create":
                        var newEntity = this.parseEntityResult(enitity);
                        this.entities.push(newEntity);
                        break;

                }
            }
        }
        this.playersOnline = this.serverComms.getPlayersOnline();
        this.updateObjects();
    }

    private handleInput(keycode: string, state: boolean) {
        this.serverComms.sendInfoToServer("input", {
            keycode: keycode,
            state: state
        });
        console.log(keycode + ": " + state);
    }

    private parseEntityResult(result: IZIREntityResult) {
        var position: Point = {
            x: result.x,
            y: result.y
        }
        var asset: IZIRAsset = ZIRAssetLoader.getAsset(result.asset);
        return new ZIREntityBase(result.id, position, asset);
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
}