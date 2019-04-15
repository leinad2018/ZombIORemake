export class ZIRTimer {
    private static startTimes: {[id: string]: number} = {};
    private static loggedTimes: {[id: string]: number[]} = {};
    private static timingEnabled = true;

    public static start(id: string) {
        if(this.timingEnabled) {
            this.startTimes[id] = this.getNanoTime();
        }
    }

    public static stop(id: string) {
        if(this.timingEnabled) {

            if(this.startTimes[id]) {
                if(!this.loggedTimes[id]) {
                    this.loggedTimes[id] = [];
                }
                const dt = this.getNanoTime() - this.startTimes[id]
                this.loggedTimes[id].push(dt)
                console.log(id + ": " + dt)
                delete this.startTimes[id];
            } else {
                throw new Error("Cannot stop timer that was not started. ID: " + id);
            }
        }
    }

    public static pullLoggedTimes(): {[id: string]: number[]} {
        const temp = this.loggedTimes;
        this.loggedTimes = {};
        return temp;
    }

    public static disableTiming() {
        this.timingEnabled = false;
    }

    public static getNanoTime(): number {
        var hrTime = process.hrtime();
        return hrTime[0] * 1000000000 + hrTime[1];
      }
}