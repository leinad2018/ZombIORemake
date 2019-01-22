import { Point } from "./globalInterfaces/UtilityInterfaces";

export class ZIRInput {
    private handler: (keycode: string, state: boolean | Point) => void;
    private activeKeys: boolean[];
    private cursorState: Point;

    constructor(){
        this.activeKeys = [];
        document.addEventListener("keyup", this.handleKeyupEvent.bind(this));
        document.addEventListener("keydown", this.handleKeydownEvent.bind(this));
        document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    }

    public setInputHandler(handler: (keycode: string, state: boolean) => void) {
        this.handler = handler;
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

    private handleMouseMove(event) {
        this.cursorState = {x: event.pageX, y: event.pageY}
        this.handler("mouse", this.cursorState)
    }

    private getKeyFromEvent(event) {
        var keyName: string;
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