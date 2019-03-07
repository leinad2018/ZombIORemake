import { IZIRAsset } from "./globalInterfaces/RenderingInterfaces";

export class ZIRAnimation implements IZIRAsset {
    private asset: IZIRAsset;
    private currentFrame: number;
    private currentTime: number;
    private animationTime: number;
    public name: string;

    constructor(asset: IZIRAsset, time: number) {
        this.asset = asset;
        this.currentFrame = 0;
        this.animationTime = time;
        this.currentTime = time;
        this.name = asset.name;
    }

    public getImage(num: number = -1) {
        if (num === -1) {
            const img = this.asset.getImage(this.currentFrame);
            if (this.currentTime === 0) {
                this.currentFrame = (this.currentFrame + 1) % this.getLength();
                this.currentTime = this.animationTime;
            } else {
                this.currentTime--;
            }
            return img;
        } else {
            return this.asset.getImage(num);
        }
    }

    public getLength() {
        return this.asset.getLength();
    }

    public isLoaded() {
        return this.asset.isLoaded();
    }
}