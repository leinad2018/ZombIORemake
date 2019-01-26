import { Point } from "./UtilityInterfaces";

export interface IZIRRenderable {
    getPosition: () => Point;
    getImageToRender: () => IZIRAsset;
    getSize: () => Point;
}

export interface IZIRAsset {
    name: string;
    getImage: () => HTMLImageElement;
    isLoaded: () => boolean;
}