import {ZIREntity} from "./EntityBase";
import {ZIRZone, ZIRRectangularZone, ZIRCircleZone} from "./Hitbox";
import { ZIRProjectile } from "./ProjectileBase";

export abstract class ZIRMob extends ZIREntity {
    protected health = 10;

    public damage(amount: number) {
        this.health -= amount;
        if (this.health < 0) {
            this.kill();
        }
    }

    protected registerHitboxHandlers() {
        super.registerHitboxHandlers();
        this.setHitboxHandler("projectile", this.onProjectileHit);
        // this.hitboxHandlers["collision"] = this.collide.bind(this);
    }

    protected onProjectileHit(other: ZIRZone) {
        const projectile = other.getParent() as ZIRProjectile;
        if (projectile.getParent() !== this) {
            this.damage(projectile.getDamage());
        }
    }

    protected collide(other: ZIRZone) {
        const a = this.getAcceleration();

        if (other instanceof ZIRRectangularZone) {
            other = (other as ZIRRectangularZone);
            const otherEntity = other.getParent();

            let p1 = this.getPosition();
            let p2 = otherEntity.getPosition();

            p1 = p1.add(this.getSize().scale(0.5));
            p2 = p2.add(otherEntity.getSize().scale(0.5));


        } else if (other instanceof ZIRCircleZone) {
            other = (other as ZIRCircleZone);
        }
    }
}
