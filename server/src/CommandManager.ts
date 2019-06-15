import { ZIRServerEngine } from "./ServerEngine";
import { IZIRChatAgent, IZIRChatMessage, ZIRMessageType} from "./ChatManager";
import { Vector } from "./utilityObjects/Math";

const VALID_COMMANDS = [
    "help", "players", "say", "spawn"
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
                case "players":
                    if(args.length > 0) {
                        this.returnError(sender, "'/players' takes no arguments");
                    } else {
                        this.players(sender);
                    }
                    break;
                case "say":
                    if(args.length !== 1) {
                        this.returnError(sender, "'/say' requires exactly one argument");
                    } else {
                        this.say(sender, args[0]);
                    }
                    break;
                case "spawn":
                    if(args.length !== 3) {
                        this.returnError(sender, "'/spawn' requires exactly three arguments");
                    } else {
                        try {
                            const pos = new Vector(parseInt(args[1]), parseInt(args[2]))
                        } catch(e) {
                            this.returnError(sender, "Could not create vector <" + args[1] + ", " + args[2] + ">");
                        }
                        switch(args[0]) {
                            case "enemy":
                                this.returnError(sender, "not yet implemented");
                                break;
                            default:
                                this.returnError(sender, "not yet implemented");
                                break;
                        }
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

    public players(sender: IZIRChatAgent) {
        this.returnResponse(sender, "Players online: " + this.state.getAllPlayers().map(player => player.getName()).join(", "));
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
            this.returnResponse(sender, "Valid commands: " + VALID_COMMANDS.join(", "));
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
        const components = s.content.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g)
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