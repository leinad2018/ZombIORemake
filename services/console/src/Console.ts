import { ZIRGraph } from "./Graph";
import { ZIRDataStream, ZIRPoint } from "./Data";
import "../lib/terminal";

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
    private terminal;
    readonly SAMPLE_INTERVAL = 500; // ms per data frame
    public static readonly HEALTHY_TICKSPEED = 33000000; // ns

    constructor(document : Document) {
        this.document = document;
        this.data = {};
        this.partialData = {};

        const socket = io();
        socket.on("data", ((data) => {
            this.parseData(data);
        }).bind(this));

        this.terminal = new Terminal();
        document.getElementById("terminal").appendChild(this.terminal.html as Node);
        this.terminal.print("Welcome to Terrafort Server Console 0.1\n\n");
        this.prompt();

        setInterval(this.consoleTick.bind(this), 1);
    }

    private prompt() {
        this.terminal.input("", (input: string) => {
            if(VALID_COMMANDS.indexOf(input) != -1) {
                switch(input) {
                    case "help":
                        this.terminal.print("Valid commands: " + VALID_COMMANDS + "\n\n");
                        break;
                    default:
                        this.terminal.print("TODO: implement" + "\n\n");
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
        if(graph.getID() == "tick" || graph.getID() == "gameLoop") {
            document.getElementById("mainGraphs").appendChild(graph.getElement() as Node);
        } else {
            document.getElementById("secondaryGraphs").appendChild(graph.getElement() as Node);
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
