import {ZIREntity} from "./baseObjects/EntityBase"

export class ZIRPhysicsEngine {

    readonly G : number = 9.8;

    constructor() {
        
    }

    public applyPhysics(entity : ZIREntity, dt : number) {
        let friction = this.G * entity.getMass() * entity.getFriction();
        let acceleration = entity.getAcceleration();
        let frictionVector = acceleration.getUnitVector().scale(-1 * friction);
        if(frictionVector.getX() > -acceleration.getX()) {
            frictionVector.x = -acceleration.getX();
        }
        if(frictionVector.getY() > -acceleration.getY()) {
            frictionVector.y = -acceleration.getY();
        }
        
        acceleration = acceleration.add(frictionVector);
        
        let velocity = entity.getVelocity().add(acceleration.scale(dt));
        // TODO: CAP VELOCITY

        let position = entity.getPosition().add(velocity.scale(dt));

        entity.setAcceleration(acceleration);
        entity.setVelocity(velocity);
        entity.setPosition(position);
    }
}