import { ZIRTimeGraph, ZIRLineGraph, ZIRGraph } from "./Graph";
import { ZIRDataStream, ZIRPoint } from "./Data";
import "../lib/terminal";
import { QuadtreeDisplay } from "./QuadtreeDisplay";

declare function io();
declare function Terminal(): void;

const VALID_COMMANDS = [
    "help", "players"
]

export class ZIRConsole {
    private document: Document;
    private graphs: ZIRGraph[] = [];
    private data: {[key: string]: ZIRDataStream};
    private partialData: {[key: string]: PartialDataFrame};
    private partialCountData: {[key: string]: PartialDataFrame};
    private metadata: {[key: string]: IZIRTimerMetadata};
    private quadtreeDisplay: QuadtreeDisplay;
    private terminal;
    readonly SAMPLE_INTERVAL = 500; // ms per data frame
    public static readonly HEALTHY_TICKSPEED = 33000000; // ns

    constructor(document : Document) {
        this.document = document;
        this.data = {};
        this.partialData = {};
        this.metadata = {};

        const socket = io();
        socket.on("data", ((data) => {
            this.parseData(data);
        }).bind(this));
        socket.on("metadata", ((data) => {
            this.parseMetadata(data);
        }).bind(this));
        socket.on("counts", ((data) => {
            this.parseCountData(data);
        }).bind(this));
        socket.on("quadtree", ((data) => {
            this.handleQuadtree(data);
        }).bind(this));

        this.terminal = new Terminal();
        this.quadtreeDisplay = new QuadtreeDisplay(document.getElementById("quadtree") as HTMLCanvasElement);
        document.getElementById("terminal").appendChild(this.terminal.html as Node);
        this.terminal.print("Welcome to Terrafort Server Console 0.1");
        this.prompt();

        setInterval(this.consoleTick.bind(this), 1);
    }

    private prompt() {
        this.terminal.input("", (input: string) => {
            if(VALID_COMMANDS.indexOf(input) != -1) {
                switch(input) {
                    case "help":
                        this.terminal.print("Valid commands: " + VALID_COMMANDS);
                        break;
                    default:
                        this.terminal.print("TODO: implement");
                        break;
                }
            } else {
                this.terminal.print("Unknown command. Try 'help'.");
            }
            this.prompt();
        });
    }

    private consoleTick() {
        this.updateGraphs();
        this.renderGraphs();
    }

    private handleQuadtree(receivedData) {
        this.quadtreeDisplay.render(receivedData);
    }

    private parseCountData(receivedData) {
        const timeReceived = (new Date).getTime();
        const sampleTime = Math.trunc(timeReceived/this.SAMPLE_INTERVAL);
        for(let id in receivedData) {
            if(this.partialData[id]) {
                if (sampleTime != this.partialData[id].sampleTime) {
                    this.packagePartialData(id);
                    this.partialData[id] = {
                        sampleTime,
                        samples: [receivedData[id]],
                    } as PartialDataFrame;
                } else {
                    this.partialData[id].samples.concat([receivedData[id]]);
                }
            } else {
                this.partialData[id] = {
                    sampleTime,
                    samples: [receivedData[id]],
                } as PartialDataFrame;
            }
        }
    }

    private parseMetadata(receivedData) {
        for(let id in receivedData) {
            this.metadata[id] = receivedData[id] as IZIRTimerMetadata;
        }
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
            let graph = null;
            if(this.metadata[id]) {
                if(this.metadata[id].type === "count") {
                    graph = new ZIRLineGraph(id, this.data[id], this.metadata[id].type, this.metadata[id].parent);
                } else {
                    graph = new ZIRTimeGraph(id, this.data[id], this.metadata[id].type, this.metadata[id].parent);
                }
            } else {
                graph = new ZIRTimeGraph(id, this.data[id], "time");
            }
            
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
        if(this.data["tick"]) {
            ZIRDataStream.currentTickMax = this.data["tick"].getMaxY();
        }
    }

    private renderGraphs() {
        for(let graph of this.graphs) {
            graph.render();
        }
    }

    private addGraph(graph: ZIRGraph) {
        const parent = graph.getParent();
        if(!parent || parent == "gameLoop") {
            document.getElementById("mainGraphs").appendChild(graph.getElement() as Node);
        } else {
            let div = document.getElementById(parent + "_children");
            if (div === null) {
                const divider = document.createElement("HR");
                const header = document.createElement("H1");
                const headerText = document.createTextNode(parent);
                header.appendChild(headerText); 
                div = document.createElement("div");
                div.id = parent + "_children";
                div.className = "graphs";
                div.appendChild(header)
                document.getElementById("graphs").appendChild(divider);
                document.getElementById("graphs").appendChild(div);
            }
            div.appendChild(graph.getElement() as Node);
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

interface IZIRTimerMetadata {
    parent: string;
    type: string;
}
