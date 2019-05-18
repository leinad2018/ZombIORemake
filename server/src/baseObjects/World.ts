import { ZIREntity } from "./EntityBase";
import { IZIRTerrainMap } from "../globalInterfaces/IServerUpdate";
import { Vector } from "../utilityObjects/Math";
import { ZIRResourceNode } from "../entities/ResourceNode";
import { ZIRTimer } from "../Timer";
import { EntityQuadtree } from "../utilityObjects/DataStructures";

export class ZIRWorld {
    private worldID: string;
    private terrain: IZIRTerrainMap;
    private entities: ZIREntity[];
    private quadtree: EntityQuadtree;
    private SORT: boolean = true;
    private QUADTREE: boolean = true;

    constructor(id: string) {
        this.worldID = id;
        this.entities = [];
        this.terrain = this.generateWorldTerrain();
        const resource = new ZIRResourceNode(new Vector(1500, 1500), new Vector(50, 50), "rock", "rock");
        const resource2 = new ZIRResourceNode(new Vector(1500, 2500), new Vector(50, 50), "rock", "rock");
        this.registerEntity(resource);
        this.registerEntity(resource2);
    }

    public registerEntity(entity: ZIREntity) {
        this.entities.push(entity);
    }

    public getQuadtree(): EntityQuadtree {
        return this.quadtree;
    }

    public collectGarbage() {
        for (let i = this.entities.length - 1; i > 0; i--) {
            const entity = this.entities[i];
            if (entity.isDead()) {
                this.entities.splice(i, 1);
            }
        }
    }

