interface IZIRRenderable {
    position: Point;
    getImageToRender: () => IZIRAsset;
}

interface IZIRAsset {
    getImage: () => HTMLImageElement;
    isLoaded: () => boolean;
}