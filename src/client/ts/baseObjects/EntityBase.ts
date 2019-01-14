import { IZIREntity } from "../globalInterfaces/MainInterfaces";
import { Point } from "../globalInterfaces/UtilityInterfaces";
import { IZIRAsset } from "../globalInterfaces/RenderingInterfaces";

export class ZIREntityBase implements IZIREntity {
    protected id: number;
    protected position: Point;
    protected asset: IZIRAsset;

    constructor(id: number, position: Point, asset: IZIRAsset){
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