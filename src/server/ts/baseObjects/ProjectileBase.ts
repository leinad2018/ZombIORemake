import {ZIREntity} from "./EntityBase";
import { Vector } from "../utilityObjects/Math";

export class ZIRProjectile extends ZIREntity {
    constructor(velocity : Vector, position : Vector, asset : string = "rock") {
        super(position, asset);
        this.velocity = velocity;
    }
}