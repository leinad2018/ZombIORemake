import {ZIREntity} from "./EntityBase"
import {Vector} from "../utilityObjects/Math"

export class ZIRSpite extends ZIREntity {
    constructor(position: Vector = new Vector(300,300), asset: string = "spite", isPhysical : boolean = false){
        super(position, asset, isPhysical)
    }

    public toString() : string {
        return "Spite" + this.id + "@" + this.position;
    }
}