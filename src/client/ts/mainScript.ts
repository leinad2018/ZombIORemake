import { ZIRCanvasController } from "CanvasController";
import { ZIRTestClient } from "./unitTesting/TestClient";
import { ZIRAssetLoader } from "./AssetLoader";
var mainCanvas = document.getElementById("mainCanvas");
console.log("step1");
loadAssets();

var waitForLoad = () => new Promise(() => {
    var check = () => {
        console.log("waiting");
        if (ZIRAssetLoader.doneLoading()) {
            runAfterLoaded();
        } else {
            setTimeout(check, 100);
        }
    }
    setTimeout(check, 100);
});

(async () => {
    console.log("Loading...");
    waitForLoad();
})();

function loadAssets() {
    ZIRAssetLoader.loadAsset("grass", "../assets/grass.png");
}

function runAfterLoaded() {
    var client: IZIRClient = new ZIRTestClient();
    var controller: ZIRCanvasController = new ZIRCanvasController(mainCanvas as HTMLCanvasElement, client);
    (client as ZIRTestClient).runTest();
    console.log("Test Ran");
}
