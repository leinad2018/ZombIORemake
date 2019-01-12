import { IZIRClient } from "../globalInterfaces/MainInterfaces";
import { IZIRServerUpdate } from "../globalInterfaces/IServerUpdate";
import { Point } from "../globalInterfaces/UtilityInterfaces";
import { IZIRRenderable, IZIRAsset } from "../globalInterfaces/RenderingInterfaces";

export abstract class ZIRClientBase implements IZIRClient {
    private objectsToUpdate: IZIRServerUpdate[];
    protected sizeVector: Point;

    constructor() {
        this.objectsToUpdate = [];
    }

    public registerUpdateHandler(objectToUpdate: IZIRServerUpdate) {
        this.objectsToUpdate.push(objectToUpdate);
    }

    public getEntitiesToRender() {
        var toReturn: IZIRRenderable[] = [];
        return toReturn;
    }

    public setViewSize(width: number, height: number) {
        this.sizeVector = {
            x: width,
            y: height
        }
    }

    protected updateObjects() {
        this.objectsToUpdate.forEach((object) => {
            object.onServerUpdate();
        });
    }

    abstract getBackgroundImage(): IZIRAsset;
}