import {IZIRUpdateResult, IZIRResetResult} from "./globalInterfaces/IServerUpdate"


export class ZIRLogger {
    private active : boolean;
    private filePath : string;
    private stream;
    constructor(filePath : string, active : boolean = true) {
        this.active = active;
        this.filePath = filePath;
        let fs = require('fs');
        this.stream = fs.createWriteStream(filePath, {flags:"a"});
    }

    public enable() {
        this.active = true;
    }

    public disable() {
        this.active = false;
    }

    public log(data : any) {
        if(this.active) {
            data = JSON.stringify(data);
            this.stream.write("[" + Date.now() + "] " + data+"\n");
        }
    }

    public logUnpacked(data) {
        this.log(this.unpack(data));
    }

    public unpack(data) : Object {
        let object = {}
        let array = []
        let label = "";
        for(let entry in data) {
            label = entry;
            array.push(data[entry]);
        }
        object[label] = array;
        return object;
    }

    public close() : void {
        this.stream.end();
    }
}