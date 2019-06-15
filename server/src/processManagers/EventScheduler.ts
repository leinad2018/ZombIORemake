export class ZIREventScheduler {
    private static instance: ZIREventScheduler;

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ZIREventScheduler();
        }
        return this.instance;
    }

    private events: ZIREvent[];
    private currentTick: number;

    private constructor() {
        this.events = [];
    }

    public update(frame: number) {
        this.currentTick = frame;
        for (let i = 0; i < this.events.length; i++) {
            const event = this.events[i];
            if (frame > event.getEndingFrame()) {
                this.events.splice(i, 1);
            } else {
                event.update(frame);
            }
        }
    }

    public registerEvent(event: ZIREvent) {
        event.setStartingFrame(this.currentTick);
        this.events.push(event);
    }
}

abstract class ZIREvent {
    protected startFrame: number;
    protected numberOfFrames: number;

    constructor(length: number) {
        this.numberOfFrames = length;
    }

    public setStartingFrame(frame: number) {
        this.startFrame = frame;
    }

    public getEndingFrame() {
        return this.startFrame + this.numberOfFrames;
    }

    public abstract update(curFrame: number);
}

export abstract class ZIRSingleEvent extends ZIREvent {
    public update(curFrame: number) {
        if (curFrame === this.getEndingFrame()) {
            this.runEvent();
        }
    }

    protected abstract runEvent();
}

export abstract class ZIRExtendedEvent extends ZIREvent {
    public update(curFrame: number) {
        if (curFrame === this.getEndingFrame()) {
            this.endEvent();
        } else {
            this.runEvent(curFrame);
        }
    }

    public abstract runEvent(frame: number);

    public abstract endEvent();
}
