import {ZIREntity} from "./EntityBase";
import {Vector} from "../utilityObjects/Math";

export class ZIRSpite extends ZIREntity {
    constructor(position: Vector = new Vector(1000, 1000), size = new Vector(50, 50), asset: string = "spite", isPhysical: boolean = false) {
        super(position, size, asset, isPhysical);
    }

    public toString(): string {
        return "Spite" + this.id + "@" + this.position;
    }

    protected createStaticHitboxes() {
        return [];
    }
}
