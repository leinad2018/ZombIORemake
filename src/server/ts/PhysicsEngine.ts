import {ZIREntity} from "./baseObjects/EntityBase"
import { Vector } from "./utilityObjects/Math";

export class ZIRPhysicsEngine {
    readonly PIXELS_TO_METERS = 50;
    readonly G : number = 9.8 * this.PIXELS_TO_METERS;

    constructor() {
        
    }

    public applyPhysics(entity : ZIREntity, dt : number) {
        let friction = this.G * entity.getMass() * entity.getFriction();
        let acceleration = entity.getAcceleration();
    
        console.log(friction);
        let velocity = entity.getVelocity();
        let frictionVector = new Vector(0, 0);
        
        if (velocity.getMagnitude() > 0) {
            frictionVector = velocity.getUnitVector().scale(-1 * friction);
        }
        console.log(""+frictionVector);
        
        acceleration = acceleration.add(frictionVector);
        
        velocity = velocity.add(acceleration.scale(dt));
        // TODO: CAP VELOCITY

        let position = entity.getPosition().add(velocity.scale(dt));

        entity.setVelocity(velocity);
        entity.setPosition(position);
    }
}