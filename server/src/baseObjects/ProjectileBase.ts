import { ZIREntity } from "./EntityBase";
import { Vector } from "../utilityObjects/Math";
import { ZIRZone } from "./Hitbox";
import { ZIRServerEngine } from "../processManagers/ServerEngine";

export abstract class ZIRProjectile extends ZIREntity {
    protected behavior: (e: ZIREntity) => void;
    protected owner: ZIREntity;
    protected damage: number = 2;

    constructor(owner: ZIREntity, velocity: Vector, position: Vector, size: Vector = new Vector(25, 25), asset: string = "rock", expiration: number = 2000) {
        super(position, size, asset);
        this.owner = owner;
        this.setVelocity(velocity);
        this.setFriction(0);
        this.setMoveForce(30 * this.PIXELS_PER_METER);
        this.behavior = (e: ZIREntity) => {
            return null;
        };
        if (expiration >= 0) {
            setTimeout(() => {
                this.kill();
            }, expiration);
        }
    }

    public update(state: ZIRServerEngine) {
        this.behavior(this.owner);
    }

    public setBehavior(behavior: (a: any) => void) {
        this.behavior = behavior;
    }

    public getDamage() {
        return this.damage;
    }

    public getParent() {
        return this.owner;
    }

    protected abstract createStaticHitboxes(): ZIRZone[];
}
