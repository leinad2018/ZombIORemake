import { IZIRServerUpdate } from "./globalInterfaces/IServerUpdate";
import { IZIRClient } from "./globalInterfaces/MainInterfaces";
import { IZIRAsset, IZIRRenderable } from "./globalInterfaces/RenderingInterfaces";
import { createContext } from "vm";

export class ZIRCanvasController implements IZIRServerUpdate {
    private canvas: HTMLCanvasElement;
    private client: IZIRClient;

    constructor(canvas: HTMLCanvasElement, client: IZIRClient) {
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

        var entities: IZIRRenderable[] = this.client.getEntitiesToRender();
        this.renderEntities(ctx, entities);
        this.renderPlayerBox(ctx, this.client.getPlayersOnline());
    }

    private renderPlayerBox(ctx: CanvasRenderingContext2D, players: string[]) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, 150, players.length*10+30);
        ctx.fillStyle = "white";
        ctx.fillText("Players Online:\n",5,15);
        for(var i = 0; i < players.length; i++) {
            ctx.fillText(players[i],5,25+i*10);
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