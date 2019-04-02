import { ZIREntity } from "../../baseObjects/EntityBase";
import { ZIRMob } from "../../baseObjects/Mob";
import { Vector } from "../../../../common/src/Math";
import { ZIRPlayer } from "./Player";
import { ZIRZone, ZIRRectangularZone } from "../../baseObjects/Hitbox";

export class ZIREnemy extends ZIRMob {
    private cooldownUses: {[ability: string]: number}; // For storing cooldown timestamps
    private target: ZIREntity;
    private agroRange = 500;
    private static names: string[] = ["Brad", "Katie", "Steven", "TJ", "Dan", "Xander", "Maximus Milkertus",
    "Missingno", "February", "Monty", "Brefka Beaver", "Chris", "Olga", "Doquavius", "Bob", "Dylan",
    "Josh", "Alex", "Paul", "Crixus", "Timmy", "Tommy", "Greg", "Kanye", "Lil Xan", "Eminem", "JayZ"];

    constructor(position: Vector = new Vector(50 + Math.random() * 500, 50 + Math.random() * 500), size: Vector = new Vector(50, 50), asset: string = "enemy", isPhysical: boolean = true) {
        super(position, size, asset, isPhysical);
        this.name = ZIREnemy.names[Math.trunc(Math.random() * ZIREnemy.names.length - 1)];
        this.maxMovement = 4 * this.PIXELS_PER_METER;
    }

    public update(state): void {
        this.ai(state);
    }

    public ai(state): void {
        this.findTarget(state);
        if (this.target) {
            this.internalForce = this.getPosition().sub(this.target.getPosition()).getUnitVector().scale(this.moveForce * this.mass);
        } else {
            this.internalForce = Vector.ZERO_VECTOR;
        }
    }

    private findTarget(state): void {
        for (const entity of state.getAllEntities()) {
            if (entity instanceof ZIRPlayer) {
                if (this.getPosition().sub(entity.getPosition()).getMagnitude() < this.agroRange) {
                    this.target = entity;
                    return;
                }
            }
        }
        this.target = null;
    }

    public getObject() {
        return {
            playerID: this.id,
        };
    }

    public createStaticHitboxes() {
        const toReturn: ZIRZone[] = [];
        toReturn[0] = new ZIRRectangularZone(this.position, this, this.size);
        return toReturn;
    }

    public toString(): string {
        return "Enemy" + this.id + "@" + this.position + "/V" + this.velocity + "/A" + this.acceleration;
    }
}
