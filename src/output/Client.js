define(["require", "exports", "./baseObjects/ClientBase"], function (require, exports, ClientBase_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ZIRClient extends ClientBase_1.ZIRClientBase {
        getBackgroundImage() {
            //TODO get or store a background image
            return "";
        }
    }
    exports.ZIRClient = ZIRClient;
});
