import { ZIRCanvasController } from "CanvasController";
import { ZIRTestClient } from "./unitTesting/TestClient";
import { ZIRAssetLoader } from "./AssetLoader";
var mainCanvas = document.getElementById("mainCanvas");

loadAssets();
var loaded = false;
var id = setInterval(()=>{
    loaded = ZIRAssetLoader.doneLoading();
    console.log("Loading...");
}, 100);

while(!loaded){

}

clearInterval(id);

var client: IZIRClient = new ZIRTestClient();
var controller: ZIRCanvasController = new ZIRCanvasController(mainCanvas as HTMLCanvasElement, client);
(client as ZIRTestClient).runTest();
console.log("Test Ran");

function loadAssets() {
    ZIRAssetLoader.loadAsset("grass", "./assets/grass.png");
}