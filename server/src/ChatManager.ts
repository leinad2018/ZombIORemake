export class ZIRChatManager {
    private messages: IZIRChatMessage[];

}

export interface IZIRChatMessage {
    type: ZIRMessageType;
    sender: string;
    content: string;
}

export class ZIRCommand {
    sender: string;
    command: string;
    args: string[];
    kwargs: {[keyWord: string]: string};

    public fromMessage(s: IZIRChatMessage) {
        this.sender = s.sender;
        const components = s.content.split("s");
        if (components.length = 0) {
            console.log("Could not create command from blank string")
            return;
        }
        this.command = components[0];
        for(let i = 1; i < components.length; i++) {
            const component = components[i];
            if(component.indexOf("=") == -1) {
                this.args.push(component);
            }
            else {
                const kwarg = component.split("=");
                if(kwarg.length !== 2) {
                    console.log("Error parsing kwarg " + component);
                } else {
                    this.kwargs[kwarg[0]] = kwarg[1];
                }   
            }
        }
    }

    public toMessage(): IZIRChatMessage {
        return {
            type: ZIRMessageType.COMMAND,
            sender: this.sender,
            content: "/" + this.command + " " + this.args + " " + this.kwargs,
        }
    }
}

export enum ZIRMessageType {
    ERROR,
    COMMAND,
    BROADCAST,
    CHAT,
}