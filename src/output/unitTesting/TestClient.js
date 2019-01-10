define(["require", "exports", "../baseObjects/ClientBase"], function (require, exports, ClientBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ZIRTestClient extends ClientBase_1.ZIRClientBase {
        runTest() {
            this.updateObjects();
        }
        getBackgroundImage() {
            return "../assets/grass.png";
        }
    }
    exports.ZIRTestClient = ZIRTestClient;
});
