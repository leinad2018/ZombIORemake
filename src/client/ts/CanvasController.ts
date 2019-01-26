import { IZIRServerUpdate } from "./globalInterfaces/IServerUpdate";
import { IZIRAsset, IZIRRenderable } from "./globalInterfaces/RenderingInterfaces";
import { ZIRClientBase } from "./baseObjects/ClientBase";
import { Point } from "./globalInterfaces/UtilityInterfaces";

export class ZIRCanvasController {
    private canvas: HTMLCanvasElement;
    private DEBUG_RENDER: boolean = true;
    private playerPosition: Point;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        window.addEventListener("resize", this.handleResize.bind(this));
        this.playerPosition = { x: 0, y: 0 };
        this.resizeWindow();
    }

    /**
     * Transforms a rendering coordinate to a
     * player-relative coordinate
     * @param cursorPoint 
     */
    public transformRenderToPlayer(cursorPoint : Point) : Point {
        return {
            x: cursorPoint.x - this.canvas.width/2,
            y: cursorPoint.y - this.canvas.height/2
        }
    }

    public render(state : ZIRClientBase) {
        this.playerPosition = state.getPlayerPosition();
        let ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');

        let background: IZIRAsset = state.getBackgroundImage();
        this.renderBackground(ctx, background);

        let worldData: IZIRRenderable[] = state.getWorldData();
        this.renderWorld(ctx, worldData);

        let entities: IZIRRenderable[] = state.getEntitiesToRender();
        this.renderEntities(ctx, entities);

        this.renderPlayerBox(ctx, state.getPlayersOnline());
        if (this.DEBUG_RENDER) this.renderDebugBox(ctx, state.getDebugMessages());
    }

    private renderWorld(ctx: CanvasRenderingContext2D, worldData: IZIRRenderable[]) {
        this.renderEntities(ctx, worldData);
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
        let offsetX = this.playerPosition.x % bkWidth;
        let offsetY = this.playerPosition.y % bkHeight;

        ctx.setTransform(1, 0, 0, 1, -offsetX, -offsetY);
        ctx.fillRect(-bkWidth, -bkHeight, this.canvas.width + bkWidth * 2, this.canvas.height + bkHeight * 2);
        ctx.restore();
    }

    private renderEntities(ctx: CanvasRenderingContext2D, entities: IZIRRenderable[]) {
        let xOffset = this.canvas.width / 2 - this.playerPosition.x;
        let yOffset = this.canvas.height / 2 - this.playerPosition.y;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, xOffset, yOffset);

        for (let entity of entities) {
            let asset = entity.getImageToRender();
            let position = entity.getPosition();
            let x = position.x - asset.getImage().width / 2;
            let y = position.y - asset.getImage().height / 2;
            ctx.drawImage(asset.getImage(), x, y);
        }

        ctx.restore();
    }

    public resizeWindow() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight - 5;
    }

    public getDimensions() : Point {
        return({x: this.canvas.width, y: this.canvas.height})
    }

    private handleResize(this: ZIRCanvasController) {
        this.resizeWindow();
    }
}