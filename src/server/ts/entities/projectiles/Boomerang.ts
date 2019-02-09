import {ZIRProjectile} from "../../baseObjects/ProjectileBase";
import {ZIREntity} from "../../baseObjects/EntityBase";
import {Vector} from "../../utilityObjects/Math";
import { ZIRZone, ZIRRectangularZone } from "../../baseObjects/Hitbox";

export class ZIRBoomerang extends ZIRProjectile {
    constructor(owner: ZIREntity, velocity: Vector, position: Vector, size: Vector = new Vector(80, 50), asset: string = "boomerang", expiration: number = 3000) {
        super(owner, velocity, position, size, asset, expiration);
        this.damage = 5;
        setTimeout(() => {
            this.setBehavior(this.seek);
        }, 200);
    }

    private seek(target: ZIREntity) {
        target = this.owner;
        const direction = (target.getPosition().sub(this.getPosition())).getUnitVector();
        this.setAcceleration(direction.scale(this.moveSpeed));
    }

    protected createStaticHitboxes(): ZIRZone[] {
        const toReturn: ZIRZone[] = [];
        toReturn[0] = new ZIRRectangularZone(this.position, this, this.size, ["projectile"]);
        return toReturn;
    }
}
