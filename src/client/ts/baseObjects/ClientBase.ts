import { IZIRServerUpdate } from "../globalInterfaces/IServerUpdate";
import { Vector } from "../utilityObjects/Math";
import { IZIRRenderable, IZIRAsset } from "../globalInterfaces/RenderingInterfaces";

export abstract class ZIRClientBase {
    private objectsToUpdate: IZIRServerUpdate[];
    protected sizeVector: Vector;

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

    public setViewSize(size : Vector) {
        this.sizeVector = size;
    }

    protected updateObjects() {
        this.objectsToUpdate.forEach((object) => {
            object.onServerUpdate();
        });
    }

    abstract isDebugMode() : boolean;

    abstract getPlayersOnline();

    abstract getDebugMessages();

    abstract getBackgroundImage(): IZIRAsset;

    abstract getPlayerPosition(): Vector;

    abstract getPlayerHealth(): number;

    abstract getWorldData(): IZIRRenderable[];
}