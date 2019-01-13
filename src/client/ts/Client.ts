import { ZIRClientBase } from "./baseObjects/ClientBase";
import { ZIRAssetLoader } from "./AssetLoader";
import { ZIRServerCommunications } from "./ServerComms";

export class ZIRClient extends ZIRClientBase {
    private serverComms: ZIRServerCommunications;
    public playersOnline: string[];

    constructor(comms: ZIRServerCommunications) {
        super();
        this.serverComms = comms;
        this.setUpdateHandlers();
    }

    private setUpdateHandlers() {
        this.serverComms.setUpdateHandler(() => {
            this.onUpdate();
        });
        this.serverComms.setUsernameHandler(() => {
            this.fetchUsername();
        });
    }

    private onUpdate() {
        this.playersOnline = this.serverComms.playersOnline;
        this.updateObjects();
    }

    private fetchUsername() {
        var message = prompt("Enter some text");
        this.serverComms.sendMessageToServer(message);
    }

    public getPlayersOnline() {
        return this.playersOnline;
    }

    public getBackgroundImage() {
        return ZIRAssetLoader.getAsset("grass");
    }
}