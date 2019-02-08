import { IZIRServerUpdate } from "./globalInterfaces/IServerUpdate";
import { IZIRAsset, IZIRRenderable } from "./globalInterfaces/RenderingInterfaces";
import { ZIRClientBase } from "./baseObjects/ClientBase";
import { Vector } from "./utilityObjects/Math";
import { ZIREntityBase } from "./baseObjects/EntityBase"
import { ZIRAssetLoader } from "./AssetLoader";

export class ZIRCanvasController {
    private canvas: HTMLCanvasElement;
    private shouldRenderDebug: boolean = true;
    private playerPosition: Vector;
    private terrainCache: ZIRImageCache;
    private heartSize: Vector = new Vector(50, 50);
    private hudAssets: { [name: string]: IZIRAsset } = {};

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        window.addEventListener("resize", this.handleResize.bind(this));
        this.playerPosition = new Vector(0, 0);
        this.resizeWindow();
    }

    /**
     * Transforms a rendering coordinate to a
     * player-relative coordinate
     * @param cursorPoint 
     */
    public transformRenderToPlayer(cursorPoint: Vector): Vector {
        return new Vector(cursorPoint.getX() - this.canvas.width / 2, cursorPoint.getY() - this.canvas.height / 2);
    }

    public addHudAsset(name: string, asset: IZIRAsset) {
        this.hudAssets[name] = asset;
    }

    public render(state: ZIRClientBase) {
        this.shouldRenderDebug = state.isDebugMode();
        this.playerPosition = state.getPlayerPosition();
        let ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');

        let background: IZIRAsset = state.getBackgroundImage();
        this.renderBackground(ctx, background);

        this.renderWorld(ctx);

        let entities: IZIRRenderable[] = state.getEntitiesToRender();
        this.renderEntities(ctx, entities);
        this.renderHUD(ctx, state.getPlayerHealth())

        this.renderPlayerBox(ctx, state.getPlayersOnline());
        //if (this.shouldRenderDebug) this.renderDebugBox(ctx, state.getDebugMessages());
    }

    private renderHUD(ctx: CanvasRenderingContext2D, health) {
        let i = 0
        for (i; i < health; i++) {
            ctx.drawImage(this.hudAssets["health"].getImage(), i * 50 + i * 5, 0, this.heartSize.getX(), this.heartSize.getY());
        }
    }

    private renderWorld(ctx: CanvasRenderingContext2D) {
        let xOffset = this.canvas.width / 2 - this.playerPosition.getX() + this.terrainCache.xOffset;
        let yOffset = this.canvas.height / 2 - this.playerPosition.getY() + this.terrainCache.yOffset;
        ctx.drawImage(this.terrainCache, xOffset, yOffset);
    }

    private renderPlayerBox(ctx: CanvasRenderingContext2D, players: string[]) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(this.canvas.width - 150, 0, 150, players.length * 10 + 30);
        ctx.fillStyle = "white";
        ctx.fillText("Players Online:\n", this.canvas.width - 145, 15);
        for (let i = 0; i < players.length; i++) {
            ctx.fillText(players[i], this.canvas.width - 145, 25 + i * 10);
        }

        ctx.restore();
    }

    private renderDebugBox(ctx: CanvasRenderingContext2D, messages: string[]) {
        let boxHeight = (messages.length * 10) + 30;
        let vOffset = this.canvas.height - boxHeight;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, vOffset, this.canvas.width, boxHeight);
        ctx.fillStyle = "white";
        ctx.fillText("Debug:\n", 5, vOffset + 15);
        for (let i = 0; i < messages.length; i++) {
            ctx.fillText(messages[i], 5, vOffset + 25 + i * 10);
        }

        ctx.restore();
    }

    private renderBackground(ctx: CanvasRenderingContext2D, image: IZIRAsset) {
        ctx.save();
        let background = image.getImage();
        let pattern = ctx.createPattern(background, 'repeat');
        ctx.fillStyle = pattern;

        let bkWidth = background.width;
        let bkHeight = background.height;
        let offsetX = this.playerPosition.getX() % bkWidth;
        let offsetY = this.playerPosition.getY() % bkHeight;

        ctx.setTransform(1, 0, 0, 1, -offsetX, -offsetY);
        ctx.fillRect(-bkWidth, -bkHeight, this.canvas.width + bkWidth * 2, this.canvas.height + bkHeight * 2);
        ctx.restore();
    }

    private renderEntities(ctx: CanvasRenderingContext2D, entities: IZIRRenderable[]) {
        let xOffset = this.canvas.width / 2 - this.playerPosition.getX();
        let yOffset = this.canvas.height / 2 - this.playerPosition.getY();

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, xOffset, yOffset);

        for (let entity of entities) {
            let position = entity.getPosition();
            let size = entity.getSize();
            let xs = size.getX();
            let ys = size.getY();
            let x = position.getX() - xs / 2;
            let y = position.getY() - ys / 2;

            let minX = x - xs + xOffset;
            let minY = y - ys + yOffset;
            let maxX = x + xs + xOffset;
            let maxY = y + ys + yOffset;
            if (maxX > 0 && maxY > 0 && minX < this.canvas.width && minY < this.canvas.height) {
                let asset = entity.getImageToRender();
                ctx.drawImage(asset.getImage(), x, y, xs, ys);
                if (entity instanceof ZIREntityBase) {
                    if (entity.getName()) {
                        ctx.fillText(entity.getName(), x, y - 5);
                    }
                }
            }
        }

        ctx.restore();
    }

    public createTerrainCache(worldData: IZIRRenderable[]) {
        if (worldData.length > 0) {
            let firstPos = worldData[0].getPosition();
            let firstSize = worldData[0].getSize();
            let minX: number = firstPos.getX();
            let maxX: number = firstPos.add(firstSize).getX();
            let minY: number = firstPos.getY();
            let maxY: number = firstPos.add(firstSize).getY();
            for (let i = 1; i < worldData.length; i++) {
                let position = worldData[i].getPosition();
                let otherCorner = position.add(worldData[i].getSize());
                minX = Math.min(minX, position.getX());
                minY = Math.min(minY, position.getY());
                maxX = Math.max(maxX, otherCorner.getX());
                maxY = Math.max(maxY, otherCorner.getY());
            }
            let canvasWidth = maxX - minX;
            let canvasHeight = maxY - minY;
            this.terrainCache = this.createImageCache(canvasWidth, canvasHeight, minX, minY);
            let cacheCtx = this.terrainCache.getContext('2d');
            for (let data of worldData) {
                let pos = data.getPosition();
                let size = data.getSize();
                cacheCtx.drawImage(data.getImageToRender().getImage(), pos.getX() - minX, pos.getY() - minY, size.getX(), size.getY());
            }
        }
    }

    private createImageCache(x: number, y: number, xOffset: number, yOffset: number) {
        let canvas = document.createElement('canvas') as ZIRImageCache;
        canvas.setAttribute('width', x + '');
        canvas.setAttribute('height', y + '');
        canvas.xOffset = xOffset;
        canvas.yOffset = yOffset;
        return canvas;
    }

    public resizeWindow() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight - 5;
    }

    public getDimensions(): Vector {
        return (new Vector(this.canvas.width, this.canvas.height));
    }

    private handleResize(this: ZIRCanvasController) {
        this.resizeWindow();
    }
}

interface ZIRImageCache extends HTMLCanvasElement {
    xOffset: number;
    yOffset: number;
}