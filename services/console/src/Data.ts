/**
 * An immutable data stream frame
 * Modifying methods return the next frame
 */
export class ZIRDataStream {
    points: ZIRPoint[];

    constructor(points?: ZIRPoint[]) {
        this.points = points;
    }

    public push(newPoint: ZIRPoint): ZIRDataStream {
        let newData = [];
        for(const point of this.points) {
            newData.push(point);
        }
        newData.push(newPoint);
        return new ZIRDataStream(newData);
    }

    public pushAll(newPoints: ZIRPoint[]): ZIRDataStream {
        let newData = [];
        for(const point of this.points) {
            newData.push(point);
        }
        for(const point of newPoints) {
            newData.push(point);
        }

        return new ZIRDataStream(newData);
    }

    public sort(): ZIRDataStream {
        let newData = this.copyData().sort((a,b) => {
            return(a.x - b.x)
        })
        return new ZIRDataStream(newData);
    }

    public normalize(): ZIRDataStream {
        let newData = [];
        const maxX = this.getMaxX();
        const minX = this.getMinX();
        const maxY = this.getMaxY();
        const minY = this.getMinY();

        const xRange = maxX - minX;
        const yRange = maxY - minY;

        for(const point of this.points) {
            const x = (point.x - minX) / xRange;
            const y = (point.y - minY) / yRange;
            newData.push(new ZIRPoint(x,y));
        }

        return new ZIRDataStream(newData);
    }

    public truncate(): ZIRDataStream {
        return new ZIRDataStream(this.points.slice(-50));
    }

    public scaleX(xScale: number): ZIRDataStream {
        let newData = [];

        for(const point of this.points) {
            newData.push(new ZIRPoint(point.x * xScale,point.y));
        }
        return new ZIRDataStream(newData);
    }

    public scaleY(yScale: number): ZIRDataStream {
        let newData = [];
        for(const point of this.points) {
            newData.push(new ZIRPoint(point.x, yScale * point.y));
        }
        return new ZIRDataStream(newData);
    }

    private copyData(): ZIRPoint[] {
        let newData = [];
        for(let datum of this.points) {
            newData.push(datum);
        }
        return newData;
    }

    public getMaxY() {
        let maxY = -Infinity;
        for(let point of this.points) {
            if(point.y > maxY) {
                maxY = point.y;
            }
        }
        return maxY;
    }

    public getMaxX() {
        let maxX = -Infinity;
        for(let point of this.points) {
            if(point.x > maxX) {
                maxX = point.x;
            }
        }
        return maxX;
    }

    public getMinY() {
        let minY = Infinity;
        for(let point of this.points) {
            if(point.y < minY) {
                minY = point.y;
            }
        }
        return minY;
    }

    public getMinX() {
        let minX = Infinity;
        for(let point of this.points) {
            if(point.x < minX) {
                minX = point.x;
            }
        }
        return minX;
    }
}

export class ZIRTimeData extends ZIRDataStream {
    constructor(points?: ZIRPoint[]) {
        super(points);
    }
}


export class ZIRPoint {
    readonly x: number;
    readonly y: number;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}