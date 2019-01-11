import { ZIRClientBase } from "./baseObjects/ClientBase";
import { ZIRAssetLoader } from "./AssetLoader";

export class ZIRClient extends ZIRClientBase{
    public getBackgroundImage(){
        return ZIRAssetLoader.getAsset("grass");
    }
}