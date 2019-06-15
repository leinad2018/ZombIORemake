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

export interface IZIRFormattedChatText {
    content: string;
    bold: boolean;
    italics: boolean;
    color: string;
}
