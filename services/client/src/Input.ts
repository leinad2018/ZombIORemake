import { Vector } from "./utilityObjects/Math";

export class ZIRInput {
    private chatHandler: (message: string) => void;
    private handler: (keycode: string, state: boolean) => void;
    private pointHandler: (keycode: string, state: Vector) => void;
    private activeKeys: {[key: string]: boolean};
    private cursorState: Vector;
    private debugState: boolean;
    private chatting: boolean = false;
    private renderHitboxState: boolean;
    private textInputString: string;

    constructor() {
        this.textInputString = "";
        this.activeKeys = {shift: false, ctrl: false};
        document.addEventListener("keyup", this.handleKeyupEvent.bind(this));
        document.addEventListener("keydown", this.handleKeydownEvent.bind(this));
        document.addEventListener("mousemove", this.handleMouseMove.bind(this));
        document.addEventListener("mousedown", this.handleMousedownEvent.bind(this));
        document.addEventListener("mouseup", this.handleMouseupEvent.bind(this));
    }

    public setChatHandler(chatHandler: (message: string) => void) {
        this.chatHandler = chatHandler;
    }

    public setInputHandler(handler: (keycode: string, state: boolean) => void) {
        this.handler = handler;
    }

    public setPointInputHandler(pointHandler: (keycode: string, state: Vector) => void) {
        this.pointHandler = pointHandler;
    }

    public getDebug(): boolean {
        return this.debugState;
    }

    public getRenderHitbox(): boolean {
        return this.renderHitboxState;
    }

    public getChatting(): boolean {
        return this.chatting;
    }

    public getTextInputString(): string {
        return this.textInputString;
    }

    private handleKeyupEvent(event) {
        const keycode: string = this.getKeyFromEvent(event);
        this.handler(keycode, false);
        this.activeKeys[keycode] = false;
    }

    private handleKeydownEvent(event) {
        const keycode: string = this.getKeyFromEvent(event);
        if (!this.chatting && !this.activeKeys[keycode]) {
            this.handler(keycode, true);
            this.activeKeys[keycode] = true;
        }
        
        if(this.chatting) {
            const BACKSPACE = 8;
            const ENTER = 13;
            if(event.keyCode === BACKSPACE) {
                this.textInputString = this.textInputString.length > 0 ? this.textInputString.slice(0, this.textInputString.length - 1) : "";
            } else if(event.keyCode === ENTER) {
                this.chatting = false;
                const temp = this.textInputString;
                this.textInputString = "";
                if(temp.length > 0) this.chatHandler(temp);
            } else if(event.key.length === 1) {
                this.textInputString += event.key
            }
        }

        if (keycode === "debug") {
            if(this.activeKeys["shift"]) {
                this.debugState = !this.debugState;
            }
            if(this.activeKeys["ctrl"]) {
                this.renderHitboxState = !this.renderHitboxState;
            }
        }
        if (keycode === "chat") {
            if(this.chatting === false) {
                this.chatting = true;
                this.clearKeys();
            }
        }
        if (keycode === "command") {
            if(this.chatting === false) {
                this.chatting = true;
                this.clearKeys();
                this.textInputString = "/";
            }
        }
        if (keycode === "escape") {
            if(this.chatting === true) {
                this.chatting = false;
            }
        }
    }

    private clearKeys() {
        for(let keyName in this.activeKeys) {
            this.activeKeys[keyName] = false;
        }
    }

    private handleMouseupEvent(event) {
        this.handler("click", false);
        this.activeKeys["click"] = false;
    }

    private handleMousedownEvent(event) {
        if (!this.chatting && !this.activeKeys["click"]) {
            this.handler("click", true);
            this.activeKeys["click"] = true;
        }
    }

    private handleMouseMove(event) {
        if(!this.chatting) {
            this.cursorState = new Vector(event.pageX, event.pageY);
            this.pointHandler("mouse", this.cursorState);
        }
    }

    private getKeyFromEvent(event) {
        let keyName: string;
        // console.log(this.activeKeys)
        // console.log(String.fromCharCode(event.keyCode));
        switch (event.keyCode) {
            case 32:
                keyName = "space";
                break;
            case 16:
                keyName = "shift";
                break;
            case 17:
                keyName = "ctrl";
                break;
            case 65:
                keyName = "leftArrow";
                break;
            case 87:
                keyName = "upArrow";
                break;
            case 68:
                keyName = "rightArrow";
                break;
            case 83:
                keyName = "downArrow";
                break;
            case 73:
                keyName = "openInventory";
                break;
            case 66:
                keyName = "buildMenu";
                break;
            case 187:
                keyName = "debug";
                break;
            case 84:
                keyName = "chat";
                break;
            case 27:
                keyName = "escape";
                break;
            case 191:
                keyName = "command";
                break;
        }

        return keyName;
    }
}
