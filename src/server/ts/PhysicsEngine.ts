import { ZIREntity } from "./baseObjects/EntityBase";
import { Vector } from "./utilityObjects/Math";

export class ZIRPhysicsEngine {
    public readonly G: number = 9.8;

    public async applyPhysics(entity: ZIREntity, dt: number) {
        if (entity.getIsPhysical()) {
            let velocity = entity.getVelocity();
            let acceleration = entity.getAcceleration();
            const mv = velocity.getMagnitude();

            if (mv > 0) {
                const friction = this.G * entity.getFriction() * entity.PIXELS_PER_METER;

                let frictionVector = new Vector(0, 0);
                frictionVector = velocity.getUnitVector().scale(-1 * friction);
                if (frictionVector.getMagnitude() * dt > velocity.getMagnitude()) {
                    frictionVector = frictionVector.getUnitVector().scale(velocity.getMagnitude() / dt);
                }
                acceleration = acceleration.add(frictionVector);

                if (mv >= entity.getMaxMovement()) {
                    acceleration.scale(0);
                    velocity = velocity.getUnitVector().scale(entity.getMaxMovement());
                }
            }


            // TODO: handle external forces

            velocity = velocity.add(acceleration.scale(dt));

            if (velocity.getMagnitude() !== 0) {
                entity.setUpdated(false);
                const position = entity.getPosition().add(velocity.scale(dt));
                entity.setPosition(position);
            }

            entity.setVelocity(velocity);
        }
    }
}
