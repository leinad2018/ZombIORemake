import { IZIRAsset } from "./globalInterfaces/RenderingInterfaces";

export class ZIRAnimation implements IZIRAsset {
    private asset: IZIRAsset;
    private currentFrame: number;
    private currentTime: number;
    private animationTimes: number[];
    public name: string;

    constructor(asset: IZIRAsset, times: string) {
        this.name = asset.name;
        this.asset = asset;
        this.currentFrame = 0;
        this.parseTimings(times);
    }

    private parseTimings(times: string) {
        this.animationTimes = []
        //Remove the brackets at the beginning and the end then parse each element to an number
        const numericTimes = times.substring(1, times.length - 1).split(",").map(s => parseInt(s));
        const length = this.getLength();
        const maxIndex = numericTimes.length - 1;
        for (let i = 0; i < length; i++) {
            if (i > maxIndex) {
                this.animationTimes[i] = numericTimes[0];
            } else {
                this.animationTimes[i] = numericTimes[i];
            }
        }
        this.currentTime = this.animationTimes[this.currentFrame];
    }

    public getImage(num: number = -1) {
        if (num === -1) {
            const img = this.asset.getImage(this.currentFrame);
            if (this.currentTime === 0) {
                this.currentFrame = (this.currentFrame + 1) % this.getLength();
                this.currentTime = this.animationTimes[this.currentFrame];
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