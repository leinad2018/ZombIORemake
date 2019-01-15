import { IZIREntity } from "../globalInterfaces/MainInterfaces";
import { Vector } from "../utilityObjects/Math";

export class ZIREntity implements IZIREntity {
    static entityCount = 0;
    protected id: number;
    protected isPhysical: boolean;
    protected position: Vector;
    protected velocity: Vector = new Vector(0,0);
    protected acceleration: Vector = new Vector(0,0);
    protected friction: number = 0.2;
    protected mass: number = 10;
    protected maxMovement : number = 10;
    protected asset: string;

    constructor(position: Vector, asset: string, isPhysical: boolean = true){
        this.id = ZIREntity.entityCount;
        this.position = position;
        this.asset = asset;
        ZIREntity.entityCount++;
    }

    public getEntityId() {
        return this.id;
    }

    public getAssetName() {
        return this.asset;
    }

    public setFriction(friction : number) {
        this.friction = friction;
    }

    public getMass() : number {
        return this.mass;
    }

    public getFriction() : number {
        return this.friction;
    }

    public getPosition() : Vector {
        return this.position;
    }

    public getVelocity() : Vector {
        return this.velocity;
    }

    public getAcceleration() : Vector {
        return this.acceleration;
    }

    public setPosition(position : Vector) : void {
        this.position = position;
    }

    public setVelocity(velocity : Vector) : void {
        this.velocity = velocity;
    }

    public setAcceleration(acceleration : Vector) : void {
        this.acceleration = acceleration;
    }

    public setIsPhysical(isPhysical : boolean) : void {
        this.isPhysical = isPhysical;
    }

    public getIsPhysical() : boolean {
        return this.isPhysical;
    }

    public setMaxMovement(movement : number) {
        this.maxMovement = movement;
    }

    public getMaxMovement() : number {
        return this.maxMovement;
    }

    public toString() : string {
        return "Entity" + this.id + "@" + this.position;
    }
}