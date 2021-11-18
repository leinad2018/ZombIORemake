import { ZIRServerEngine, ZIRServerChatAgent } from "./ServerEngine";
import { IZIRChatAgent, IZIRChatMessage} from "../globalInterfaces/MainInterfaces";
import { Vector } from "../utilityObjects/Math";
import { ZIRMessageType } from "../globalEnums/MainEnums";

const VALID_COMMANDS = [
    "help", "players", "say", "spawn",
];

export class ZIRCommandManager {
    protected chatAgent: ZIRServerChatAgent;
    protected state: ZIRServerEngine;

    constructor(chatAgent: ZIRServerChatAgent, state: ZIRServerEngine) {
        this.chatAgent = chatAgent;
        this.state = state;
    }

    public parseCommandFromMessage(input: IZIRChatMessage) {
        const parseAttempt = ZIRCommand.fromMessage(input);
        const sender = input.sender;
        if (!(parseAttempt instanceof ZIRCommand)) {
            this.returnError(sender, "");
        } else {
            const command = parseAttempt as ZIRCommand;
            this.executeCommand(command);
        }
    }

    public executeCommand(command: ZIRCommand) {
        const sender = command.sender;
        if (VALID_COMMANDS.indexOf(command.command) !== -1) {
            const args = command.args;
            const kwargs = command.kwargs;
            switch (command.command) {
                case "help":
                    if (args.length > 0) {
                        this.help(command.sender, args[0]);
                    } else {
                        this.help(command.sender);
                    }
                    break;
                case "players":
                    if (args.length > 0) {
                        this.returnError(sender, "'/players' takes no arguments");
                    } else {
                        this.players(sender);
                    }
                    break;
                case "say":
                    if (args.length !== 1) {
                        this.returnError(sender, "'/say' requires exactly one argument");
                    } else {
                        this.say(sender, args[0]);
                    }
                    break;
                case "spawn":
                    if (args.length !== 3) {
                        this.returnError(sender, "'/spawn' requires exactly three arguments");
                    } else {
                        try {
                            const pos = new Vector(parseInt(args[1], 10), parseInt(args[2], 10));
                        } catch (e) {
                            this.returnError(sender, "Could not create vector <" + args[1] + ", " + args[2] + ">");
                        }
                        switch (args[0]) {
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

    public say(from: IZIRChatAgent, message: string) {
        this.chatAgent.queueMessage(
            {
                type: ZIRMessageType.CHAT,
                recipient: null,
                content: message,
                sender: from,
            },
        );
    }

    public players(sender: IZIRChatAgent) {
        this.returnResponse(sender, "Players online: " + this.state.getAllPlayers().map((player) => player.getName()).join(", "));
    }

    public help(sender: IZIRChatAgent, commandToHelp?: string) {
        if (commandToHelp != null) {
            switch (commandToHelp) {
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

    public returnResponse(to: IZIRChatAgent, message: string) {
        this.chatAgent.queueMessage(
            {
                type: ZIRMessageType.RAW,
                recipient: to,
                content: message,
                sender: null,
            },
        );
    }

    public returnError(to: IZIRChatAgent, message: string) {
        this.chatAgent.queueMessage(
            {
                type: ZIRMessageType.ERROR,
                recipient: to,
                content: message,
                sender: null,
            },
        );
    }
}

export class ZIRCommand {
    public sender: IZIRChatAgent;
    public command: string;
    public args: string[];
    public kwargs: {[keyWord: string]: string};

    constructor() {
        this.args = [];
        this.kwargs = {};
    }

    public static fromMessage(s: IZIRChatMessage): ZIRCommand | string {
        const command = new ZIRCommand();
        command.sender = s.sender;
        const components = s.content.match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
        if (components.length === 0) {
            return "Error parsing blank command";
        }
        command.command = components[0];
        for (let i = 1; i < components.length; i++) {
            const component = components[i];
            if (component.indexOf("=") === -1) {
                command.args.push(component);
            } else {
                const kwarg = component.split("=");
                if (kwarg.length !== 2) {
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
        };
    }
}
