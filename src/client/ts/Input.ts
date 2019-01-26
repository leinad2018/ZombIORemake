import { Point } from "./globalInterfaces/UtilityInterfaces";

export class ZIRInput {
    private handler: (keycode: string, state: boolean) => void;
    private pointHandler: (keycode: string, state: Point) => void;
    private activeKeys: boolean[];
    private cursorState: Point;

    constructor(){
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

    public setPointInputHandler(pointHandler: (keycode: string, state: Point) => void) {
        this.pointHandler = pointHandler;
    }

    private handleKeyupEvent(event){
        var keycode: string = this.getKeyFromEvent(event);
        this.handler(keycode, false);
        this.activeKeys[keycode] = false;
    }

    private handleKeydownEvent(event){
        var keycode: string = this.getKeyFromEvent(event);
        if(!this.activeKeys[keycode]){
            this.handler(keycode, true);
            this.activeKeys[keycode] = true;
        }
    }

    private handleMouseupEvent(event) {
        this.handler("click", false);
        this.activeKeys["click"] = false;
    }

    private handleMousedownEvent(event) {
        if(!this.activeKeys["click"]) {
            this.handler("click", true);
            this.activeKeys["click"] = true;
        }
    }

    private handleMouseMove(event) {
        this.cursorState = {x: event.pageX, y: event.pageY}
        this.pointHandler("mouse", this.cursorState)
    }

    private getKeyFromEvent(event) {
        var keyName: string;
        //console.log(String.fromCharCode(event.keyCode));
        switch (event.keyCode) {
            case 32:
                keyName = "space";
                break;
            case 37:
                keyName = "leftArrow";
                break;
            case 38:
                keyName = "upArrow";
                break;
            case 39:
                keyName = "rightArrow";
                break;
            case 40:
                keyName = "downArrow";
                break;
        }
        
        return keyName;
    }
}