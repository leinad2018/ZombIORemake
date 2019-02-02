import { ZIRAssetLoader } from "./AssetLoader";
import { ZIRClient } from "./Client";
import { ZIRClientBase } from "./baseObjects/ClientBase";
import { ZIRCanvasController } from "./CanvasController";
import { ZIRServerCommunications } from "./ServerComms";
import { ZIRInput } from "./Input";
import { ZIRMenuController } from "./MenuController";

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

function playGame() {
    var nameField = document.getElementById('name') as HTMLInputElement;
    playerName = nameField.value;
    document.getElementById("startingScreen").hidden = true;
    (async () => {
        console.log("Loading...");
        waitForLoad();
    })();
}

function loadAssets() {
    ZIRAssetLoader.loadAsset("enemy", "../static/assets/enemy.png");
    ZIRAssetLoader.loadAsset("grass", "../static/assets/grass.png");
    ZIRAssetLoader.loadAsset("snow", "../static/assets/snow.png");
    ZIRAssetLoader.loadAsset("circle", "../static/assets/circle.png");
    ZIRAssetLoader.loadAsset("player", "../static/assets/player.png");
    ZIRAssetLoader.loadAsset("spite", "../static/assets/spite.jpg");
    ZIRAssetLoader.loadAsset("rock", "../static/assets/rock.png");
    ZIRAssetLoader.loadAsset("boomerang", "../static/assets/boomerang.png");
}

function runAfterLoaded() {
    console.log("Finished Loading");
    mainCanvas.hidden = false;
    let renderer = new ZIRCanvasController(mainCanvas as HTMLCanvasElement);
    let serverComms = new ZIRServerCommunications();
    let keyboardInput = new ZIRInput();
    let mainDiv = document.getElementById('baseDiv');
    let menuController = new ZIRMenuController(mainDiv as HTMLDivElement);
    var client: ZIRClientBase = new ZIRClient(playerName, renderer, serverComms, keyboardInput, menuController);
    console.log("Started Game");
}
var mainCanvas = document.getElementById("mainCanvas");
console.log("step1");
loadAssets();

var loginForm = document.getElementById("loginForm") as HTMLFormElement;
loginForm.addEventListener("submit", playGame);

var playerName = "";


