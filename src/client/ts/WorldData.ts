import { IZIRRenderable, IZIRAsset } from "./globalInterfaces/RenderingInterfaces";
import { Vector } from "./utilityObjects/Math";
import { IZIRWorldUpdate, IZIRWorldZone } from "./globalInterfaces/IServerUpdate";
import { ZIRAssetLoader } from "./AssetLoader";

export class ZIRWorldData {
    private tiles: ZIRWorldTile[];
    private readonly TILE_SIZE = 30;

    constructor(world: IZIRWorldUpdate) {
        this.tiles = [];
        for(let zone of world.zones){
            this.fillArea(zone);
        }
    }

    private fillArea(area: IZIRWorldZone) {
        let asset = ZIRAssetLoader.getAsset(area.terrain);
        let xDist = (area.x1 - area.x0) / this.TILE_SIZE;
        let yDist = (area.y1 - area.y0) / this.TILE_SIZE;
        for (let x = 0; x <= xDist; x++) {
            for (let y = 0; y <= yDist; y++) {
                let pos = new Vector(area.x0 + x * this.TILE_SIZE, area.y0 + y * this.TILE_SIZE);
                let size = new Vector(this.TILE_SIZE, this.TILE_SIZE);
                this.tiles.push(new ZIRWorldTile(pos, size, asset));
            }
        }
    }

    public getWorldData(){
        return this.tiles;
    }
}

class ZIRWorldTile implements IZIRRenderable {
    private position: Vector;
    private size: Vector;
    private asset: IZIRAsset;

    constructor(pos: Vector, size: Vector, asset: IZIRAsset) {
        this.position = pos;
        this.size = size;
        this.asset = asset;
    }

    public getPosition() {
        return this.position;
    }

    public getSize() {
        return this.size;
    }

    public getImageToRender() {
        return this.asset;
    }
}