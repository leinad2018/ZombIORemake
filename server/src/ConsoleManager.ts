import * as express from "express";
import * as http from "http";
import * as path from "path";
import * as socketIO from "socket.io";

import {ZIRTimer} from "./Timer";

export class ZIRConsoleManager {

    private io;

    constructor() {
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
    }
}
