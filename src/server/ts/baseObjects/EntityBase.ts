import { IZIREntity } from "../globalInterfaces/MainInterfaces";
import { Vector } from "../utilityObjects/Math";
import { ZIRZone } from "../baseObjects/Hitbox"

export abstract class ZIREntity implements IZIREntity {
    static entityCount = 0;
    protected id: string;
    protected updated: boolean;
    protected creating: boolean;
    protected isPhysical: boolean;
    protected dead: boolean;
    protected position: Vector;
    protected velocity: Vector = new Vector(0, 0);
    protected acceleration: Vector = new Vector(0, 0);
    protected friction: number = .9;
    protected mass: number = 100;
    public readonly PIXELS_PER_METER = 50;
    protected moveSpeed: number = 40 * this.PIXELS_PER_METER;
    protected maxMovement: number = 4 * this.PIXELS_PER_METER;
    protected asset: string;
    protected staticHitboxes: ZIRZone[];
    protected size: Vector;
    protected hitboxHandlers: (() => void)[];
    protected eventsToExecute: ZIRZone[];

    constructor(position: Vector, size: Vector = new Vector(50, 50), asset: string, isPhysical: boolean = true) {
        this.id = ZIREntity.entityCount + "";
        this.creating = true;
        this.updated = false;
        this.dead = false;
        this.position = position;
        this.size = size;
        this.asset = asset;
        this.isPhysical = isPhysical;
        this.staticHitboxes = this.createStaticHitboxes();
        this.hitboxHandlers = [];
        this.eventsToExecute = [];
        ZIREntity.entityCount++;
        this.registerHitboxHandlers();
    }

    public shouldUpdate() {
        return !this.updated;
    }

    public update(state): void {

    }

    /**
     * Gets all of the hitboxes for this entity
     * Can be overriden to provide dynamic hitboxes
     */
    public getHitboxes() {
        return this.staticHitboxes;
    }

    protected registerHitboxHandlers() {
        this.hitboxHandlers["die"] = this.kill.bind(this);
    }

    public registerEvent(otherZone: ZIRZone) {
        this.eventsToExecute.push(otherZone);
    }

    public runEvents() {
        for (let otherZone of this.eventsToExecute) {
            let type = otherZone.getType();
            let owner: ZIREntity = otherZone.getParent();
            if (this.hitboxHandlers[type] && owner != this) {
                if (owner instanceof ZIRProjectile) {
                    owner = (owner as ZIRProjectile).getParent();
                }
                if (owner != this) {
                    this.hitboxHandlers[type]();
                }
            }
        }
        this.eventsToExecute = [];
    }

    public kill(): void {
        this.dead = true;
        this.updated = false;
    }

    public isDead(): boolean {
        return this.dead;
    }

    public setUpdated(updated: boolean) {
        this.updated = updated;
    }

    public setCreating(created: boolean){
        this.creating = created;
    }

    public isCreating(){
        return this.creating;
    }

    public getSize() {
        return this.size;
    }

    public getEntityId() {
        return this.id;
    }

    public getAssetName() {
        return this.asset;
    }

    public setFriction(friction: number) {
        this.friction = friction;
    }

    public getMass(): number {
        return this.mass;
    }

    public getFriction(): number {
        return this.friction;
    }

    public getPosition(): Vector {
        return this.position;
    }

    public getVelocity(): Vector {
        return this.velocity;
    }

    public getAcceleration(): Vector {
        return this.acceleration;
    }

    public setPosition(position: Vector): void {
        let changeVector = position.sub(this.position);
        for (let box of this.staticHitboxes) {
            box.setPosition(box.getPosition().add(changeVector));
        }
        this.position = position;
    }

    public setVelocity(velocity: Vector): void {
        this.velocity = velocity;
    }

    public setAcceleration(acceleration: Vector): void {
        this.acceleration = acceleration;
    }

    public setIsPhysical(isPhysical: boolean): void {
        this.isPhysical = isPhysical;
    }

    public getIsPhysical(): boolean {
        return this.isPhysical;
    }

    public setMaxMovement(movement: number) {
        this.maxMovement = movement;
    }

    public getMaxMovement(): number {
        return this.maxMovement;
    }

    public getMoveSpeed(): number {
        return this.moveSpeed;
    }

    public toString(): string {
        return "Entity" + this.id + "@" + this.position;
    }

    /**
     * Creates all hitboxes that do not move relative to the entity
     */
    protected abstract createStaticHitboxes(): ZIRZone[];
}
import { ZIRProjectile } from "./ProjectileBase";