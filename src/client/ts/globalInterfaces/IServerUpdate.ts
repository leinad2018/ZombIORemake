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
    id: string;
    asset: string;
    x: number;
    y: number;
    xsize: number;
    ysize: number;
}

export interface IZIREntityUpdateResult extends IZIREntityResult{
    type: string;
}

export interface IZIRWorldUpdate {
    zones: IZIRWorldZone[];
}

export interface IZIRWorldZone {
    terrain: string;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}