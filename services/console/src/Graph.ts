import { ZIRPoint, ZIRDataStream } from "./Data";

export class ZIRGraph {
    private canvas: HTMLCanvasElement;
    private id: string;
    private data: ZIRDataStream;

    constructor(name: string, data: ZIRDataStream) {
        this.data = data;
        this.id = name;
        const canvas = document.createElement('canvas');
        canvas.id = name;
        canvas.width = name == "tick" ? 600 : 300;
        canvas.height = name == "tick" ? 400 : 200;
        canvas.style.zIndex = "8";
        //canvas.style.position = "absolute";
        canvas.style.border = "1px solid";
        this.canvas = canvas;
    }

    public render() {
        let renderData = this.data;
        renderData = renderData.normalizeToTick();
        renderData = renderData.scaleY(this.canvas.height * .50 * -1);
        renderData = renderData.scaleX(this.canvas.width * .75);
        renderData = renderData.sort();
        const ctx = this.canvas.getContext("2d");

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw main line graph
        const lineOffset = this.canvas.height * .75
        ctx.beginPath();
        ctx.moveTo(renderData.points[0].x, renderData.points[0].y + lineOffset);
        for(let point of renderData.points) {
            ctx.lineTo(point.x, (point.y + lineOffset));
        }
        ctx.stroke();

        // Draw latest point indicator
        ctx.beginPath();
        const latestY = renderData.points[renderData.points.length-1].y
        const renderLatestY = this.data.points[this.data.points.length-1].y
        ctx.moveTo(0, latestY+lineOffset);
        ctx.lineTo(this.canvas.width, latestY+lineOffset);
        ctx.stroke();
        ctx.fillText((renderLatestY/1000000).toFixed(1) + " ms", this.canvas.width-50, latestY-2+lineOffset)

        // Draw labels
        ctx.fillText(this.id, 5, 10)
        ctx.fillText("Min: " + this.data.getMinY() + " ns", 5, this.canvas.height - 25);
        ctx.fillText("Max: " + this.data.getMaxY() + " ns", 5, this.canvas.height - 15);
    }

    public getID() {
        return this.id;
    }


    public update(data) {
        this.data = data;
    }

    public getElement(): HTMLCanvasElement {
        return this.canvas;
    }

    private testData(): ZIRDataStream {
        let data = [];
        for(let i = 0; i < 50; i++) {
            data.push(new ZIRPoint(i, 50*Math.random()));
        }
        return new ZIRDataStream(data);
    }
}