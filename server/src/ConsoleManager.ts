import * as express from "express";
import * as http from "http";
import * as path from "path";
import * as socketIO from "socket.io";

import {ZIRTimer} from "./Timer";
import { ZIRServerEngine } from "./ServerEngine";
import { IZIRChatAgent, IZIRChatMessage } from "./ChatManager";

export class ZIRConsoleManager implements IZIRChatAgent{

    private io;
    private engine;
    private loopTracker: number = 0;
    private queuedMessages: IZIRChatMessage[] = [];

    constructor(engine: ZIRServerEngine) {
        this.engine = engine;
        const app = express();
        const server = new http.Server(app);
        this.io = socketIO(server);

        const PORT: number = 5001;
        const CONSOLE_ROOT = __dirname + "/../../services/console/";

        app.set("port", PORT);
        app.use(express.static(CONSOLE_ROOT));

        app.get("/", (request, response) => {
            response.sendFile(path.resolve(CONSOLE_ROOT + "web/console.html"));
        });

        // Starts the server.
        server.listen(PORT, () => {
            console.log("Starting console server on port " + PORT);
        });
    }

    public updateClients = (): void => {
        const update = ZIRTimer.pullLoggedTimes();
        this.io.sockets.emit("data", update);
        const metadata = ZIRTimer.pullLoggedMetadata();
        this.io.sockets.emit("metadata", metadata);
        const counts = ZIRTimer.pullLoggedCounts();
        this.io.sockets.emit("counts", counts);
        if(this.loopTracker % 30 === 0) {
            const quadtree = this.engine.getQuadtree();
            if(quadtree !== undefined) {
                const send = quadtree.getExport();
                this.io.sockets.emit("quadtree", send)
            }        
        }
        this.loopTracker++;
    }

    public fetchMessages(): IZIRChatMessage[] {
        const temp = this.queuedMessages;
        this.queuedMessages = [];
        return temp;
    }

    public sendMessage(message: IZIRChatMessage) {
        this.io.sockets.emit("chat", {content: message.content, sender: message.sender.getChatSenderName()});
    }

    public getChatId(): string {
        return "console";
    }

    public getChatSenderName(): string {
        return "Server"
    }
}
