import {ZIREntity} from "./EntityBase";
import {Vector} from "../../../common/src/Math";
import {ZIRRectangularZone} from "./Hitbox";

export class ZIRSpite extends ZIREntity {
    constructor(position: Vector = new Vector(1000, 1000), size = new Vector(50, 50), asset: string = "spite", isPhysical: boolean = true) {
        super(position, size, asset, isPhysical);
        this.movable = false;
    }

    public toString(): string {
        return "Spite" + this.id + "@" + this.position;
    }

    protected createStaticHitboxes() {
        const hitbox = new ZIRRectangularZone(this.position, this, this.size, ["collision"]);
        return [hitbox];
    }

    public update() {
        return null;
    }
}
