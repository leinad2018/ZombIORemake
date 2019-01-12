import { IZIRServerUpdate } from "./globalInterfaces/IServerUpdate";
import { IZIRClient } from "./globalInterfaces/MainInterfaces";
import { IZIRAsset, IZIRRenderable } from "./globalInterfaces/RenderingInterfaces";

export class ZIRCanvasController implements IZIRServerUpdate {
    private canvas: HTMLCanvasElement;
    private client: IZIRClient;

    constructor(canvas: HTMLCanvasElement, client: IZIRClient) {
        this.canvas = canvas;
        window.addEventListener("resize", this.handleResize.bind(this));
        this.client = client;
        this.resizeWindow();
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

        var entities: IZIRRenderable[] = this.client.getEntitiesToRender();
        this.renderEntities(ctx, entities);
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
            ctx.drawImage(asset.getImage(), entity.position.x, entity.position.y);
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