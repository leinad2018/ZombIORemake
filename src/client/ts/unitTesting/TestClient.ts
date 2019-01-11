import { ZIRClientBase } from "../baseObjects/ClientBase";
import { ZIRAssetLoader } from "../AssetLoader";

export class ZIRTestClient extends ZIRClientBase{
    public runTest(){
        this.updateObjects();
    }

    public getBackgroundImage(){
        return ZIRAssetLoader.getAsset("grass");
    }

}