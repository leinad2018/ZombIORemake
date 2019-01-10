define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ZIRClientBase {
        constructor() {
            this.objectsToUpdate = [];
        }
        registerUpdateHandler(objectToUpdate) {
            this.objectsToUpdate.push(objectToUpdate);
        }
        updateObjects() {
            this.objectsToUpdate.forEach((object) => {
                object.onServerUpdate();
            });
        }
    }
    exports.ZIRClientBase = ZIRClientBase;
});
