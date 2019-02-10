import { IZIRRenderable } from "./RenderingInterfaces";

/**
 * @deprecated
 */
export interface IPoint {
    x: number;
    y: number;
}

export interface IZIRInventoryStack {
    itemID: string;
    stackSize: number;
    assetName: IZIRRenderable;
}
