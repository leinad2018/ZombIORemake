import { ZIREntity } from "./EntityBase";
import { IZIRTerrainMap } from "../globalInterfaces/IServerUpdate";
import { Vector } from "../utilityObjects/Math";
import { ZIRResourceNode } from "../entities/ResourceNode";
import { ZIRPlayer } from "../entities/mobs/Player";

export class ZIRWorld {
    private worldID: string;
    private terrain: IZIRTerrainMap;
    private entities: ZIREntity[];
    private sectorLookup: number[];
    private sectors: ZIRSector[];
    private readonly sectorSize = 500;
    private readonly width;
    private readonly height;

    constructor(id: string, width: number, height: number) {
        this.worldID = id;
        this.entities = [];
        this.sectors = [];
        this.sectorLookup = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.sectors.push(new ZIRSector());
            }
        }
        this.width = width;
        this.height = height;
        this.terrain = this.generateWorldTerrain();
        const resource = new ZIRResourceNode(new Vector(1500, 1500), new Vector(50, 50), "rock", "rock");
        this.registerEntity(resource);
    }

    public getSectorIdByPosition(position: Vector): number {

        const sectorX = Math.trunc(position.getX() / this.sectorSize);
        const sectorY = Math.trunc(position.getY() / this.sectorSize);

        if (sectorX >= this.width || sectorX < 1) {
            return -1;
        }
        if (sectorY >= this.height || sectorY < 1) {
            return -1;
        }

        return this.width * sectorY + sectorX;
    }

    public registerEntity(entity: ZIREntity) {
        const position = entity.getPosition();
        const sectorID = this.getSectorIdByPosition(position);
        if (sectorID === -1) {
            entity.kill();
            return;
        }
        this.sectorLookup[entity.getEntityId()] = sectorID;
        this.sectors[sectorID].addEntity(entity);
        this.entities.push(entity);
    }

    public removeEntity(entityID: string): ZIREntity {
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            if (entity.getEntityId() === entityID) {
                const sectorID = this.sectorLookup[entityID];
                this.sectors[sectorID].removeEntity(entityID);
                delete this.sectorLookup[entityID];
                this.entities.splice(i, 1);
                return entity;
            }
        }
    }

    public sortEntities() {
        for (const entity of this.entities) {
            if (true) {// Math.abs(entity.getVelocity().getMagnitude()) > 0.1) {
                if (!(entity instanceof ZIRPlayer)) {
                    entity.kill();
                }
                return;
                const entityID = entity.getEntityId();
                const currentSectorID: number = this.sectorLookup[entityID];
                const position = entity.getPosition();

                const newSectorID = this.getSectorIdByPosition(position);
                if (newSectorID === -1) {
                    entity.kill();
                    return;
                }

                if (newSectorID !== currentSectorID) {
                    this.sectorLookup[entityID] = newSectorID;
                    const curSector = this.sectors[currentSectorID];
                    curSector.removeEntity(entityID);
                    const newSector = this.sectors[newSectorID];
                    newSector.addEntity(entity);
                }
            }
        }
    }

    public async runCollisionLogic() {
        this.sortEntities();
        const checks: Array<Promise<void>> = [];
        for (const entity of this.entities) {
            checks.push(this.checkEntityCollision(entity));
        }
        await Promise.all(checks);
        for (const entity of this.entities) {
            entity.runEvents();
            entity.setCreating(false);
        }
    }

    private async checkEntityCollision(entity: ZIREntity) {
        if (Math.abs(entity.getVelocity().getMagnitude()) > 0.1 || entity.isCreating()) {
            const baseSectorID = this.getSectorIDByEntity(entity);
            const sectorsToCheck = this.getThreeByThreeGridOfSectorsByInnerSectorID(baseSectorID);
            const entitiesToCheck = this.getEntitiesBySectorIDs(sectorsToCheck);
            for (const check of entitiesToCheck) {
                for (const zone1 of check.getHitboxes()) {
                    for (const zone2 of entity.getHitboxes()) {
                        if (zone1.checkCollision(zone2)) {
                            entity.registerEvent(zone1);
                            check.registerEvent(zone2);
                        }
                    }
                }
            }
        }
        for (const eventEntity of this.entities) {
            eventEntity.runEvents();
            eventEntity.setCreating(false);
        }
    }

    private getSectorIDByEntity(entity: ZIREntity) {
        return this.sectorLookup[entity.getEntityId()];
    }

    private getThreeByThreeGridOfSectorsByInnerSectorID(sector: number) {
        const sectors: ZIRSector[] = [];
        let base = sector - this.width;
        for (let i = 0; i < 3; i++) {
            for (let offset = -1; offset < 2; offset++) {
                sectors.push(this.sectors[base + offset]);
            }
            base += this.width;
        }
        return sectors;
    }

    private getEntitiesBySectorIDs(sectors: ZIRSector[]) {
        const toReturn: ZIREntity[] = [];
        for (const sector of sectors) {
            toReturn.push.apply(toReturn, sector.getAllEntities());
        }
        return toReturn;
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

export class ZIRSector {
    private entities: ZIREntity[];

    constructor() {
        this.entities = [];
    }

    public addEntity(entity: ZIREntity) {
        this.entities.push(entity);
    }

    public removeEntity(entityID: string) {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].getEntityId() === entityID) {
                this.entities.splice(i, 1);
            }
        }
    }

    public getAllEntities() {
        return this.entities;
    }
}
