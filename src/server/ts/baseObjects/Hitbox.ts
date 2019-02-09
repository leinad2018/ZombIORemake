import { Vector } from "../utilityObjects/Math";
import { ZIREntity } from "./EntityBase";

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

    public abstract checkCollision(otherZone: ZIRZone): boolean;
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
}
