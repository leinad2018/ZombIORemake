
export class Vector {
    private x: number;
    private y: number;
    public static ZERO_VECTOR: Vector = new Vector(0, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public getMagnitude(): number {
        return (Math.sqrt((this.x * this.x) + (this.y * this.y)));
    }

    public scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    public getUnitVector(): Vector {
        const m = this.getMagnitude();
        return m === 0 ? new Vector(1, 0) : this.scale(1 / this.getMagnitude());
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

    public equals(other: Vector): boolean {
        return(this.x === other.x && this.y === other.y);
    }

    public toString(): string {
        return "(" + this.x + ", " + this.y + ")";
    }
}
