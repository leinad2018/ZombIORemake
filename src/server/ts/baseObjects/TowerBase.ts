import { ZIREntity } from "./EntityBase";
import { Vector } from "../utilityObjects/Math";

export abstract class ZIRTowerBase extends ZIREntity {
    constructor(position: Vector, size: Vector, asset: string) {
        super(position, size, asset, false);
    }
}