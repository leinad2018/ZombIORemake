import { Vector } from "./utilityObjects/Math";

export class ZIRInput {
    private handler: (keycode: string, state: boolean) => void;
    private pointHandler: (keycode: string, state: Vector) => void;
    private activeKeys: boolean[];
    private cursorState: Vector;
    private debugState: boolean;

    constructor() {
        this.activeKeys = [];
        document.addEventListener("keyup", this.handleKeyupEvent.bind(this));
        document.addEventListener("keydown", this.handleKeydownEvent.bind(this));
        document.addEventListener("mousemove", this.handleMouseMove.bind(this));
        document.addEventListener("mousedown", this.handleMousedownEvent.bind(this));
        document.addEventListener("mouseup", this.handleMouseupEvent.bind(this));
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

    private handleKeyupEvent(event) {
        const keycode: string = this.getKeyFromEvent(event);
        this.handler(keycode, false);
        this.activeKeys[keycode] = false;
    }

    private handleKeydownEvent(event) {
        const keycode: string = this.getKeyFromEvent(event);
        if (!this.activeKeys[keycode]) {
            this.handler(keycode, true);
            this.activeKeys[keycode] = true;
        }
        if (keycode === "debug") {
            this.debugState = !this.debugState;
        }
    }

    private handleMouseupEvent(event) {
        this.handler("click", false);
        this.activeKeys["click"] = false;
    }

    private handleMousedownEvent(event) {
        if (!this.activeKeys["click"]) {
            this.handler("click", true);
            this.activeKeys["click"] = true;
        }
    }

    private handleMouseMove(event) {
        this.cursorState = new Vector(event.pageX, event.pageY);
        this.pointHandler("mouse", this.cursorState);
    }

    private getKeyFromEvent(event) {
        let keyName: string;
        // console.log(this.activeKeys)
        // console.log(String.fromCharCode(event.keyCode));
        switch (event.keyCode) {
            case 32:
                keyName = "space";
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
            case 187:
                keyName = "debug";
                break;
        }

        return keyName;
    }
}
