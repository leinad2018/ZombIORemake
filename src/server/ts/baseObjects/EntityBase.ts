import { IZIREntity } from "../globalInterfaces/MainInterfaces";
import { Vector } from "../utilityObjects/Math";

export class ZIREntity implements IZIREntity {
    static entityCount = 0;
    protected id: string;
    protected updated: boolean;
    protected isPhysical: boolean;
    protected dead : boolean;
    protected position: Vector;
    protected velocity: Vector = new Vector(0,0);
    protected acceleration: Vector = new Vector(0,0);
    protected friction: number = .9;
    protected mass: number = 100;
    public readonly PIXELS_PER_METER = 50;
    protected moveSpeed: number = 40 * this.PIXELS_PER_METER;
    protected maxMovement : number = 4 * this.PIXELS_PER_METER;
    protected asset: string;

    constructor(position: Vector, asset: string, isPhysical: boolean = true){
        this.id = ZIREntity.entityCount + "";
        this.updated = false;
        this.dead = false;
        this.position = position;
        this.asset = asset;
        this.isPhysical = isPhysical;
        ZIREntity.entityCount++;
    }

    public shouldUpdate() {
        return !this.updated;
    }

    public update() : void {

    }

    public kill() : void {
        this.dead = true;
        this.updated = false;
    }

    public isDead() : boolean {
        return this.dead;
    }

    public setUpdated(updated : boolean) {
        this.updated = updated;
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

    public getMoveSpeed() : number {
        return this.moveSpeed;
    }

    public toString() : string {
        return "Entity" + this.id + "@" + this.position;
    }
}