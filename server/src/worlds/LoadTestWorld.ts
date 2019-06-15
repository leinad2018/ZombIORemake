import {ZIRWorld} from "../baseObjects/World";
import {ZIREntity} from "../baseObjects/EntityBase";
import {ZIRResourceNode} from "../entities/ResourceNode";
import {Vector} from "../utilityObjects/Math";
import {ZIREnemy} from "../entities/mobs/Enemy";
import {IZIRTerrainMap, IZIRTerrainZone} from "../globalInterfaces/IServerUpdate";

export class ZIRLoadTestWorld extends ZIRWorld {

    constructor(id: string) {
        super(id);
        const resource = new ZIRResourceNode(new Vector(1500, 1500), new Vector(50, 50), "rock", "rock");
        const resource2 = new ZIRResourceNode(new Vector(1500, 2500), new Vector(50, 50), "rock", "rock");
        this.registerEntity(resource);
        this.registerEntity(resource2);

        // const testEntities = this.generateStationaryEntityGrid(1000);
        const testEntities = this.generateRandomEntities(1000);
        
        for(let entity of testEntities) {
            this.registerEntity(entity);
        }
    }

    private generateStationaryEntityGrid(size: number = 50): ZIREntity[] {
        const WORLD_SIZE = 10000
        const entities = []
        let toGenerate = size;
        for(let x = -WORLD_SIZE/2; x < WORLD_SIZE/2; x+=WORLD_SIZE/Math.sqrt(size)) {
            for(let y = -WORLD_SIZE/2; y < WORLD_SIZE/2; y+=WORLD_SIZE/Math.sqrt(size)) {
                if(toGenerate > 0) {
                    entities.push(new ZIREnemy(new Vector(x, y)));
                    toGenerate--;
                    console.log(x + ", " + y);
                }
            }
        }
        return entities;
    }

    private generateRandomEntities(size: number = 50): ZIREntity[] {
        const WORLD_SIZE = 5000;
        const entities = []
        let toGenerate = size;
        while(toGenerate > 0) {
            const x = (Math.random() * WORLD_SIZE) - WORLD_SIZE/2;
            const y = (Math.random() * WORLD_SIZE) - WORLD_SIZE/2;
            entities.push(new ZIREnemy(new Vector(x, y)));
            toGenerate--;
        }
        return entities;
    }

    protected generateWorldTerrain(): IZIRTerrainMap {
        const map: IZIRTerrainMap = {
            zones: [],
        };

        const snowBiome: IZIRTerrainZone = {
            terrain: "snow",
            x0: 500,
            x1: 5000,
            y0: 500,
            y1: 5000,
        };
        map.zones.push(snowBiome);
        return map;
    }
}
