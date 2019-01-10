import { ZIRCanvasController } from "CanvasController";
import { ZIRTestClient } from "./unitTesting/TestClient";
var mainCanvas = document.getElementById("mainCanvas");
var client: IZIRClient = new ZIRTestClient();
var controller: ZIRCanvasController = new ZIRCanvasController(mainCanvas as HTMLCanvasElement, client);
(client as ZIRTestClient).runTest();
console.log("Test Ran");