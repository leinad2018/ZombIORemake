import { ZIRCanvasController } from "./CanvasController";
import { ZIRAssetLoader } from "./AssetLoader";
import { IZIRServerCommunications } from "./globalInterfaces/MainInterfaces";
import { ZIRServerCommunications } from "./ServerComms";
import { ZIRClient } from "./Client";
import { ZIRInput } from "./Input";
import { ZIRClientBase } from "./baseObjects/ClientBase";

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

function playGame(){
    var nameField = document.getElementById('name') as HTMLInputElement;
    playerName = nameField.value;
    document.getElementById("startingScreen").hidden = true;
    (async () => {
        console.log("Loading...");
        waitForLoad();
    })();
}

function loadAssets() {
    ZIRAssetLoader.loadAsset("grass", "../static/assets/grass.png");
    ZIRAssetLoader.loadAsset("circle", "../static/assets/circle.png");
}

function runAfterLoaded() {
    console.log("Finished Loading");
    mainCanvas.hidden = false;
    var serverLink: IZIRServerCommunications = new ZIRServerCommunications();
    var input: ZIRInput = new ZIRInput();
    var client: ZIRClientBase = new ZIRClient(serverLink, input, playerName);
    var controller: ZIRCanvasController = new ZIRCanvasController(mainCanvas as HTMLCanvasElement, client);
    console.log("Started Game");
}
var mainCanvas = document.getElementById("mainCanvas");
console.log("step1");
loadAssets();

var playButton = document.getElementById("play") as HTMLButtonElement;
playButton.addEventListener("click", playGame);

var playerName = "";


