import { ZIRGraph } from "./Graph";
import { ZIRDataStream, ZIRPoint } from "./Data";

declare function io();

export class ZIRConsole {
    private document: Document;
    private graphs: ZIRGraph[] = [];
    private data: {[key: string]: ZIRDataStream};
    private partialData: {[key: string]: PartialDataFrame};
    readonly SAMPLE_INTERVAL = 500; // ms per data frame

    constructor(document : Document) {
        this.document = document;
        this.data = {};
        this.partialData = {};
        

        const socket = io();
        socket.on("data", ((data) => {
            this.parseData(data);
        }).bind(this));

        setInterval(this.consoleTick.bind(this), 1);
    }

    private consoleTick() {
        this.updateGraphs();
        this.renderGraphs();
    }

    private parseData(receivedData) {
        const timeReceived = (new Date).getTime();
        const sampleTime = Math.trunc(timeReceived/this.SAMPLE_INTERVAL);
        for(let id in receivedData) {
            if(this.partialData[id]) {
                if (sampleTime != this.partialData[id].sampleTime) {
                    this.packagePartialData(id);
                    this.partialData[id] = {
                        sampleTime,
                        samples: receivedData[id],
                    } as PartialDataFrame;
                } else {
                    this.partialData[id].samples.concat(receivedData[id]);
                }
            } else {
                this.partialData[id] = {
                    sampleTime,
                    samples: receivedData[id],
                } as PartialDataFrame;
            }
        }
    }

    private packagePartialData(id: string) {
        let data = this.partialData[id].samples;
        const avg = data.reduce((a: number, b: number) => a + b, 0) / data.length;
        const newPoint = new ZIRPoint(this.partialData[id].sampleTime, avg);
        if(!this.data[id]) {
            this.data[id] = new ZIRDataStream([newPoint]);
            const graph = new ZIRGraph(id, this.data[id]);
            this.addGraph(graph);
        } else {
            this.data[id] = this.data[id].push(newPoint).truncate();   
        }
        delete this.partialData[id];
    }

    private updateGraphs() {
        for(let graph of this.graphs) {
            graph.update(this.data[graph.getID()]);
        }
    }

    private renderGraphs() {
        for(let graph of this.graphs) {
            graph.render();
        }
    }

    private addGraph(graph: ZIRGraph) {
        if(graph.getID() == "tick") {
            document.getElementById("main").appendChild(graph.getElement() as Node);
        } else {
            document.getElementById("graphs").appendChild(graph.getElement() as Node);
        }
        this.graphs.push(graph);
    }
}

/**
 * Partial data frames are compiled for set time intervals and averaged into
 * single data points at the end of the interval.
 */
interface PartialDataFrame {
    sampleTime: number;
    samples: number[];
}
