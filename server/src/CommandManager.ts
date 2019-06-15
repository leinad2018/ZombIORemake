import { ZIRServerEngine } from "./ServerEngine";
import { IZIRChatAgent, IZIRChatMessage, ZIRMessageType} from "./ChatManager";

const VALID_COMMANDS = [
    "help", "players"
]

export class ZIRCommandManager implements IZIRChatAgent {
    protected queuedMessages: IZIRChatMessage[];
    protected state: ZIRServerEngine;

    constructor(state: ZIRServerEngine) {
        this.queuedMessages = [];
        this.state = state;
    }

    public parseCommandFromMessage(input: IZIRChatMessage) {
        const parseAttempt = ZIRCommand.fromMessage(input);
        console.log(parseAttempt)
        const sender = input.sender;
        if(!(parseAttempt instanceof ZIRCommand)) {
            this.returnError(sender, "")
        } else {
            const command = parseAttempt as ZIRCommand;
            this.executeCommand(command);
        }
    }

    public executeCommand(command: ZIRCommand) {
        const sender = command.sender;
        console.log(command.command)
        if(VALID_COMMANDS.indexOf(command.command) != -1) {
            const args = command.args;
            const kwargs = command.kwargs;
            switch(command.command) {
                case "help":
                    if(args.length > 0) {
                        this.help(command.sender, args[0]);
                    } else {
                        this.help(command.sender);
                    }
                    break;
                default:
                    this.returnError(sender, "Command not found");
                    break;
            }
        } else {
            this.returnError(sender, "Unknown command. Try 'help'.");
        }
    }

    public say(sender: IZIRChatAgent, message: string) {
        this.queuedMessages.push(
            {
                type: ZIRMessageType.CHAT,
                recipient: null,
                content: message,
                sender: sender
            }
        );
    }

    public help(sender: IZIRChatAgent, commandToHelp?: string) {
        if(commandToHelp != null) {
            switch(commandToHelp) {
                case "say":
                        this.returnResponse(sender, "Writes a message to chat. Format: /say [message]");
                    break;
                default:
                    this.returnResponse(sender, "No help available for " + commandToHelp);
            }
        } else {
            this.returnResponse(sender, "Valid commands: " + VALID_COMMANDS);
        }
    }

    public returnResponse(recipient: IZIRChatAgent, message: string) {
        this.queuedMessages.push(
            {
                type: ZIRMessageType.RAW,
                recipient: recipient,
                content: message,
                sender: this
            }
        );
    }

    public returnError(recipient: IZIRChatAgent, message: string) {
        this.queuedMessages.push(
            {
                type: ZIRMessageType.ERROR,
                recipient: recipient,
                content: message,
                sender: this
            }
        );
    }

    public sendMessage() {
        // Unused
    }

    public fetchMessages() {
        const temp = this.queuedMessages;
        this.queuedMessages = [];
        return temp;
    }

    public getChatSenderName(): string {
        return "Server";
    }

    public getChatId(): string {
        return "server";
    }
}

export class ZIRCommand {
    sender: IZIRChatAgent;
    command: string;
    args: string[];
    kwargs: {[keyWord: string]: string};

    constructor() {
        this.args = [];
        this.kwargs = {};
    }

    public static fromMessage(s: IZIRChatMessage): ZIRCommand | string {
        const command = new ZIRCommand();
        command.sender = s.sender;
        const components = s.content.split(" ");
        if (components.length === 0) {
            return "Error parsing blank command";
        }
        command.command = components[0];
        for(let i = 1; i < components.length; i++) {
            const component = components[i];
            if(component.indexOf("=") === -1) {
                command.args.push(component);
            }
            else {
                const kwarg = component.split("=");
                if(kwarg.length !== 2) {
                    return ("Error parsing keyword argument: " + component);
                } else {
                    command.kwargs[kwarg[0]] = kwarg[1];
                }   
            }
        }
        return command;
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