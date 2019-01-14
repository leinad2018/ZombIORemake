import { ZIRServerBase } from "../baseObjects/ServerBase";
import { IZIRResetResult, IZIRUpdateResult } from "../globalInterfaces/IServerUpdate";

export class TestServer extends ZIRServerBase {
    public sendInfoToServer(type: string, message: string) {
        console.log(type + ": " + message);
    }

    public runTests() {
        this.resetHandler(this.getTestData());
        this.updateHandler(this.getUpdateData());
    }

    public getPlayersOnline(){
        return [];
    }

    private getTestData(): IZIRResetResult {
        return {
            entities: [
                {
                    id: 0,
                    asset: "circle",
                    x: 10,
                    y: 100
                },
                {
                    id: 1,
                    asset: "circle",
                    x: 100,
                    y: 500
                }
            ]
        }
    }

    private getUpdateData() {
        return {
            updates: [
                {
                    id: 0,
                    type: "delete"
                },
                {
                    id: 1,
                    type: "update",
                    asset: "circle",
                    x: 200,
                    y: 300
                }
            ]
        }
    }
}