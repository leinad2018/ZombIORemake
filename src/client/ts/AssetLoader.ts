import { IZIRAsset } from "./globalInterfaces/RenderingInterfaces";

export class ZIRAssetLoader {
    private static assets: IZIRAsset[] = [];

    /**
     * Registers an asset into the asset loader.
     * @param assetName 
     * @param imageUrl 
     */
    public static loadAsset(assetName: string, imageUrl: string) {
        var asset = new ZIRAsset(imageUrl);
        asset.name = assetName;
        this.assets.push(asset);
    }

    /**
     * Returns the asset associated with this name.
     * The asset must be loaded with loadAsset before it can be retrieved from this method.
     * @param assetName 
     */
    public static getAsset(assetName: string) {
        for (var asset of this.assets) {
            if (asset.name == assetName) {
                return asset;
            }
        }
    }

    /**
     * Checks to see if all assets are loaded
     */
    public static doneLoading() {
        var doneLoading = true;
        for (var asset of this.assets) {
            if (!asset.isLoaded()) {
                doneLoading = false;
            }
        }
        return doneLoading;
    }
}

class ZIRAsset implements IZIRAsset {
    private image: HTMLImageElement;
    private loaded: boolean;
    public name: string;

    constructor(imageUrl: string) {
        this.image = new Image();
        this.loaded = false;
        this.image.onload = this.handleLoad.bind(this);
        this.image.src = imageUrl;
    }

    private handleLoad() {
        this.loaded = true;
    }

    /**
     * Returns the HTMLImageElement if the image is loaded.
     * Otherwise returns null.
     * 
     * It is suggested that you call the isLoaded method to make sure the image is loaded before calling getImage.
     */
    public getImage() {
        if (this.loaded) {
            return this.image;
        } else {
            return null;
        }
    }

    /**
     * Checks to see if the image is loaded.
     */
    public isLoaded() {
        return this.loaded;
    }
}