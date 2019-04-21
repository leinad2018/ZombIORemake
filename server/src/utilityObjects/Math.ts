
export class Vector {
    private x: number;
    private y: number;
    public static ZERO_VECTOR: Vector = new Vector(0, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Return true if this vector falls inside the input square
     * @param corner lower-left corner of the square
     * @param size 
     */
    public fallsWithin(corner: Vector, size: number): boolean {
        const x = corner.getX();
        const y = corner.getY();
        const maxX = x + size;
        const maxY = y + size;

        const xHit = this.x > x && this.x < maxX;

        if (xHit) {
            const yHit = this.y > y && this.y < maxY;
            return yHit;
        }
        return false;
    }

    public getMagnitude(): number {
        return (Math.sqrt((this.x * this.x) + (this.y * this.y)));
    }

    public scale(scalar: number): Vector {
        return new Vector(this.x * scalar, this.y * scalar);
    }

    public getUnitVector(): Vector {
        const m = this.getMagnitude();
        return m === 0 ? new Vector(1, 0) : this.scale(1 / m);
    }

    public dot(v: Vector): number {
        return((this.x * v.getX()) + (this.y * v.getY()));
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
