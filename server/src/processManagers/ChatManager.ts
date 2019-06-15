import { ZIRCommandManager } from "./CommandManager";
import { IZIRChatAgent, IZIRChatMessage } from "../globalInterfaces/MainInterfaces";
import { ZIRMessageType } from "../globalEnums/MainEnums";

/**
 * The chat manager maintains a list of ChatAgents. Every time routeMessages is
 * called, fetchMessages is called on each ChatAgent and the messages returned are
 * routed through the chat system and delivered to their intended recipients. 
 */
export class ZIRChatManager {
    private agents: {[chatId: string]: IZIRChatAgent};
    private commandManager: ZIRCommandManager;
    // Queue of previous 100 messages, overflow gets written to log
    private messages: IZIRChatMessage[];

    constructor(commandManager: ZIRCommandManager) {
        this.messages = [];
        this.agents = {};
        this.commandManager = commandManager;
    }

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

    private processMessage(message: IZIRChatMessage) {
        if(this.messages.length > 50) {
            this.messages = this.messages.slice(1);
        }

        if(message.type === ZIRMessageType.COMMAND) {
            this.commandManager.parseCommandFromMessage(message);
        } else if (message.content.charAt(0) === "/") {
            message.type = ZIRMessageType.COMMAND;
            message.content = message.content.slice(1);
            this.commandManager.parseCommandFromMessage(message);
        } else {
            this.messages.push(message);
            this.deliverMessage(message);
            console.log(this.messageToString(message));
        }
    }

    private deliverMessage(message: IZIRChatMessage) {
        if(message.recipient == null) {
            for(let agentId in this.agents) {
                this.agents[agentId].sendMessage(message);
            }
        } else {
            let recipientId;
            if(typeof message.recipient != typeof "string") {
                recipientId = (message.recipient as IZIRChatAgent).getChatId();
            }
            else {
                recipientId = message.recipient;
            }
            const recipient = this.agents[recipientId as string];
            if(recipient == null) {
                message.sender.sendMessage({type: ZIRMessageType.ERROR, content: "Message recipient could not be found", sender: null, recipient: recipient})
            } else {
                recipient.sendMessage(message);
            }
        }
    }

    public messageToString(message: IZIRChatMessage): string {
        return "[" + message.sender.getChatSenderName() + "] " + message.content; 
    }
}

/**
 * Currently unused - can be used for faction/team chats.
 * The client should store the chatId for use with routing
 */
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