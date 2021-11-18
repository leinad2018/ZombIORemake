import {ZIREntity} from "../baseObjects/EntityBase";
import {Vector} from "../utilityObjects/Math";
import {ZIRRectangularZone} from "../baseObjects/Hitbox";

export class ZIRSpite extends ZIREntity {
    public static entityTypeId = "Spite";

    constructor(position: Vector = new Vector(1000, 1000), size = new Vector(50, 50), asset: string = "spite", isPhysical: boolean = true) {
        super(position, size, asset, isPhysical);
        this.setMovable(false);
    }

    public toString(): string {
        return "Spite" + this.getEntityId() + "@" + this.getPosition();
    }

    protected createStaticHitboxes() {
        const hitbox = new ZIRRectangularZone(this.getPosition(), this, this.getSize(), ["collision"]);
        return [hitbox];
    }

    public update() {
        return null;
    }
}
