import { ZIREntity } from "../../baseObjects/EntityBase";
import { ZIRMob } from "../../baseObjects/Mob";
import { Vector } from "../../utilityObjects/Math";
import { ZIRPlayer } from "./Player";
import { ZIRZone, ZIRRectangularZone } from "../../baseObjects/Hitbox";
import { ZIRTimer } from "../../utilityObjects/Timer";

export class ZIREnemy extends ZIRMob {
    public static entityTypeId = "Enemy";
    private named = false;
    private cooldownUses: {[ability: string]: number}; // For storing cooldown timestamps
    private target: ZIREntity;
    private agroRange = 500;
    private static names: string[] = ["Brad", "Katie", "Steven", "TJ", "Dan", "Xander", "Maximus Milkertus",
    "Missingno", "February", "Monty", "Brefka Beaver", "Chris", "Olga", "Doquavius", "Bob", "Dylan",
    "Josh", "Alex", "Paul", "Crixus", "Timmy", "Tommy", "Greg", "Kanye", "Lil Xan", "Eminem", "JayZ"];

    constructor(position: Vector = new Vector(50 + Math.random() * 500, 50 + Math.random() * 500), size: Vector = new Vector(50, 50), asset: string = "enemy", isPhysical: boolean = true) {
        super(position, size, asset, isPhysical);
        if (this.named) {
            this.setName(ZIREnemy.names[Math.trunc(Math.random() * ZIREnemy.names.length - 1)]);
        }
        this.setMaxMovement(4 * this.PIXELS_PER_METER);
    }

    public update(state): void {
        this.ai(state);
    }

    public ai(state): void {
        ZIRTimer.start("findTarget", "enemyAI");
        this.findTarget(state);
        ZIRTimer.stop("findTarget");
        ZIRTimer.start("enemyMove", "enemyAI");
        if (this.target) {
            this.setInternalForce(this.getPosition().sub(this.target.getPosition()).getUnitVector().scale(this.getmoveForce() * this.getMass()));
        } else {
            this.setInternalForce(Vector.ZERO_VECTOR);
        }
        ZIRTimer.stop("enemyMove");
    }

    private findTarget(state): void {
        for (const entity of state.getAllPlayers()) {
            if (this.getPosition().sub(entity.getPosition()).getMagnitude() < this.agroRange) {
                this.target = entity;
                return;
            }
        }
        this.target = null;
    }

    public getObject() {
        return {
            playerID: this.getEntityId(),
        };
    }

    public createStaticHitboxes() {
        const toReturn: ZIRZone[] = [];
        toReturn[0] = new ZIRRectangularZone(this.getPosition(), this, this.getSize());
        return toReturn;
    }

    public toString(): string {
        return "Enemy" + this.getEntityId() + "@" + this.getPosition() + "/V" + this.getVelocity() + "/A" + this.getAcceleration();
    }
}
