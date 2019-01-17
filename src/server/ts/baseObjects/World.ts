import { ZIREntity } from "./EntityBase";
import { IZIRTerrainMap } from "../globalInterfaces/IServerUpdate";

export class ZIRWorld {
    private worldID: string;
    private entities: ZIREntity[];
    private terrain: IZIRTerrainMap;

    constructor(id: string) {
        this.worldID = id;
        this.terrain = this.generateWorldTerrain();
    }

    public registerEntity(entity: ZIREntity) {
        this.entities.push(entity);
    }

    public removeEntity(entityID: string): ZIREntity {
        for (let i = 0; i < this.entities.length; i++) {
            let entity = this.entities[i];
            if (entity.getEntityId() == entityID) {
                this.entities.splice(i, 1);
                return entity;
            }
        }
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