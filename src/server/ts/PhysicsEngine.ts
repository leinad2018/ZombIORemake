import { ZIREntity } from "./baseObjects/EntityBase"
import { Vector } from "./utilityObjects/Math";

export class ZIRPhysicsEngine {
    readonly G: number = 9.8;

    constructor() {

    }

    public applyPhysics(entity: ZIREntity, dt: number) {
        let friction = this.G * entity.getFriction() * entity.PIXELS_PER_METER;
        let acceleration = entity.getAcceleration();

        let velocity = entity.getVelocity();
        let frictionVector = new Vector(0, 0);
        if (velocity.getMagnitude() > 0) {
            frictionVector = velocity.getUnitVector().scale(-1 * friction);
            if (frictionVector.getMagnitude() * dt > velocity.getMagnitude()) {
                frictionVector = frictionVector.getUnitVector().scale(velocity.getMagnitude() / dt);
            }
        }

        acceleration = acceleration.add(frictionVector);

        if (velocity.getMagnitude() >= entity.getMaxMovement()) {
            acceleration.scale(0);
            velocity = velocity.getUnitVector().scale(entity.getMaxMovement());
        }

        //TODO: handle external forces

        velocity = velocity.add(acceleration.scale(dt));

        if(velocity.getMagnitude() !== 0) entity.setUpdated(false);

        let position = entity.getPosition().add(velocity.scale(dt));

        entity.setVelocity(velocity);
        entity.setPosition(position);
    }
}