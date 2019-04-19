import { IZIRServerUpdate } from "../globalInterfaces/IServerUpdate";
import { Vector } from "../utilityObjects/Math";
import { IZIRAsset, IZIRRenderable } from "../globalInterfaces/RenderingInterfaces";

export abstract class ZIRClientBase {
    protected sizeVector: Vector;
    private objectsToUpdate: IZIRServerUpdate[];

    constructor() {
        this.objectsToUpdate = [];
    }

    public abstract isDebugMode(): boolean;

    public abstract shouldRenderHitbox(): boolean;

    public abstract getPlayersOnline();

    public abstract getDebugMessages();
    
    public abstract getBackgroundImage(): IZIRAsset;

    public abstract getPlayerPosition(): Vector;

    public abstract getPlayerHealth(): number;

    public abstract getWorldData(): IZIRRenderable[];

    public registerUpdateHandler(objectToUpdate: IZIRServerUpdate) {
        this.objectsToUpdate.push(objectToUpdate);
    }

    public getEntitiesToRender() {
        return [];
    }

    public abstract setLastRender(dt: number);

    public setViewSize(size: Vector) {
        this.sizeVector = size;
    }

    protected updateObjects() {
        this.objectsToUpdate.forEach((object) => {
            object.onServerUpdate();
        });
    }

}
