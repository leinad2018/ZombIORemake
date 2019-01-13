import { ZIRClientBase } from "./baseObjects/ClientBase";
import { ZIRAssetLoader } from "./AssetLoader";
import { ZIRServerCommunications } from "./ServerComms";

export class ZIRClient extends ZIRClientBase {
    private serverComms: ZIRServerCommunications;

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
        this.updateObjects();
    }

    private fetchUsername() {
        var message = prompt("Enter some text");
        this.serverComms.sendMessageToServer(message);
    }

    public getBackgroundImage() {
        return ZIRAssetLoader.getAsset("grass");
    }
}