import { Point } from "./UtilityInterfaces";

export interface IZIRRenderable {
    getPosition: () => Point;
    getImageToRender: () => IZIRAsset;
}

export interface IZIRAsset {
    name: string;
    getImage: () => HTMLImageElement;
    isLoaded: () => boolean;
}