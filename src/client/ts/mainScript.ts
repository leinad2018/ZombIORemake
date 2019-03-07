import { ZIRAssetLoader } from "./AssetLoader";
import { ZIRClient } from "./Client";
import { ZIRClientBase } from "./baseObjects/ClientBase";
import { ZIRCanvasController } from "./CanvasController";
import { ZIRServerCommunications } from "./ServerComms";
import { ZIRInput } from "./Input";
import { ZIRMenuController } from "./MenuController";

const waitForLoad = () => new Promise(() => {
    const check = () => {
        console.log("waiting");
        if (ZIRAssetLoader.doneLoading()) {
            runAfterLoaded();
        } else {
            setTimeout(check, 100);
        }
    };
    setTimeout(check, 100);
});

function playGame() {
    const nameField = document.getElementById("name") as HTMLInputElement;
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
    ZIRAssetLoader.loadAsset("health", ["../static/assets/health.png", "../static/assets/rock.png"]);
}

function runAfterLoaded() {
    console.log("Finished Loading");
    mainCanvas.hidden = false;
    const renderer = new ZIRCanvasController(mainCanvas as HTMLCanvasElement);
    const serverComms = new ZIRServerCommunications();
    const keyboardInput = new ZIRInput();
    const mainDiv = document.getElementById("baseDiv");
    const menuController = new ZIRMenuController(mainDiv as HTMLDivElement);
    const client: ZIRClientBase = new ZIRClient(playerName, renderer, serverComms, keyboardInput, menuController);
    console.log("Started Game");
}
const mainCanvas = document.getElementById("mainCanvas");
console.log("step1");
loadAssets();

const loginForm = document.getElementById("loginForm") as HTMLFormElement;
loginForm.addEventListener("submit", playGame);

let playerName = "";


