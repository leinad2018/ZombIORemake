export class QuadtreeDisplay {
    protected canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.canvas.width = 500;
        this.canvas.height = 500;
    }

    public render(data: any) {
        const ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.recursiveRender(ctx, data, 0, 0, this.canvas.width, this.canvas.height);

    }

    public recursiveRender(ctx: CanvasRenderingContext2D, node: any, x, y, w, h) {
        ctx.strokeRect(x, y, w, h);
        if(node.entities) {
            for(let entity of node.entities) {
                ctx.fillRect(((entity.pos.x + 5000)/10000) * this.canvas.width, ((entity.pos.y + 5000)/10000) * this.canvas.height, 5, 5);
            }
        }

        if (node.tl) {
            this.recursiveRender(ctx, node.tl, x, y, w/2, h/2);
        }
        if (node.tr) {
            this.recursiveRender(ctx, node.tr, x + w/2, y, w/2, h/2);
        }
        if (node.bl) {
            this.recursiveRender(ctx, node.bl, x, y + h/2, w/2, h/2);
        }
        if (node.br) {
            this.recursiveRender(ctx, node.br, x + h/2, y + h/2, w/2, h/2);
        }
    }
}