import {ZIREntity} from "./EntityBase"
import {Vector} from "../utilityObjects/Math"

export class ZIRPlayer extends ZIREntity {
    constructor(position: Vector = new Vector(0,0), asset: string = "player", isPhysical : boolean = true){
        super(position, asset, isPhysical)
    }
}