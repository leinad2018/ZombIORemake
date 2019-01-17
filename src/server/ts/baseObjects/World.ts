import { ZIREntity } from "./EntityBase";

export class World {
    private entities: ZIREntity[];

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
}