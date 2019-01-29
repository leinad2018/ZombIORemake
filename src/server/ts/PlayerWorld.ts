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
            x0: 0,
            y0: 0,
            x1: 300,
            y1: 500
        }
        map.zones.push(snowBiome);
        return map;
    }
}