import {ZIREntity} from "./EntityBase"
import {Vector} from "../utilityObjects/Math"

export class ZIRPlayer extends ZIREntity {
    constructor(position: Vector = new Vector(50+Math.random()*500, 50+Math.random()*500), asset: string = "player", isPhysical : boolean = true){
        super(position, asset, isPhysical)
    }

    public toString() : string {
        return "Player" + this.id + "@" + this.position;
    }
}