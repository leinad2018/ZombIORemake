import { Vector } from "../utilityObjects/Math";

export interface IZIRRenderable {
    getPosition: () => Vector;
    getImageToRender: () => IZIRAsset;
    getSize: () => Vector;
}

export interface IZIRAsset {
    name: string;
    getImage: (num?: number) => HTMLImageElement;
    getLength: () => number;
    isLoaded: () => boolean;
}
