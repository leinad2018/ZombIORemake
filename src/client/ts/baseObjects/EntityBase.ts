import { Vector } from "../utilityObjects/Math";
import { IZIRAsset, IZIRRenderable } from "../globalInterfaces/RenderingInterfaces";

export class ZIREntityBase implements IZIRRenderable {
    protected id: string;
    protected position: Vector;
    protected size: Vector;
    protected asset: IZIRAsset;
    protected health: number;
    protected name: string;

    constructor(id: string, position: Vector, size: Vector, asset: IZIRAsset, name: string){
        this.id = id;
        this.position = position;
        this.size = size;
        this.asset = asset;
        this.name = name;
    }

    public getEntityId() {
        return this.id;
    }

    public getSize() {
        return this.size;
    }

    public getName() {
        return this.name
    }

    public getPosition() {
        return this.position;
    }

    public getHealth() {
        return this.health;
    }

    public getImageToRender() {
        return this.asset;
    }
}