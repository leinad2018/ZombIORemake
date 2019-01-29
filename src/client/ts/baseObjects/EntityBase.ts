import { Vector } from "../utilityObjects/Math";
import { IZIRAsset, IZIRRenderable } from "../globalInterfaces/RenderingInterfaces";

export class ZIREntityBase implements IZIRRenderable {
    protected id: string;
    protected position: Vector;
    protected size: Vector;
    protected asset: IZIRAsset;

    constructor(id: string, position: Vector, size: Vector, asset: IZIRAsset){
        this.id = id;
        this.position = position;
        this.size = size;
        this.asset = asset;
    }

    public getEntityId() {
        return this.id;
    }

    public getSize() {
        return this.size;
    }
    
    public getPosition() {
        return this.position;
    }

    public getImageToRender() {
        return this.asset;
    }
}