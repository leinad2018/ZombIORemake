import { IZIRServerUpdate, IZIRUpdateResult, IZIRResetResult } from "./IServerUpdate";
import { ZIRMessageType } from "../globalEnums/MainEnums";

export interface IZIRServerCommunications {
    setUpdateHandler: (handler: (data: IZIRUpdateResult) => void) => void;

    setResetHandler: (handler: (data: IZIRResetResult) => void) => void;

    setMessageHandler: (handler: (message) => void) => void;

    setUsernameHandler: (handler: () => void) => void;

    sendInfoToServer: (type: string, message: string) => void;

    getPlayersOnline: () => string[];
}

/**
 * Defines the necessary methods for an engine-compatible chat manager
 */
export interface IZIRChatManager {
    /**
     * This will be called by the engine every tick.
     * The implementation should aggregate messages that
     * need to be sent from each chat agent, process them,
     * and send them to their appropriate destinations
     */
    routeMessages(): void;

    /**
     * This will be called by the engine whenever a new
     * chat agent connects or is created.
     */
    registerAgent(agent: IZIRChatAgent): void;

    /**
     * This will be called by the engine whenever a new
     * chat agent disconnects or is deleted
     */
    removeAgent(agent: IZIRChatAgent): void;
}

export interface IZIREntity {
    getEntityId: () => string;
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
