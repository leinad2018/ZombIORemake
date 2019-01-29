import { Vector } from "../utilityObjects/Math";
import { ZIREntity } from "./EntityBase";

export abstract class ZIRZone {
    protected position: Vector;

    constructor(pos: Vector) {
        this.position = pos;
    }

    public getPosition() {
        return this.position;
    }

    public abstract checkCollision(otherZone: ZIRZone): boolean;
}

export class ZIREffectBox extends ZIRZone{
    private ownerEntity: ZIREntity;
    private areas: ZIRZone[];

    constructor(parent: ZIREntity, areas: ZIRZone[]){
        super(areas[0].getPosition());
        this.ownerEntity = parent;
        this.areas = areas;
    }

    public checkCollision(zone: ZIRZone): boolean{
        for(let area of this.areas){
            if(area.checkCollision(zone)){
                return true;
            }
        }
        return false;
    }

    public isMoving(){
        return Math.abs(this.ownerEntity.getVelocity().getMagnitude()) > 0.1;
    }

    public getParent(){
        return this.ownerEntity;
    }
}

export class ZIRCircleZone extends ZIRZone {
    protected radius: number;

    constructor(pos: Vector, radius: number) {
        super(pos);
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
        let distance = Math.sqrt(Math.pow(this.position.getX() - circle.position.getX(), 2) + Math.pow(this.position.getY() - circle.position.getY(), 2));
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
    protected otherCorner: Vector;

    constructor(pos: Vector, size: Vector) {
        super(pos);
        this.otherCorner = pos.add(size);
    }

    public checkCollision(otherZone: ZIRZone) {
        if (otherZone instanceof ZIRCircleZone) {
            return this.checkCircle(otherZone.getPosition(), otherZone.getRadius());
        }
        if (otherZone instanceof ZIRRectangularZone) {
            return this.checkRectangle(otherZone.position, otherZone.otherCorner);
        }
    }

    private checkCircle(pos: Vector, radius: number): boolean {
        if (pos.getY() - radius > this.position.getY() || pos.getY() + radius < this.otherCorner.getY()) {
            return false;
        }
        if (pos.getX() + radius < this.position.getX() || pos.getX() - radius > this.position.getX()) {
            return false;
        }
        return true;
    }

    private checkRectangle(pos: Vector, otherPoint: Vector): boolean {
        if (this.position.getX() > otherPoint.getX() || pos.getX() > this.otherCorner.getX()) {
            return false;
        }
        if (this.position.getY() < otherPoint.getY() || pos.getY() < this.otherCorner.getY()) {
            return false;
        }
        return true;
    }
}