import { Point } from "./UtilityInterfaces";

export interface IZIRRenderable {
    position: Point;
    getImageToRender: () => IZIRAsset;
}

export interface IZIRAsset {
    name: string;
    getImage: () => HTMLImageElement;
    isLoaded: () => boolean;
}