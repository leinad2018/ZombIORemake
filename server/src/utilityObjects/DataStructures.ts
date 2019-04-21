import { ZIREntity } from "../baseObjects/EntityBase";
import { Vector } from "./Math";

export class EntityQuadtree {
    public root: Node;
    public unsorted: ZIREntity[];
    public corner: Vector;
    public size: Vector;
    public split_threshold;

    /**
     * Create an EntityQuadtree wrapper object
     * @param entities List of entities to contain
     * @param size Side length of square area
     * @param corner Bottom-left coordinate
     */
    constructor(entities: ZIREntity[], size: number = 10000, corner: Vector = new Vector(-5000, -5000), split_threshold: number = 8, max_depth = 10) {
        this.split_threshold = split_threshold;
        this.root = new Node(null, -1, entities, size, corner, max_depth, this)
    }

    public getEntitiesAtAddress(address: number[]): ZIREntity[] {
        return this.root.getEntitiesAtAddress(address);
    }
}

class Node {
    public parent: Node;
    /**
     * Quartile-ID
     * tl: 0
     * tr: 1
     * bl: 2
     * br: 3
     */
    public qid: number;

    public divided: boolean;

    /**
     * Top-Left
     */
    public tl: Node;
    /**
     * Top-Right
     */
    public tr: Node;
    /**
     * Bottom-Left
     */
    public bl: Node;
    /**
     * Bottom-Right
     */
    public br: Node;

    public data: ZIREntity[];

    private structure: EntityQuadtree;
    private splits_allowed: number;
    private size: number;
    private corner: Vector;

    constructor(parent: Node, qid: number, entities: ZIREntity[], size: number, corner: Vector, splits_allowed: number, structure: EntityQuadtree) {
        this.qid = qid;
        this.parent = parent;
        this.splits_allowed = splits_allowed;
        this.divided = false;
        this.data = entities;
        this.size = size;
        this.corner = corner;
        this.structure = structure;

        if(this.data.length > this.structure.split_threshold && splits_allowed > 0) {
            this.divide();
        } else {
            const address = this.getAddress();
            for(let entity of this.data) {
                entity.setCollisionQuadtreeAddress(address);
            }
        }
    }

    public divide() {
        const size = this.size / 2;
        const q1_corner = this.corner.add(new Vector(0, size));
        const q2_corner = this.corner.add(new Vector(size, size));
        const q3_corner = this.corner;
        const q4_corner = this.corner.add(new Vector(size, 0));
        const q1_data = [];
        const q2_data = [];
        const q3_data = [];
        const q4_data = [];
        const border_data = [];
        const address = this.getAddress();

        for(let entity of this.data) {
            let q1 = false;
            let q2 = false;
            let q3 = false;
            let q4 = false;
            const points = entity.getHitboxPoints();
            for(let point of points) {
                if (!q1) {
                    q1 = point.fallsWithin(q1_corner, size);
                }
    
                if (!q2) {
                    q2 = point.fallsWithin(q2_corner, size);
                }
    
                if (!q3) {
                    q3 = point.fallsWithin(q3_corner, size);
                }
    
                if (!q4) {
                    q4 = point.fallsWithin(q4_corner, size);
                }
            }

            if ((q1 ? 1 : 0) + (q2 ? 1 : 0) + (q3 ? 1 : 0) + (q4 ? 1 : 0) > 1) {
                border_data.push(entity);
                entity.setCollisionQuadtreeAddress(address);
            } else {
                if (q1) {
                    q1_data.push(entity);
                }
    
                if (q2) {
                    q2_data.push(entity);
                }
    
                if (q3) {
                    q3_data.push(entity);
                }
    
                if (q4) {
                    q4_data.push(entity);
                }
            }
        }
        this.data = border_data;
        
        this.tl = new Node(this, 0, q3_data, size, q3_corner, this.splits_allowed - 1, this.structure);
        this.tr = new Node(this, 1, q4_data, size, q4_corner, this.splits_allowed - 1, this.structure);
        this.bl = new Node(this, 2, q1_data, size, q1_corner, this.splits_allowed - 1, this.structure);
        this.br = new Node(this, 3, q2_data, size, q2_corner, this.splits_allowed - 1, this.structure);

        this.divided = true;
    }
    
    public getAddress(): number[] {
        if(this.parent === null) {
            return [];
        }
        const address = this.parent.getAddress();
        address.push(this.qid);
        return address;
    }

    public getEntitiesAtAddress(address: number[]): ZIREntity[] {
        const nextAddress = [];
        if(address.length > 0) {
            for(let i = 1; i < address.length; i++) {
                nextAddress.push(address[i]);
            }
            let nextNode = null;
            switch(address[0]) {
                case 0:
                    nextNode = this.tl;
                    break;
                case 1:
                    nextNode = this.tr;
                    break;
                case 2:
                    nextNode = this.bl;
                    break;
                case 3:
                    nextNode = this.br;
                    break;
            }
            return this.data.concat(nextNode.getEntitiesAtAddress(nextAddress));
        } else {
            return this.data;
        }
    }
}
