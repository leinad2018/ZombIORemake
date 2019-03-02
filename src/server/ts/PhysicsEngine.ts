import { ZIREntity } from "./baseObjects/EntityBase";
import { Vector } from "./utilityObjects/Math";

export class ZIRPhysicsEngine {
    public readonly G: number = 9.8;

    public async applyPhysics(entity: ZIREntity, dt: number) {
        if (entity.getIsPhysical()) {
            let velocity = entity.getVelocity();
            let force = entity.getForce().add(entity.getInternalForce());
            let acceleration = Vector.ZERO_VECTOR;
            const friction = this.G * entity.getFriction() * entity.PIXELS_PER_METER;

            // TODO: handle external forces & implement max velocity

            acceleration = force.scale(1 / entity.getMass());
            velocity = velocity.add(acceleration.scale(dt));
            let frictionVector;
            if (velocity.getMagnitude() < 0.1) {
                frictionVector = Vector.ZERO_VECTOR;
                velocity = Vector.ZERO_VECTOR;
            } else if (friction > force.getMagnitude()) {
                frictionVector = velocity.getUnitVector().scale(-1 * force.getMagnitude());
            } else {
                frictionVector = velocity.getUnitVector().scale(-1 * friction);
            }

            // This is added to the next tick's force. Internal force should NOT be added.
            force = frictionVector;

            if (velocity.getMagnitude() !== 0) {
                entity.setUpdated(false);
                const position = entity.getPosition().add(velocity.scale(dt));
                entity.setPosition(position);
            }

            entity.setForce(force);
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
