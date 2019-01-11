export class ZIRAssetLoader {
    private static assets: IZIRAsset[] = [];

    /**
     * Registers an asset into the asset loader.
     * @param assetName 
     * @param imageUrl 
     */
    public static loadAsset(assetName: string, imageUrl: string) {
        this.assets[assetName] = new ZIRAsset(imageUrl);
    }
    
    /**
     * Returns the asset associated with this name.
     * The asset must be loaded with loadAsset before it can be retrieved from this method.
     * @param assetName 
     */
    public static getAsset(assetName: string){
        var asset = this.assets[assetName];
        return asset;
    }

    /**
     * Checks to see if all assets are loaded
     */
    public static doneLoading(){
        var doneLoading = true;
        this.assets.forEach((asset)=>{
            if(!asset.isLoaded()){
                doneLoading = false;
            }
        });
        return doneLoading;
    }
}

class ZIRAsset implements IZIRAsset {
    private image: HTMLImageElement;
    private loaded: boolean;

    constructor(imageUrl: string) {
        this.image = new Image();
        this.image.src = imageUrl;
        this.loaded = false;
        this.image.onload = () => { this.loaded = true; }
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