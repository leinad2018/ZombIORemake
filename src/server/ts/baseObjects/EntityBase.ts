import { IZIREntity } from "../globalInterfaces/MainInterfaces";
import { Point } from "../globalInterfaces/UtilityInterfaces";

export class ZIREntityBase implements IZIREntity {
    protected id: number;
    protected position: Point;
    protected asset: string;

    constructor(id: number, position: Point, asset: string){
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

    public getAssetName() {
        return this.asset;
    }
}