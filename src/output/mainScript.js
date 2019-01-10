define(["require", "exports", "CanvasController", "./unitTesting/TestClient"], function (require, exports, CanvasController_1, TestClient_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var mainCanvas = document.getElementById("mainCanvas");
    var client = new TestClient_1.ZIRTestClient();
    var controller = new CanvasController_1.ZIRCanvasController(mainCanvas, client);
    client.runTest();
    console.log("Test Ran");
});
