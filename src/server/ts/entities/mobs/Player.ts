import { ZIREntity } from "../../baseObjects/EntityBase"
import { Vector } from "../../utilityObjects/Math"
import { IZIRInventorySlot } from "../../globalInterfaces/UtilityInterfaces";
import { ZIRZone, ZIRRectangularZone } from "../../baseObjects/Hitbox";

export class ZIRPlayer extends ZIREntity {
    private inventory: IZIRInventorySlot[];
    private cooldownUses: { [ability: string]: number }; // For storing cooldown timestamps

    constructor(position: Vector = new Vector(1000 + Math.random() * 500, 1000 + Math.random() * 500), size: Vector = new Vector(50, 50), asset: string = "player", isPhysical: boolean = true) {
        super(position, size, asset, isPhysical);
        this.inventory = new Array(12).fill({ itemID: -1, amount: 0 });
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
            inventory: this.inventory
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