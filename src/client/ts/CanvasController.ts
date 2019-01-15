import { IZIRServerUpdate } from "./globalInterfaces/IServerUpdate";
import { IZIRAsset, IZIRRenderable } from "./globalInterfaces/RenderingInterfaces";
import { ZIRClientBase } from "./baseObjects/ClientBase";

export class ZIRCanvasController implements IZIRServerUpdate {
    private canvas: HTMLCanvasElement;
    private client: ZIRClientBase;
    private DEBUG_RENDER: boolean = true;

    constructor(canvas: HTMLCanvasElement, client: ZIRClientBase) {
        this.canvas = canvas;
        window.addEventListener("resize", this.handleResize.bind(this));
        this.client = client;
        this.resizeWindow();
        this.render();
        this.client.registerUpdateHandler(this);
    }

    /**
     * Updates the canvas when new information is sent from the server
     */
    public onServerUpdate() {
        this.render();
    }

    private render() {
        var ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');

        var background: IZIRAsset = this.client.getBackgroundImage();
        this.renderBackground(ctx, background);

        let playerPosition = this.client.getPlayerPosition();
        let xOffset = playerPosition.x - this.canvas.width / 2;
        let yOffset = playerPosition.y - this.canvas.height / 2;

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, xOffset, yOffset);

        var entities: IZIRRenderable[] = this.client.getEntitiesToRender();
        this.renderEntities(ctx, entities);
        ctx.restore();

        this.renderPlayerBox(ctx, this.client.getPlayersOnline());
        if (this.DEBUG_RENDER) this.renderDebugBox(ctx, this.client.getDebugMessages());
    }

    private renderPlayerBox(ctx: CanvasRenderingContext2D, players: string[]) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(this.canvas.width - 150, 0, 150, players.length * 10 + 30);
        ctx.fillStyle = "white";
        ctx.fillText("Players Online:\n", this.canvas.width - 145, 15);
        for (var i = 0; i < players.length; i++) {
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
        for (var i = 0; i < messages.length; i++) {
            ctx.fillText(messages[i], 5, vOffset + 25 + i * 10);
        }

        ctx.restore();
    }

    private renderBackground(ctx: CanvasRenderingContext2D, image: IZIRAsset) {
        ctx.save();
        var background = image.getImage();
        var pattern = ctx.createPattern(background, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.restore();
    }

    private renderEntities(ctx: CanvasRenderingContext2D, entities: IZIRRenderable[]) {
        for (var entity of entities) {
            var asset = entity.getImageToRender();
            var position = entity.getPosition();
            ctx.drawImage(asset.getImage(), position.x, position.y);
        }
    }

    public resizeWindow() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight - 5;
        this.client.setViewSize(this.canvas.width, this.canvas.height);
    }

    private handleResize(this: ZIRCanvasController) {
        this.resizeWindow();
        this.render();
    }
}