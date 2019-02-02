import { ZIRWorld } from "./baseObjects/World";
import { IZIRTerrainMap, IZIRTerrainZone } from "./globalInterfaces/IServerUpdate";

export class ZIRPlayerWorld extends ZIRWorld{
    constructor(id: string){
        super(id, 50, 50);
    }

    protected generateWorldTerrain(): IZIRTerrainMap{
        let map: IZIRTerrainMap = {
            zones: []
        }
        let snowBiome: IZIRTerrainZone = {
            terrain: 'snow',
            x0: 500,
            y0: 500,
            x1: 5000,
            y1: 5000
        }
        map.zones.push(snowBiome);
        return map;
    }
}