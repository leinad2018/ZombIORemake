import { ZIRProjectile } from "../../baseObjects/ProjectileBase";
import { ZIREntity } from "../../baseObjects/EntityBase";
import { Vector } from "../../utilityObjects/Math";
import { ZIRZone, ZIRRectangularZone } from "../../baseObjects/Hitbox";

export class ZIRThrownRock extends ZIRProjectile {
    public static entityTypeId = "ThrownRock";

    constructor(owner: ZIREntity, velocity: Vector, position: Vector, size: Vector = new Vector(25, 25), asset: string = "rock", expiration: number = 2000) {
        super(owner, velocity, position, size, asset, expiration);
    }

    protected createStaticHitboxes(): ZIRZone[] {
        const toReturn: ZIRZone[] = [];
        toReturn[0] = new ZIRRectangularZone(this.getPosition(), this, this.getSize(), ["projectile"]);
        return toReturn;
    }
}
