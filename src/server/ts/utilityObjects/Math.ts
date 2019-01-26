
export class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public getMagnitude(): number {
        return (Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)));
    }

    public scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    public getUnitVector(): Vector {
        return (this.scale(1 / this.getMagnitude()));
    }

    public add(v: Vector): Vector {
        return new Vector(this.x + v.getX(), this.y + v.getY());
    }

    public sub(v: Vector): Vector {
        return new Vector(this.x - v.getX(), this.y - v.getY());
    }

    public getX(): number {
        return this.x;
    }

    public getY(): number {
        return this.y;
    }

    private setX(x: number): void {
        this.x = x;
    }

    private setY(y: number): void {
        this.y = y;
    }

    public toString(): string {
        return "(" + this.x + ", " + this.y + ")";
    }
}