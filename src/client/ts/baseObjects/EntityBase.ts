import { Point } from "../globalInterfaces/UtilityInterfaces";
import { IZIRAsset, IZIRRenderable } from "../globalInterfaces/RenderingInterfaces";

export class ZIREntityBase implements IZIRRenderable {
    protected id: string;
    protected position: Point;
    protected asset: IZIRAsset;

    constructor(id: string, position: Point, asset: IZIRAsset){
        this.id = id;
        this.position = position;
        this.asset = asset;
    }

    public getEntityId() {
        return this.id;
    }

    public getPosition() {
        return this.position;
    }

    public getImageToRender() {
        return this.asset;
    }
}