import {ZIRProjectile} from "../../baseObjects/ProjectileBase";
import {ZIREntity} from "../../baseObjects/EntityBase";
import {Vector} from "../../utilityObjects/Math";
import { ZIRZone, ZIRRectangularZone } from "../../baseObjects/Hitbox";

export class ZIRBoomerang extends ZIRProjectile {
    private returning: boolean = false;

    constructor(owner: ZIREntity, velocity: Vector, position: Vector, size: Vector = new Vector(80, 50), asset: string = "boomerang", expiration: number = -1) {
        super(owner, velocity, position, size, asset, expiration);
        this.returning = false;
        this.damage = 5;

        setTimeout(() => {
            this.setBehavior(this.seek);
            this.returning = true;
        }, 500);
        setTimeout(() => {
            this.setInternalForce(Vector.ZERO_VECTOR);
            this.setVelocity(Vector.ZERO_VECTOR);
            this.setBehavior((e: ZIREntity) => {
                return null;
            });
        }, 3000);
    }

    public isReturning(): boolean {
        return this.returning;
    }

    private seek(target: ZIREntity) {
        target = this.owner;
        const direction = (target.getPosition().sub(this.getPosition())).getUnitVector();
        this.setVelocity(direction.getUnitVector().scale(15 * this.PIXELS_PER_METER));
    }

    protected createStaticHitboxes(): ZIRZone[] {
        const toReturn: ZIRZone[] = [];
        toReturn[0] = new ZIRRectangularZone(this.getPosition(), this, this.getSize(), ["projectile", "boomerang"]);
        return toReturn;
    }
}
