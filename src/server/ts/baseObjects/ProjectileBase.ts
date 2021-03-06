import { ZIREntity } from "./EntityBase";
import { Vector } from "../utilityObjects/Math";
import { ZIRZone } from "./Hitbox";

export abstract class ZIRProjectile extends ZIREntity {
    protected behavior: (e: ZIREntity) => void;
    protected owner: ZIREntity;
    protected damage: number = 2;

    constructor(owner: ZIREntity, velocity: Vector, position: Vector, size: Vector = new Vector(25, 25), asset: string = "rock", expiration: number = 2000) {
        super(position, size, asset);
        this.owner = owner;
        this.velocity = velocity;
        this.mass = 1;
        this.friction = 0;
        this.moveSpeed = 30 * this.PIXELS_PER_METER;
        this.behavior = (e: ZIREntity) => {
            return null;
        };
        this.maxMovement = this.PIXELS_PER_METER * 10000000000000000000000000000;
        setTimeout(() => {
            this.kill();
        }, expiration);
    }

    public update(state) {
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
