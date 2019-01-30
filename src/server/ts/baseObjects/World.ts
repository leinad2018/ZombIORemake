import { ZIREntity } from "./EntityBase";
import { IZIRTerrainMap } from "../globalInterfaces/IServerUpdate";
import { ZIREffectBox } from "./Hitbox";

export class ZIRWorld {
    private worldID: string;
    private terrain: IZIRTerrainMap;
    private entities: ZIREntity[];
    private hurtboxes: ZIREffectBox[];
    private sectorLookup: number[];
    private sectors: ZIRSector[];
    private readonly sectorSize = 500;
    private readonly width;

    constructor(id: string, width: number, height: number) {
        this.worldID = id;
        this.entities = [];
        this.sectors = [];
        this.sectorLookup = [];
        this.hurtboxes = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                this.sectors.push(new ZIRSector());
            }
        }
        this.width = width;
        this.terrain = this.generateWorldTerrain();
    }

    public registerEntity(entity: ZIREntity) {
        let position = entity.getPosition();
        let sectorX = Math.trunc(position.getX() / this.sectorSize);
        let sectorY = Math.trunc(position.getY() / this.sectorSize);
        let sectorID = this.width * sectorY + sectorX;
        this.sectorLookup[entity.getEntityId()] = sectorID;
        this.sectors[sectorID].addEntity(entity);
        this.entities.push(entity);
    }

    public removeEntity(entityID: string): ZIREntity {
        for (let i = 0; i < this.entities.length; i++) {
            let entity = this.entities[i];
            if (entity.getEntityId() == entityID) {
                let sectorID = this.sectorLookup[entityID];
                this.sectors[sectorID].removeEntity(entityID);
                delete this.sectorLookup[entityID];
                this.entities.splice(i, 1);
                return entity;
            }
        }
    }

    public sortEntities() {
        for (let entity of this.entities) {
            if (Math.abs(entity.getVelocity().getMagnitude()) > 0.1) {
                let entityID = entity.getEntityId();
                let currentSectorID: number = this.sectorLookup[entityID];
                let position = entity.getPosition();
                let sectorX = Math.trunc(position.getX() / this.sectorSize);
                let sectorY = Math.trunc(position.getY() / this.sectorSize);
                let newSectorID = this.width * sectorY + sectorX;
                if (newSectorID != currentSectorID) {
                    this.sectorLookup[entityID] = newSectorID;
                    let curSector = this.sectors[currentSectorID];
                    curSector.removeEntity(entityID);
                    let newSector = this.sectors[newSectorID];
                    newSector.addEntity(entity);
                }
            }
        }
    }

    public runCollisionLogic() {
        for (let entity of this.entities) {
            if (Math.abs(entity.getVelocity().getMagnitude()) > 0.1) {
                let baseSectorID = this.getSectorIDByEntity(entity);
                let sectorsToCheck = this.getThreeByThreeGridOfSectorsByInnerSectorID(baseSectorID);
                let entitiesToCheck = this.getEntitiesBySectorIDs(sectorsToCheck);
                for (let check of entitiesToCheck) {
                    for (let zone1 of check.getHitbox()) {
                        for (let zone2 of entity.getHitbox()) {
                            if (zone1.checkCollision(zone2)) {
                                entity.registerEvent(zone1);
                                check.registerEvent(zone2);
                            }
                        }
                    }
                }
            }
        }
        for (let hurtbox of this.hurtboxes) {
            if (hurtbox.isMoving()) {
                let entity = hurtbox.getParent();
                let baseSectorID = this.getSectorIDByEntity(entity);
                let sectorsToCheck = this.getThreeByThreeGridOfSectorsByInnerSectorID(baseSectorID);
                let entitiesToCheck = this.getEntitiesBySectorIDs(sectorsToCheck);
                for (let check of entitiesToCheck) {
                    for (let hitbox of check.getHitbox()) {
                        if (hurtbox.checkCollision(hitbox)) {
                            entity.registerEvent(hitbox);
                            check.registerEvent(hurtbox);
                            break;
                        }
                    }
                }
            }
        }
    }

    private getSectorIDByEntity(entity: ZIREntity) {
        return this.sectorLookup[entity.getEntityId()];
    }

    private getThreeByThreeGridOfSectorsByInnerSectorID(sector: number) {
        let sectors: ZIRSector[] = [];
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
        let toReturn: ZIREntity[] = [];
        for (let sector of sectors) {
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

    public destroyEntity(entity: ZIREntity) {
        let entityIndex = this.entities.indexOf(entity);
        if (entityIndex !== -1) this.entities.splice(entityIndex, 1);
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
        for (var i = 0; i < this.entities.length; i++) {
            if (this.entities[i].getEntityId() == entityID) {
                this.entities.splice(i, 1);
            }
        }
    }

    public getAllEntities() {
        return this.entities;
    }
}