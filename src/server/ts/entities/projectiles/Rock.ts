import {ZIRProjectile} from "../../baseObjects/ProjectileBase";
import {ZIREntity} from "../../baseObjects/EntityBase";
import {Vector} from "../../utilityObjects/Math";

export class ZIRThrownRock extends ZIRProjectile {
    constructor(owner: ZIREntity, velocity: Vector, position: Vector, size : Vector = new Vector(50, 50), asset: string = "rock", expiration: number = 2000) {
        super(owner, velocity, position, size, asset, expiration);
    }
}