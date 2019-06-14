export class ZIRChatManager {
    private agents: {[chatId: string]: IZIRChatAgent} = {};

    // Queue of previous 100 messages, overflow gets written to log
    private messages: IZIRChatMessage[] = [];

    public routeMessages(): void {
        for(let agent in this.agents) {
            const messages = this.agents[agent].fetchMessages();
            if(messages.length > 0) {
                for(let message of messages) {
                    this.processMessage(message);
                }
            }
        }
    }

    public registerAgent(agent: IZIRChatAgent) {
        this.agents[agent.getChatId()] = agent;
    }

    public removeAgent(agent: IZIRChatAgent) {
        delete this.agents[agent.getChatId()];
    }

    public processMessage(message: IZIRChatMessage) {
        if(this.messages.length > 50) {
            this.messages = this.messages.slice(1);
        }
        this.messages.push(message);
        if (message.recipient == null) {

        }
        this.deliverToAll(message);
        console.log(this.messageToString(message));
    }

    private deliverToAll(message: IZIRChatMessage) {
        for(let agentId in this.agents) {
            this.agents[agentId].sendMessage(message);
        }
    }

    public messageToString(message: IZIRChatMessage): string {
        return "[" + message.sender.getChatSenderName() + "] " + message.content; 
    }
}

export class ZIRChatGroup implements IZIRChatAgent {
    protected members: IZIRChatAgent[];
    protected queuedMessages: IZIRChatMessage[] = [];
    protected name: string;

    constructor(name: string) {
        this.name = name;
    }

    public addMember(member: IZIRChatAgent) {
        this.members.push(member);
    }

    public sendMessage(message: IZIRChatMessage) {
        for(let member of this.members) {
            member.sendMessage(message);
        }
    }

    public fetchMessages(): IZIRChatMessage[] {
        const temp = this.queuedMessages;
        this.queuedMessages = [];
        return temp;
    }

    public getChatSenderName(): string {
        return name;
    }

    public getChatId(): string {
        return "chatgroup" + name;
    }
}

// Can be a player session or a group of player sessions
export interface IZIRChatAgent {
    sendMessage(message: IZIRChatMessage): void;
    fetchMessages(): IZIRChatMessage[];
    getChatId(): string;
    getChatSenderName(): string;
}

export interface IZIRChatMessage {
    type: ZIRMessageType;
    sender: IZIRChatAgent;
    recipient: IZIRChatAgent | string; // Set to null if general
    content: string;
}

export class ZIRCommand {
    sender: IZIRChatAgent;
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
            recipient: null,
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