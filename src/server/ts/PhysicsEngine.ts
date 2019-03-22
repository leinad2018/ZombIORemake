import { ZIREntity } from "./baseObjects/EntityBase";
import { Vector } from "./utilityObjects/Math";

export class ZIRPhysicsEngine {
    public readonly G: number = 9.8;

    public async applyPhysics(entity: ZIREntity, dt: number) {
        if (entity.getIsPhysical()) {
            let velocity = entity.getVelocity();
            const externalForce = entity.getExternalForce();
            const internalForce = entity.getInternalForce();
            let acceleration = Vector.ZERO_VECTOR;
            const friction = this.G * entity.getFriction() * entity.getMass() * entity.PIXELS_PER_METER;

            const netForce = (entity.getMaxMovement() < velocity.getMagnitude()) ? externalForce : internalForce.add(externalForce);
            entity.setExternalForce(Vector.ZERO_VECTOR);

            acceleration = netForce.scale(1 / entity.getMass());
            velocity = velocity.add(acceleration.scale(dt));

            let frictionVector = velocity.getUnitVector().scale(-1 * friction);
            let velocityChange = frictionVector.scale(dt / entity.getMass());

            if (velocityChange.getMagnitude() > velocity.getMagnitude()) {
                velocity = Vector.ZERO_VECTOR;
            } else {
                velocity = velocity.add(velocityChange);
            }

            if (velocity.getMagnitude() !== 0) {
                entity.setUpdated(false);
                const position = entity.getPosition().add(velocity.scale(dt));
                entity.setPosition(position);
            }

            entity.setVelocity(velocity);

            /**
             * Acceleration does not actually persist between physics ticks -
             * this just sets the variable so that it can be read as a stat.
             * Use force to alter the next physics state.
             */
            entity.setAcceleration(acceleration);
        }
    }
}
