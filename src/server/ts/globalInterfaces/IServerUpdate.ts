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