import { ZIRCanvasController } from "./CanvasController";
import { ZIRAssetLoader } from "./AssetLoader";
import { IZIRClient, IZIRServerCommunications } from "./globalInterfaces/MainInterfaces";
import { ZIRServerCommunications } from "./ServerComms";
import { ZIRClient } from "./Client";
import { TestServer } from "./unitTesting/TestServer";
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
    var serverLink: IZIRServerCommunications = new ZIRServerCommunications();
    var client: IZIRClient = new ZIRClient(serverLink);
    var controller: ZIRCanvasController = new ZIRCanvasController(mainCanvas as HTMLCanvasElement, client);
    console.log("Constructed Objects");
}