    /**
     * Use this when you want to remove an entity from the world in order to transfer it to another world
     * If an entity should be removed from all worlds consider using entity.kill()
     */
    public removeEntity(entityID: string): ZIREntity {
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity.getEntityId() === entityID) {
                this.entities.splice(i, 1);
                return entity;
            }
        }
    }

    public runCollisionLogic() {
        if(this.SORT) {
            ZIRTimer.start("sort", "collision");
            this.sortEntities();
            ZIRTimer.stop("sort");
        }

        ZIRTimer.start("generatePairs", "collision");
        const potentialCollisions = this.generateCollisionPairs();
        ZIRTimer.count(potentialCollisions.length, "collisionPairs", "count");
        ZIRTimer.stop("generatePairs");
        ZIRTimer.start("checkCollision", "collision");
        for (const potentialCollision of potentialCollisions) {
            this.checkEntityCollision(potentialCollision);
        }
        ZIRTimer.stop("checkCollision");
        ZIRTimer.start("events", "collision");
        for (const entity of this.entities) {
            entity.runEvents();
            entity.setCreating(false);
        }
        ZIRTimer.stop("events");
    }

    private sortEntities() {
        if(this.QUADTREE) {
            this.quadtree = new EntityQuadtree(this.entities);
        } else {
            this.entities.sort((a, b) => {
                const aabba = a.getAABB();
                const aabbb = b.getAABB();
                return aabbb.getMinX() - aabba.getMinX();
            });
        }
    }

    private generateCollisionPairs(): IZIRCollisionCandidate[] {
        const pairs = [];
        if(this.SORT) {
            if(this.QUADTREE) {
                return this.quadtree.getCollisionPairs();
            } else {
                let activeIndex = 0;
                //The first entity does not need to be checked because it will not match with any entity before it
                for (let curIndex = 1; curIndex < this.entities.length; curIndex++) {
                    const entity = this.entities[curIndex];
                    const box = entity.getAABB();
                    let end = false;
                    for (let i = curIndex - 1; !end && i >= activeIndex; i--) {
                        const other = this.entities[i];
                        const otherBox = other.getAABB();
                        if (otherBox.getMaxX() < box.getMinX()) {
                            activeIndex = i;
                            end = true;
                        } else {
                            pairs.push({
                                e1: entity,
                                e2: other
                            })
                        }
                    }
                }
            }
        } else {
            for (let i = this.entities.length - 1; i > 0; i--) {
                for (let j = i - 1; j >= 0; j--) {
                    const pair = {
                        e1: this.entities[i],
                        e2: this.entities[j],
                    };
                    pairs.push(pair);
                }
            }

        }

        return pairs;
    }

    private checkEntityCollision(check: IZIRCollisionCandidate) {
        const { e1, e2 } = check;

        const canCollide = e1.getCollides() && e2.getCollides();
        // Collision is possible if either entity is moving or newly created
        if (Math.abs(e1.getVelocity().getMagnitude()) > 0.1 || e1.isCreating() || Math.abs(e2.getVelocity().getMagnitude()) > 0.1 || e2.isCreating()) {
            for (const zone1 of e1.getHitboxes()) {
                for (const zone2 of e2.getHitboxes()) {
                    ZIRTimer.start("baseCollision", "checkCollision");
                    if (zone1.checkCollision(zone2)) {
                        e1.registerEvent(zone2);
                        e2.registerEvent(zone1);
                        ZIRTimer.stop("baseCollision");
                        ZIRTimer.start("physicalCollision", "checkCollision");
                        if (canCollide && zone1.getTypes().indexOf("collision") !== -1 && zone2.getTypes().indexOf("collision") !== -1) {
                            // Normal vector on e1's boundary at point of collision
                            const direction = zone1.getCollisionVector(zone2);
                            this.resolvePhysicalCollision(e1, e2, direction);
                        }
                        ZIRTimer.stop("physicalCollision");
                    } else {
                        ZIRTimer.stop("baseCollision");
                    }
                }
            }
        }
    }

    private resolvePhysicalCollision(e1: ZIREntity, e2: ZIREntity, overlap: Vector) {
        const velocity1 = e1.getVelocity();
        const velocity2 = e2.getVelocity();
        const mass1 = e1.getMass();
        const mass2 = e2.getMass();
        const direction = overlap.getUnitVector();
        // Find the velocity in the direction of the collision
        const v1Initial = velocity1.dot(direction);
        const v2Initial = velocity2.dot(direction);

        const e1movable = e1.getMovable();
        const e2movable = e2.getMovable();

        let v2Final: number;
        if (e2movable) {
            if (e1movable) {
                v2Final = (mass1 * (2 * v1Initial - v2Initial) + mass2 * v2Initial) / (mass1 + mass2);
            } else {
                v2Final = 2 * v1Initial - v2Initial;
            }
        } else {
            v2Final = v2Initial;
        }

        let v1Final: number;
        if (e1movable) {
            v1Final = v2Final + v2Initial - v1Initial;
        } else {
            v1Final = v1Initial;
        }

        const impulse1 = v1Final - v1Initial;
        const impulse2 = v2Final - v2Initial;

        let e1displacement: Vector = Vector.ZERO_VECTOR;
        let e2displacement: Vector = Vector.ZERO_VECTOR;
        if (e1movable) {
            if (e2movable) {
                e1displacement = overlap.scale(-0.5);
                e2displacement = overlap.scale(0.5);
            } else {
                e1displacement = overlap.scale(-1);
            }
        } else {
            if (e2movable) {
                e2displacement = overlap;
            }
        }

        e1.setPosition(e1.getPosition().add(e1displacement));
        e2.setPosition(e2.getPosition().add(e2displacement));

        const velocity1Final = velocity1.add(direction.scale(impulse1));
        const velocity2Final = velocity2.add(direction.scale(impulse2));

        e1.setVelocity(velocity1Final);
        e2.setVelocity(velocity2Final);
    }

    public getEntities() {
        return this.entities;
    }

    public getTerrainMap() {
        return this.terrain;
    }

    public getWorldID() {
        return this.worldID;
    }

    protected generateWorldTerrain(): IZIRTerrainMap {
        return { zones: [] };
    }
}

export interface IZIRCollisionCandidate {
    e1: ZIREntity;
    e2: ZIREntity;
}
