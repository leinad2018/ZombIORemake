export interface IZIRServerUpdate {
    onServerUpdate: () => void;
}

export interface IZIRResetResult {
    entities: IZIREntityResult[];
}

export interface IZIRUpdateResult {
    updates: IZIREntityUpdateResult[];
}

export interface IZIREntityResult {
    id: number;
    asset: string;
    x: number;
    y: number;
}

export interface IZIREntityUpdateResult extends IZIREntityResult{
    type: string;
}

export interface IZIRTerrainMap {
    zones: IZIRTerrainZone[];
}

export interface IZIRTerrainZone {
    terrain: string;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}