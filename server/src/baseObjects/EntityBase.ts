import { IZIREntity } from "../globalInterfaces/MainInterfaces";
import { Vector } from "../utilityObjects/Math";
import { ZIRZone, ZIRRectangularZone } from "../baseObjects/Hitbox";

export abstract class ZIREntity implements IZIREntity {
    private static entityCount = 0;
    public static entityTypeId: string;
    private id: string;
    private updated: boolean;
    private creating: boolean;
    private isPhysical: boolean;
    private movable: boolean;
    private collides: boolean;
    private dead: boolean;
    private position: Vector;
    private velocity: Vector = new Vector(0, 0);
    private acceleration: Vector = new Vector(0, 0);
    private externalForce: Vector = new Vector(0, 0);
    private internalForce: Vector = new Vector(0, 0);
    private friction: number = 1.5;
    private mass: number = 100;
    public readonly PIXELS_PER_METER = 50;
    private moveForce: number = 40 * this.PIXELS_PER_METER; // Newtons
    private maxMovement: number = 5 * this.PIXELS_PER_METER; // m/s
    private asset: string;
    private staticHitboxes: ZIRZone[];
    private aabb: ZIRRectangularZone;
    private size: Vector;
    private hitboxHandlers: Array<(otherZone: ZIRZone) => void>;
    private eventsToExecute: ZIRZone[];
    private name: string = undefined;
    private collisionQuadtreeAddress: number[];

    constructor(position: Vector, size: Vector = new Vector(50, 50), asset: string, isPhysical: boolean = true) {
        this.id = ZIREntity.entityCount + "";
        this.creating = true;
        this.updated = false;
        this.dead = false;
        this.position = position;
        this.size = size;
        this.asset = asset;
        this.isPhysical = isPhysical;
        this.collides = true;
        this.movable = true;
        this.staticHitboxes = this.createStaticHitboxes();
        // TODO have to call this again when updates are needed
        this.createAABB();
        this.hitboxHandlers = [];
        this.eventsToExecute = [];
        ZIREntity.entityCount++;
        this.registerHitboxHandlers();
    }

    public shouldUpdate() {
        return !this.updated;
    }

    /**
     * Gets all of the hitboxes for this entity
     * Can be overriden to provide dynamic hitboxes
     */
    public getHitboxes() {
        return this.staticHitboxes;
    }

    /**
     * Creates the axis aligned bounding box
     */
    private createAABB() {
        let minX = 100000000;
        let minY = 100000000;
        let maxX = 0;
        let maxY = 0;
        for (const zone of this.staticHitboxes) {
            minX = Math.min(zone.getMinX(), minX);
            minY = Math.min(zone.getMinY(), minY);
            maxX = Math.max(zone.getMaxX(), maxX);
            maxY = Math.max(zone.getMaxY(), maxY);
        }

        this.aabb = new ZIRRectangularZone(new Vector(minX, minY), this, new Vector(maxX - minX, maxY - minY));
    }

    public getAABB() {
        return this.aabb;
    }

    protected registerHitboxHandlers() {
        this.setHitboxHandler("die", this.kill);
    }

    protected setHitboxHandler(type: string, handler: (otherZone: ZIRZone) => void) {
        this.hitboxHandlers[type] = handler.bind(this);
    }

    public registerEvent(otherZone: ZIRZone) {
        this.eventsToExecute.push(otherZone);
    }

    public setCollisionQuadtreeAddress(address: number[]) {
        this.collisionQuadtreeAddress = address;
    }

    public getCollisionQuadtreeAddress(): number[] {
        return this.collisionQuadtreeAddress;
    }

    // INCOMPLETE. Do not use.
    public hasEvent(otherZone: ZIRZone): boolean {
        // Needs modification to work properly.
        // Equals method isn't consistent due to
        // JS object weirdness.
        for (const event of this.eventsToExecute) {
            if (otherZone.equals(event)) {
                return true;
            }
        }
        return false;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public getHitboxPoints(): Vector[] {
        let points = [];

        for (const hitbox of this.getHitboxes()) {
            points = points.concat(hitbox.getPoints());
        }

        return points;
    }

    protected setMovable(movable: boolean) {
        this.movable = movable;
    }

    public getMovable(): boolean {
        return this.movable;
    }

    public getCollides(): boolean {
        return this.collides;
    }

    public runEvents() {
        for (const otherZone of this.eventsToExecute) {
            const types = otherZone.getTypes();
            for (const type of types) {
                if (this.hitboxHandlers[type]) {
                    this.hitboxHandlers[type](otherZone);
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

    public setCreating(created: boolean) {
        this.creating = created;
    }

    public isCreating() {
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
        const changeVector = position.sub(this.position);
        for (const box of this.staticHitboxes) {
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

    protected setMoveForce(force: number) {
        this.moveForce = force;
    }

    public getmoveForce(): number {
        return this.moveForce;
    }

    public getExternalForce(): Vector {
        return this.externalForce;
    }

    public setExternalForce(force: Vector) {
        this.externalForce = force;
    }

    public applyForce(force: Vector) {
        this.externalForce = this.externalForce.add(force);
    }

    public getInternalForce(): Vector {
        return this.internalForce;
    }

    public setInternalForce(force: Vector) {
        this.internalForce = force;
    }

    public toString(): string {
        return "Entity" + this.id + "@" + this.position;
    }

    public getObject() {
        return {
            playerID: this.id,
        };
    }
    /**
     * Creates all hitboxes that do not move relative to the entity
     */
    protected abstract createStaticHitboxes(): ZIRZone[];

    public abstract update(state: ZIRServerEngine): void;
}


import { ZIRServerEngine } from "../processManagers/ServerEngine";

