import { ZIRCommandManager } from "./CommandManager";

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

    public processMessage(message: IZIRChatMessage) {
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

/**
 * A ChatAgent is any object capable of generating or accepting chat messages.
 * The ChatManager only routes messages between ChatAgents. Valid ChatAgents
 * include player sessions, the console manager, chat-enabled NPCs, and ChatGroups
 */
export interface IZIRChatAgent {
    /**
     * The ChatManager will route messages intended for the ChatAgent
     * through this method. The implementation should consume these
     * messages and display or log them as appropriate.
     * (For session objects, this method should send the messages to the client for processing)
     */
    sendMessage(message: IZIRChatMessage): void;

    /**
     * This should return any new chat messages that the ChatAgent
     * would like to send to the server for routing.
     * If the ChatAgent is storing these messages in a buffer, it should
     * also clear the buffer during this process to prevent resending.
     */
    fetchMessages(): IZIRChatMessage[];

    /**
     * This should return a unique identifier used
     * internally for message routing to specific ChatAgents.
     */
    getChatId(): string;

    /**
     * This should return the human-readable and chat-friendly
     * name that will display in chat with the message. Not necessarily unique.
     */
    getChatSenderName(): string;
}

export interface IZIRChatMessage {
    /**
     * Indicator for rendering and routing purposes.
     * Chat messages beginning with a forward-slash are
     * automatically routed as commands.
     */
    type: ZIRMessageType;

    /**
     * This should be stamped onto the ChatMessage
     * whenever a message is received from a client. Serverside
     * ChatAgents should be able to stamp this with "this" automatically.
     */
    sender: IZIRChatAgent;
    
    /**
     * Recipients will be sent to the server as string ChatIds, since clients
     * will generally not have access to full ChatAgent objects.
     * The ChatManager will try to parse ChatAgents from the ChatId and return
     * a rejection message to the sender if this fails.
     */
    recipient: IZIRChatAgent | string;
    
    /**
     * Plaintext message content
     */
    content: string;
}

export enum ZIRMessageType {
    ERROR, // Unused so far
    COMMAND, // First routed to CommandManager
    RAW, // For flavor text, join messages, etc - without sender displayed. May later support markup.
    CHAT, // Displays with sender ChatName
}