import { ZIRCanvasController } from "./CanvasController";
import { ZIRTestClient } from "./unitTesting/TestClient";
import { ZIRAssetLoader } from "./AssetLoader";
import { IZIRClient } from "./globalInterfaces/MainInterfaces";
import { ZIRServerCommunications } from "./ServerComms";
import { ZIRClient } from "./Client";
declare function io();

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
    ZIRAssetLoader.loadAsset("grass", "../static/assets/grass.png");
    ZIRAssetLoader.loadAsset("circle", "../static/assets/circle.png");
}

function runAfterLoaded() {
    var serverLink: ZIRServerCommunications = new ZIRServerCommunications();
    var client: IZIRClient = new ZIRClient(serverLink);
    var controller: ZIRCanvasController = new ZIRCanvasController(mainCanvas as HTMLCanvasElement, client);
    console.log("Ran");
}
