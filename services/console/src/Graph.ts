import { ZIRPoint, ZIRDataStream } from "./Data";
import { ZIRConsole } from "./Console";

export class ZIRGraph {
    private canvas: HTMLCanvasElement;
    private id: string;
    private parent: string;
    private data: ZIRDataStream;

    constructor(name: string, data: ZIRDataStream, parent?: string) {
        this.data = data;
        this.id = name;
        this.parent = parent;
        const canvas = document.createElement('canvas');
        canvas.id = name;
        canvas.width = name == "tick" ? 600 : 300;
        canvas.height = name == "tick" ? 400 : 200;
        canvas.style.zIndex = "8";
        canvas.style.border = "1px solid";
        canvas.addEventListener('click', this.onclick, false);
        this.canvas = canvas;
    }

    private onclick(click) {
        const child_div = document.getElementById(this.id + "_children");
        if(child_div) {
            if(child_div.style.display === "none") {
                child_div.style.display = "block";
            } else {
                child_div.style.display = "none";
            }
        }
    }

    public render() {
        let renderData = this.data;
        renderData = renderData.normalizeToTick();
        renderData = renderData.scaleY(this.canvas.height * .50 * -1);
        renderData = renderData.scaleX(this.canvas.width * .75);
        renderData = renderData.sort();
        const ctx = this.canvas.getContext("2d");

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "lightgray";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.fillStyle = "black";

        // Draw main line graph
        const lineOffset = this.canvas.height * .75
        ctx.beginPath();
        ctx.moveTo(renderData.points[0].x, renderData.points[0].y + lineOffset);

        for(let index = 0; index < renderData.points.length; index++) {
            const point = renderData.points[index];
            const pointValue = this.data.points[index].y;
            ctx.lineTo(point.x, (point.y + lineOffset));
            if(pointValue > ZIRConsole.HEALTHY_TICKSPEED) {
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

        // Draw latest point indicator
        ctx.beginPath();
        const latestY = renderData.points[renderData.points.length-1].y
        const renderLatestY = this.data.points[this.data.points.length-1].y
        ctx.moveTo(0, latestY+lineOffset);
        ctx.lineTo(this.canvas.width, latestY+lineOffset);
        ctx.stroke();
        ctx.fillText((renderLatestY/1000000).toFixed(1) + " ms", this.canvas.width-50, latestY-2+lineOffset)

        // Draw border lines
        ctx.beginPath();
        ctx.moveTo(0, 0+lineOffset);
        ctx.lineTo(this.canvas.width, 0+lineOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, lineOffset);
        ctx.lineTo(this.canvas.width, lineOffset);
        ctx.stroke();

        ctx.strokeStyle = "red";
        ctx.beginPath();
        const unhealthy_y = (this.data.normalizeYToTick(ZIRConsole.HEALTHY_TICKSPEED) * this.canvas.height * -.5) + lineOffset;
        ctx.moveTo(0, unhealthy_y);
        ctx.lineTo(this.canvas.width, unhealthy_y);
        ctx.stroke();
        ctx.strokeStyle = "black";

        // Draw labels
        ctx.fillText(this.id, 5, 10)
        ctx.fillText("Min: " + this.data.getMinY() + " ns", 5, this.canvas.height - 25);
        ctx.fillText("Max: " + this.data.getMaxY() + " ns", 5, this.canvas.height - 15);
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

    private testData(): ZIRDataStream {
        let data = [];
        for(let i = 0; i < 50; i++) {
            data.push(new ZIRPoint(i, 50*Math.random()));
        }
        return new ZIRDataStream(data);
    }
}