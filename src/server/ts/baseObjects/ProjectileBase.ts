import {ZIREntity} from "./EntityBase";
import { Vector } from "../utilityObjects/Math";

export class ZIRProjectile extends ZIREntity {
    protected behavior: Function;
    protected owner: ZIREntity;

    constructor(owner: ZIREntity, velocity: Vector, position: Vector, size: Vector = new Vector(25, 25), asset: string = "rock", expiration: number = 2000) {
        super(position, size, asset);
        this.owner = owner;
        this.velocity = velocity;
        this.mass = 1;
        this.friction = 0;
        this.moveSpeed = 30*this.PIXELS_PER_METER
        this.behavior = (e : ZIREntity)=>{};
        this.maxMovement = this.PIXELS_PER_METER * 10000000000000000000000000000;
        setTimeout(()=>{this.kill()},expiration)
    }

    public update() {
        this.behavior(this.owner);
    }

    public setBehavior(behavior: Function) {
        this.behavior = behavior;
    }
}