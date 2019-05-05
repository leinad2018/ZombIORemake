import { ZIRPoint, ZIRDataStream } from "./Data";
import { ZIRConsole } from "./Console";

export abstract class ZIRGraph {
    protected canvas: HTMLCanvasElement;
    protected id: string;
    protected parent: string;
    protected data: ZIRDataStream;
    protected type: string;
    protected dangerY: number = Infinity; // Display goes red above this value

    constructor(name: string, data: ZIRDataStream, type: string, parent?: string) {
        this.data = data;
        this.id = name;
        this.parent = parent;
        this.type = type;
        this.canvas = this.createCanvas();
    }

    public getID(): string {
        return this.id;
    }

    public getParent(): string {
        return this.parent;
    }

    public update(data) {
        this.data = data;
    }

    public getElement(): HTMLCanvasElement {
        return this.canvas;
    }

    protected abstract createCanvas(): HTMLCanvasElement;

    public abstract render();
}

export class ZIRLineGraph extends ZIRGraph {
    public render() {
        const ctx = this.canvas.getContext("2d");

        const renderData = this.prepareData();

        this.drawBackground(ctx);

        const lineOffset = this.canvas.height * .75;

        this.drawLine(ctx, renderData, lineOffset);

        this.drawLatestPointIndicator(ctx, renderData, lineOffset);

        this.drawBorderLines(ctx, renderData, lineOffset);
        
        this.drawLabels(ctx, renderData, lineOffset);
    }

    protected drawLabels(ctx: CanvasRenderingContext2D, renderData: ZIRDataStream, lineOffset: number) {
        // Draw labels
        ctx.fillText(this.id, 5, 10)
        ctx.fillText("Min: " + this.data.getMinY(), 5, this.canvas.height - 25);
        ctx.fillText("Max: " + this.data.getMaxY(), 5, this.canvas.height - 15);
    }

    protected drawBorderLines(ctx: CanvasRenderingContext2D, renderData: ZIRDataStream, lineOffset: number) {
        // Draw border lines
        ctx.beginPath();
        ctx.moveTo(0, 0+lineOffset);
        ctx.lineTo(this.canvas.width, 0+lineOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, lineOffset);
        ctx.lineTo(this.canvas.width, lineOffset);
        ctx.stroke();
    }

    protected drawLatestPointIndicator(ctx: CanvasRenderingContext2D, renderData: ZIRDataStream, lineOffset: number) {
        // Draw latest point indicator
        ctx.beginPath();
        const latestY = renderData.points[renderData.points.length-1].y
        const renderLatestY = this.data.points[this.data.points.length-1].y
        ctx.moveTo(0, latestY+lineOffset);
        ctx.lineTo(this.canvas.width, latestY+lineOffset);
        ctx.stroke();
        ctx.fillText((renderLatestY).toFixed(1), this.canvas.width-50, latestY-2+lineOffset)
    }

    protected drawBackground(ctx: CanvasRenderingContext2D) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "lightgray";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    protected drawLine(ctx: CanvasRenderingContext2D, renderData: ZIRDataStream, lineOffset: number) {
        ctx.fillStyle = "black";

        // Draw main line graph
        ctx.beginPath();
        ctx.moveTo(renderData.points[0].x, renderData.points[0].y + lineOffset);

        for(let index = 0; index < renderData.points.length; index++) {
            const point = renderData.points[index];
            const pointValue = this.data.points[index].y;
            ctx.lineTo(point.x, (point.y + lineOffset));
            if(pointValue > this.dangerY) {
                ctx.strokeStyle = "red";
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(point.x, point.y + lineOffset)
            } else {
                ctx.strokeStyle = "black";
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(point.x, point.y + lineOffset)
            }
        }
        ctx.stroke();
        ctx.strokeStyle = "black";
    }

    protected prepareData(): ZIRDataStream {
        let renderData = this.data;
        renderData = renderData.normalize();
        renderData = renderData.scaleY(this.canvas.height * .50 * -1);
        renderData = renderData.scaleX(this.canvas.width * .75);
        renderData = renderData.sort();
        return renderData;
    }

    protected createCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.id = name;
        canvas.width = name == "tick" ? 600 : 300;
        canvas.height = name == "tick" ? 400 : 200;
        canvas.style.zIndex = "8";
        canvas.style.border = "1px solid";
        canvas.addEventListener('click', this.onclick, false);
        return canvas;
    }

    protected onclick(click) {
        const child_div = document.getElementById(this.id + "_children");
        if(child_div) {
            if(child_div.style.display === "none") {
                child_div.style.display = "block";
            } else {
                child_div.style.display = "none";
            }
        }
    }
}

export class ZIRTimeGraph extends ZIRLineGraph {

    constructor(name: string, data: ZIRDataStream, type: string, parent?: string) {
        super(name, data, type, parent);
        this.dangerY = ZIRConsole.HEALTHY_TICKSPEED;
    }

    public render() {
        const ctx = this.canvas.getContext("2d");

        const renderData = this.prepareData();

        this.drawBackground(ctx);

        const lineOffset = this.canvas.height * .75;

        this.drawLine(ctx, renderData, lineOffset);

        this.drawLatestPointIndicator(ctx, renderData, lineOffset);

        this.drawBorderLines(ctx, renderData, lineOffset);
        
        this.drawLabels(ctx, renderData, lineOffset);
    }

    protected drawBorderLines(ctx: CanvasRenderingContext2D, renderData: ZIRDataStream, lineOffset: number) {
        super.drawBorderLines(ctx, renderData, lineOffset);

        ctx.strokeStyle = "red";
        ctx.beginPath();

        const unhealthy_y = (this.data.normalizeYToTick(ZIRConsole.HEALTHY_TICKSPEED) * this.canvas.height * -.5) + lineOffset;
        ctx.moveTo(0, unhealthy_y);
        ctx.lineTo(this.canvas.width, unhealthy_y);
        ctx.stroke();
        ctx.strokeStyle = "black";
    }

    protected prepareData(): ZIRDataStream {
        let renderData = this.data;
        renderData = renderData.normalizeToTick();
        renderData = renderData.scaleY(this.canvas.height * .50 * -1);
        renderData = renderData.scaleX(this.canvas.width * .75);
        renderData = renderData.sort();
        return renderData;
    }

    protected drawLabels(ctx: CanvasRenderingContext2D, renderData: ZIRDataStream, lineOffset: number) {
        // Draw labels
        ctx.fillText(this.id, 5, 10)
        ctx.fillText("Min: " + this.data.getMinY() + " ns", 5, this.canvas.height - 25);
        ctx.fillText("Max: " + this.data.getMaxY() + " ns", 5, this.canvas.height - 15);
    }

    protected drawLatestPointIndicator(ctx: CanvasRenderingContext2D, renderData: ZIRDataStream, lineOffset: number) {
        // Draw latest point indicator
        ctx.beginPath();
        const latestY = renderData.points[renderData.points.length-1].y
        const renderLatestY = this.data.points[this.data.points.length-1].y
        ctx.moveTo(0, latestY+lineOffset);
        ctx.lineTo(this.canvas.width, latestY+lineOffset);
        ctx.stroke();
        ctx.fillText((renderLatestY/1000000).toFixed(1) + " ms", this.canvas.width-50, latestY-2+lineOffset)
    }
}