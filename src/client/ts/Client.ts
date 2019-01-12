import { ZIRClientBase } from "./baseObjects/ClientBase";
import { ZIRAssetLoader } from "./AssetLoader";
import { ZIRServerCommunications } from "./ServerComms";

export class ZIRClient extends ZIRClientBase {
    private serverComms: ZIRServerCommunications;

    constructor(comms: ZIRServerCommunications) {
        super();
        this.serverComms = comms;
        this.setUpdateHandler();
    }

    private setUpdateHandler() {
        this.serverComms.setUpdateHandler(() => {
            return this.handleServerPing.bind(this);
        });
    }

    private handleServerPing() {
        this.updateObjects();
        var message = prompt("Enter some text");
        this.serverComms.sendMessageToServer(message);
    }

    public getBackgroundImage() {
        return ZIRAssetLoader.getAsset("grass");
    }
}