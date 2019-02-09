import { IZIRRenderable } from "./RenderingInterfaces";

/**
 * @deprecated
 */
export interface Point {
    x: number;
    y: number;
}

export interface IZIRInventoryStack {
    itemID: string;
    amount: number;
    asset: IZIRRenderable;
}
