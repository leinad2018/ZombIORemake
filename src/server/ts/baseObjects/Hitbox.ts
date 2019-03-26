import { Vector } from "../utilityObjects/Math";
import { ZIREntity } from "./EntityBase";
import { ZIRPlayer } from "../entities/mobs/Player";

export abstract class ZIRZone {
    protected position: Vector;
    protected types: string[];
    protected owner: ZIREntity;

    constructor(pos: Vector, owner: ZIREntity, types: string[] = ["none"]) {
        this.position = pos;
        this.owner = owner;
        this.types = types;
    }

    public getPosition() {
        return this.position;
    }

    public setPosition(pos: Vector) {
        this.position = pos;
    }

    public getTypes() {
        return this.types;
    }

    public getParent() {
        return this.owner;
    }

    public equals(other: ZIRZone): boolean {
        // TODO: FIX THIS. It is horribly broken
        // console.log("Equals?");
        // console.log(this.owner);
        // console.log(other.owner);
        return true; // (this.owner.getEntityId() === other.owner.getEntityId()); //&& this.types === other.types); //&& this.position.equals(other.position));
    }

    public abstract checkCollision(otherZone: ZIRZone): boolean;

    public abstract getCollisionVector(otherZone: ZIRZone): Vector;
}

export class ZIREffectBox extends ZIRZone {
    private areas: ZIRZone[];

    constructor(parent: ZIREntity, areas: ZIRZone[]) {
        super(areas[0].getPosition(), parent);
        this.areas = areas;
    }

    public checkCollision(zone: ZIRZone): boolean {
        for (const area of this.areas) {
            if (area.checkCollision(zone)) {
                return true;
            }
        }
        return false;
    }

    public getCollisionVector(zone: ZIRZone): Vector {
        // TODO: implement maybe
        return Vector.ZERO_VECTOR;
    }

    public isMoving() {
        return Math.abs(this.owner.getVelocity().getMagnitude()) > 0.1;
    }
}

export class ZIRCircleZone extends ZIRZone {
    protected radius: number;

    constructor(pos: Vector, owner: ZIREntity, radius: number, type?: string[]) {
        super(pos, owner, type);
        this.radius = radius;
    }

    public checkCollision(otherZone: ZIRZone): boolean {
        if (otherZone instanceof ZIRRectangularZone) {
            return otherZone.checkCollision(this);
        }
        if (otherZone instanceof ZIRCircleZone) {
            return this.checkCircle(otherZone);
        }
        return false;
    }

    public getCollisionVector(otherZone: ZIRZone): Vector {
        // TODO: Implement
        return new Vector(100, 0);
    }

    private checkCircle(circle: ZIRCircleZone): boolean {
        const distance = Math.sqrt(Math.pow(this.position.getX() - circle.position.getX(), 2) + Math.pow(this.position.getY() - circle.position.getY(), 2));
        if (this.radius <= distance) {
            return true;
        }
        if (circle.radius <= distance) {
            return true;
        }
        return false;
    }

    public getRadius() {
        return this.radius;
    }

    public equals(other: ZIRZone): boolean {
        return super.equals(other) && other instanceof ZIRCircleZone;
    }
}

export class ZIRRectangularZone extends ZIRZone {
    protected size: Vector;

    constructor(pos: Vector, owner: ZIREntity, size: Vector, type?: string[]) {
        super(pos, owner, type);
        this.size = size;
    }

    public checkCollision(otherZone: ZIRZone) {
        if (otherZone instanceof ZIRCircleZone) {
            return this.checkCircle(otherZone.getPosition(), otherZone.getRadius());
        }
        if (otherZone instanceof ZIRRectangularZone) {
            return this.checkRectangle(otherZone.position, otherZone.position.add(otherZone.size));
        }
    }

    public getCollisionVector(otherZone: ZIRZone): Vector {
        if (otherZone instanceof ZIRCircleZone) {
            return this.checkCircleVector(otherZone.getPosition(), otherZone.getRadius());
        }
        if (otherZone instanceof ZIRRectangularZone) {
            return this.checkRectangleVector(otherZone.position, otherZone.size);
        }
    }

    private checkCircleVector(pos: Vector, radius: number): Vector {
        return Vector.ZERO_VECTOR;
    }

    private checkRectangleVector(pos: Vector, size: Vector): Vector {
        // First find signed this-relative collision overlap for each dimension
        // x-component
        const l1 = this.position.getX();
        const l2 = pos.getX();
        const r1 = l1 + this.size.getX();
        const r2 = l2 + size.getX();

        let xOverlap = 0;
        if (r2 > r1) { // Collision on right side of me
            xOverlap = r1 - l2;
        } else { // Collision on left side of me, intentionally negative
            xOverlap = l1 - r2;
        }

        // y-component
        const t1 = this.position.getY();
        const t2 = pos.getY();
        const b1 = t1 + this.size.getY();
        const b2 = t2 + size.getY();

        let yOverlap = 0;
        if (b2 > b1) { // Collision on bottom side of me
            yOverlap = b1 - t2;
        } else { // Collision on top side of me, intentionally negative
            yOverlap = t1 - b2;
        }

        let normalVector;

        // Generate a normal vector based on the least overlap
        if (Math.abs(xOverlap) < Math.abs(yOverlap)) {
            normalVector = new Vector(xOverlap, 0);
        } else {
            normalVector = new Vector(0, yOverlap);
        }

        return normalVector;
    }

    private checkCircle(pos: Vector, radius: number): boolean {
        const otherCorner = this.position.add(this.size);
        if (pos.getY() - radius > this.position.getY() || pos.getY() + radius < otherCorner.getY()) {
            return false;
        }
        if (pos.getX() + radius < this.position.getX() || pos.getX() - radius > this.position.getX()) {
            return false;
        }
        return true;
    }

    private checkRectangle(pos: Vector, otherPoint: Vector): boolean {
        const otherCorner = this.position.add(this.size);
        if (this.position.getX() > otherPoint.getX() || pos.getX() > otherCorner.getX()) {
            return false;
        }
        if (this.position.getY() > otherPoint.getY() || pos.getY() > otherCorner.getY()) {
            return false;
        }
        return true;
    }

    public equals(other: ZIRZone): boolean {
        return super.equals(other) && other instanceof ZIRRectangularZone;
    }
}
