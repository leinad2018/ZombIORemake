import { ZIRClientBase } from "../baseObjects/ClientBase";
import { ZIRAssetLoader } from "../AssetLoader";
import { IZIRRenderable, IZIRAsset } from "../globalInterfaces/RenderingInterfaces";
import { Point } from "../globalInterfaces/UtilityInterfaces";

export class ZIRTestClient extends ZIRClientBase {
    private entities: IZIRRenderable[];

    constructor() {
        super();
        this.entities = [];
    }

    public getPlayersOnline() {
        return [];
    }

    public runTest() {
        this.loadTestEntities();
        this.updateObjects();
    }

    public getBackgroundImage() {
        return ZIRAssetLoader.getAsset("grass");
    }

    public getEntitiesToRender() {
        return this.entities;
    }

    private loadTestEntities() {
        for (var i = 0; i < 10; i++) {
            this.entities.push(new TestEntity(20 * i, 5 * i));
        }
    }

}

class TestEntity implements IZIRRenderable {
    public position: Point;
    private asset: IZIRAsset;

    constructor(x: number, y: number) {
        this.position = {
            x: x,
            y: y
        }

        this.asset = ZIRAssetLoader.getAsset("circle");
    }

    getImageToRender() {
        return this.asset;
    }


}