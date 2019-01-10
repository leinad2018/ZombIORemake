export class ZIRCanvasController implements IZIRServerUpdate {
    private canvas: HTMLCanvasElement;
    private client: IZIRClient;

    constructor(canvas: HTMLCanvasElement, client: IZIRClient) {
        this.canvas = canvas;
        var customWindow = window as CustomWindow;
        customWindow.addEventListener("resize", this.handleResize);
        customWindow.canvasController = this;
        this.resizeWindow();
        this.client = client;
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

        var background: string = this.client.getBackgroundImage();
        this.renderBackground(ctx, background);
    }

    private renderBackground(ctx: CanvasRenderingContext2D, imageUrl: string) {
        ctx.save();
        var background: HTMLImageElement = new Image();
        background.src = imageUrl;
        background.onload = () => {
            var pattern = ctx.createPattern(background, 'repeat');
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
        }
    }

    public resizeWindow() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight - 5;
    }

    private handleResize(this: CustomWindow) {
        this.canvasController.resizeWindow();
        this.canvasController.render();
    }
}

interface CustomWindow extends Window {
    canvasController: ZIRCanvasController;
}