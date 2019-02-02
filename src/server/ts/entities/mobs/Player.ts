import { ZIREntity } from "../../baseObjects/EntityBase"
import { Vector } from "../../utilityObjects/Math"
import { IZIRInventorySlot } from "../../globalInterfaces/UtilityInterfaces";
import { ZIRZone, ZIRRectangularZone } from "../../baseObjects/Hitbox";
import { ZIRWorld } from "../../baseObjects/World";
import { ZIRBoomerang } from "../projectiles/Boomerang";
import { ZIRThrownRock } from "../projectiles/Rock";
import { ZIREnemy } from "./Enemy";
import { ZIRMob } from "../../baseObjects/Mob";

export class ZIRPlayer extends ZIRMob {
    private inventory: IZIRInventorySlot[];
    private cooldownUses: { [ability: string]: number }; // For storing cooldown timestamps


    constructor(position: Vector = new Vector(1000 + Math.random() * 500, 1000 + Math.random() * 500), size: Vector = new Vector(50, 50), asset: string = "player", isPhysical: boolean = true) {
        super(position, size, asset, isPhysical);
        this.inventory = new Array(12).fill({ itemID: -1, amount: 0 });
    }

    public do(inputs: any, worldState: ZIRWorld) {
        
        if(this.dead) {
            return;
        }
        
        let m = this.moveSpeed;
        let a = new Vector(0, 0);

        for (let input in inputs) {
            if (inputs[input]) {
                let mouse;
                let direction;
                let velocity;
                let p;
                switch (input) {
                    case "upArrow":
                        a = a.add(new Vector(0, -m));
                        break;
                    case "downArrow":
                        a = a.add(new Vector(0, m));
                        break;
                    case "leftArrow":
                        a = a.add(new Vector(-m, 0));
                        break;
                    case "rightArrow":
                        a = a.add(new Vector(m, 0));
                        break;
                    case "space":
                        mouse = inputs["mouse"];
                        direction = new Vector(mouse.x, mouse.y);
                        velocity = direction.getUnitVector().scale(30 * this.PIXELS_PER_METER);
                        p = new ZIRBoomerang(this, velocity.add(this.velocity), this.position);
                        worldState.registerEntity(p);
                        break;
                    case "click":
                        mouse = inputs["mouse"]
                        direction = new Vector(mouse.x, mouse.y);
                        velocity = direction.getUnitVector().scale(30 * this.PIXELS_PER_METER)
                        p = new ZIRThrownRock(this, velocity.add(this.velocity), this.position);
                        worldState.registerEntity(p);
                        break;
                    case "debug":
                        let e = new ZIREnemy(this.position);
                        worldState.registerEntity(e);
                        break;
                }
            }
        }

        if (a.getMagnitude() != 0) {
            a = a.getUnitVector().scale(m);
        }
        this.acceleration = a;
    }

    /**
     * Adds a new item to the inventory in either an existing slot or an empty on if there is no existing.
     * Returns true if the add succeeded.
     * This should never be called with information from the client.
     * @param newItem 
     */
    public addToInventory(newItem: IZIRInventorySlot): boolean {
        for (let slot of this.inventory) {
            if (slot.itemID == newItem.itemID) {
                slot.itemID = newItem.itemID;
                slot.amount = newItem.amount;
                return true;
            }
        }
        for (let slot of this.inventory) {
            if (slot.itemID == "-1") {
                slot.itemID = newItem.itemID;
                slot.amount = newItem.amount;
                return true;
            }
        }
        return false;
    }

    /**
     * Drops an item out of the inventory.
     * Returns true if the drop succeeded. 
     */
    public dropItem(toDrop: IZIRInventorySlot): boolean {
        if (toDrop.amount < 0) {
            return false;
        }
        for (let slot of this.inventory) {
            if (slot.itemID == toDrop.itemID) {
                if (slot.amount < toDrop.amount) {
                    return false;
                }
                slot.amount -= toDrop.amount;
                if (slot.amount == 0) {
                    slot.itemID = "-1";
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Reorders the inventory to the inputted inventory. 
     * Returns true if the reorder succeeded.
     * @param inventory 
     */
    public reorderInventory(inventory: IZIRInventorySlot[]): boolean {
        if (inventory.length != this.inventory.length) {
            return false;
        }
        for (let slot of inventory) {
            var found: boolean = false;
            for (let i = 0; !found && i < this.inventory.length; i++) {
                var oldSlot = this.inventory[i];
                if (oldSlot.itemID == slot.itemID) {
                    found = true;
                    if (oldSlot.amount != slot.amount) {
                        return false;
                    }
                }
            }
            if (!found) {
                return false;
            }
        }
        this.inventory = inventory;
        return true;
    }

    public getObject() {
        return {
            playerID: this.id,
            inventory: this.inventory,
            health: this.health
        };
    }

    protected createStaticHitboxes(): ZIRZone[] {
        let toReturn: ZIRZone[] = [];
        toReturn[0] = new ZIRRectangularZone(this.position, this, this.size);
        return toReturn;
    }

    public toString(): string {
        return "Player" + this.id + "@" + this.position + "/V" + this.velocity + "/A" + this.acceleration;
    }
}