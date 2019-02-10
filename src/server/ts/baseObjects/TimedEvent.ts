export abstract class ZIRTimedEvent {
    private numberOfFrames: number;
    private startFrame: number;

    constructor(length: number) {
        this.numberOfFrames = length;
        this.startFrame = 0;
    }

    public setStartingFrame(frame: number) {
        this.startFrame = frame;
    }

    public getEndingFrame() {
        return this.startFrame + this.numberOfFrames;
    }

    public updateEvent(frame: number) {
        if (frame >= this.getEndingFrame()) {
            this.endEvent(frame);
        } else {
            this.runEvent(frame);
        }
    }

    public abstract endEvent(frame: number);
    protected abstract runEvent(frame: number);
}
