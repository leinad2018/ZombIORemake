import { IZIRAsset } from "./globalInterfaces/RenderingInterfaces";
import { ZIRAnimation } from "./Animation";

export class ZIRAssetLoader {
    private static assets: IZIRAsset[] = [];

    /**
     * Registers an asset into the asset loader.
     * @param assetName
     * @param imageUrl
     */
    public static loadAsset(assetName: string, imageUrl: string | string[]) {
        const asset = new ZIRAsset(imageUrl);
        asset.name = assetName;
        this.assets.push(asset);
    }

    /**
     * Returns the asset associated with this name.
     * The asset must be loaded with loadAsset before it can be retrieved from this method.
     * @param assetName
     */
    public static getAsset(assetName: string) {
        const paramIndex = assetName.indexOf("[");
        
        let baseName: string = assetName;
        if(paramIndex !== -1){
            baseName = assetName.substring(0, paramIndex);
        }
        for (const asset of this.assets) {
            if (asset.name === baseName) {
                if (paramIndex !== -1) {
                    return new ZIRAnimation(asset, assetName.substring(paramIndex, assetName.length));
                } else {
                    return asset;
                }
            }
        }
    }

    /**
     * Checks to see if all assets are loaded
     */
    public static doneLoading() {
        let doneLoading = true;
        for (const asset of this.assets) {
            if (!asset.isLoaded()) {
                doneLoading = false;
            }
        }
        return doneLoading;
    }
}

export class ZIRAsset implements IZIRAsset {
    private images: HTMLImageElement[];
    private loaded: boolean;
    private neededImages: number;
    public name: string;

    constructor(imageUrl: string | string[]) {
        this.images = [];
        if (Array.isArray(imageUrl)) {
            for (const url of imageUrl) {
                const image = new Image();
                image.onload = this.handleLoad.bind(this);
                image.src = url;
                this.images.push(image);
            }
        } else {
            const image = new Image();
            image.onload = this.handleLoad.bind(this);
            image.src = imageUrl;
            this.images.push(image);
        }
        this.neededImages = this.images.length;
        this.loaded = false;
    }

    private handleLoad() {
        this.neededImages--;
        if (this.neededImages === 0) {
            this.loaded = true;
        }
    }

    /**
     * Returns the HTMLImageElement if the image is loaded.
     * Otherwise returns null.
     *
     * It is suggested that you call the isLoaded method to make sure the image is loaded before calling getImage.
     */
    public getImage(num: number = 0) {
        if (this.loaded) {
            return this.images[num];
        } else {
            return null;
        }
    }

    /**
     * Gets the number of frames for this asset
     */
    public getLength() {
        return this.images.length;
    }

    /**
     * Checks to see if the image is loaded.
     */
    public isLoaded() {
        return this.loaded;
    }
}
