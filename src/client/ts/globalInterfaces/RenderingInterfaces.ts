interface IZIRRenderable {
    position: Point;
    getImageToRender: () => IZIRAsset;
}

interface IZIRAsset {
    name: string;
    getImage: () => HTMLImageElement;
    isLoaded: () => boolean;
}