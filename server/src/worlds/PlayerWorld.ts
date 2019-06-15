import { ZIRWorld } from "../baseObjects/World";
import { IZIRTerrainMap, IZIRTerrainZone } from "../globalInterfaces/IServerUpdate";

export class ZIRPlayerWorld extends ZIRWorld {
    constructor(id: string) {
        super(id);
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
