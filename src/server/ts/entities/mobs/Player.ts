import { Vector } from "../../utilityObjects/Math";
import { ZIRZone, ZIRRectangularZone } from "../../baseObjects/Hitbox";
import { ZIRWorld } from "../../baseObjects/World";
import { ZIRBoomerang } from "../projectiles/Boomerang";
import { ZIRThrownRock } from "../projectiles/Rock";
import { ZIREnemy } from "./Enemy";
import { ZIRMob } from "../../baseObjects/Mob";
import { ZIRInventoryStack } from "../../baseObjects/Inventory";
import { ZIRServerEngine } from "../../ServerEngine";
import { ZIRSingleEvent, ZIREventScheduler } from "../../EventScheduler";

export class ZIRPlayer extends ZIRMob {
    private inventory: ZIRInventoryStack[];
    private cooldowns: { [ability: string]: boolean }; // For storing cooldown timestamps


    constructor(position: Vector = new Vector(1000 + Math.random() * 500, 1000 + Math.random() * 500), size: Vector = new Vector(50, 50), asset: string = "player", isPhysical: boolean = true) {
        super(position, size, asset, isPhysical);
        this.inventory = new Array(12);
        this.initInventory();
        this.cooldowns = {
            boomerang: true,
            rock: true,
        };
    }

    private initInventory() {
        for (let i = 0; i < this.inventory.length; i++) {
            this.inventory[i] = new ZIRInventoryStack("-1", "", 0);
        }
        // TODO remove this for final
        this.inventory[0].setItemID("rock");
        this.inventory[0].setStackSize(100);
        this.inventory[1].setItemID("boomerang");
        this.inventory[1].setStackSize(1000);
    }

    public do(inputs: any, worldState: ZIRWorld) {
        if (this.dead) {
            return;
        }

        const m = this.moveSpeed;
        let a = new Vector(0, 0);

        for (const input in inputs) {
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
                        if (this.cooldowns["boomerang"]) {
                            const rangs = this.getInventoryItemByID("boomerang");
                            if (rangs) {
                                mouse = inputs["mouse"];
                                direction = new Vector(mouse.x, mouse.y);
                                velocity = direction.getUnitVector().scale(30 * this.PIXELS_PER_METER);
                                p = new ZIRBoomerang(this, velocity.add(this.velocity), this.position);
                                worldState.registerEntity(p);
                                this.dropItem(new ZIRInventoryStack("boomerang", "", 1));
                                ZIREventScheduler.getInstance().registerEvent(this.startAbilityCooldown("boomerang"));
                            }
                        }
                        break;
                    case "click":
                        if (this.cooldowns["rock"]) {
                            const rocks = this.getInventoryItemByID("rock");
                            if (rocks) {
                                mouse = inputs["mouse"];
                                direction = new Vector(mouse.x, mouse.y);
                                velocity = direction.getUnitVector().scale(30 * this.PIXELS_PER_METER);
                                p = new ZIRThrownRock(this, velocity.add(this.velocity), this.position);
                                worldState.registerEntity(p);
                                this.dropItem(new ZIRInventoryStack("rock", "", 1));
                                ZIREventScheduler.getInstance().registerEvent(this.startAbilityCooldown("rock"));
                            }
                        }
                        break;
                    case "debug":
                        const e = new ZIREnemy(this.position);
                        worldState.registerEntity(e);
                        break;
                }
            }
        }

        if (a.getMagnitude() !== 0) {
            a = a.getUnitVector().scale(m);
        }
        this.acceleration = a;
    }

    private startAbilityCooldown(ability: string) {
        this.cooldowns[ability] = false;
        const cooldown = new ZIRAbilityCooldown(10, () => { this.setAbilityOffCooldown(ability); });
        return cooldown;
    }

    private setAbilityOffCooldown(ability: string) {
        this.cooldowns[ability] = true;
    }

    /**
     * Adds a new item to the inventory in either an existing slot or an empty on if there is no existing.
     * Returns true if the add succeeded.
     * This should never be called with information from the client.
     * @param newItem
     */
    public addToInventory(newItem: ZIRInventoryStack): boolean {
        for (const slot of this.inventory) {
            if (slot.getItemID() === newItem.getItemID()) {
                const oldAmount = slot.getStackSize();
                slot.setStackSize(oldAmount + newItem.getStackSize());
                return true;
            }
        }
        for (const slot of this.inventory) {
            if (slot.getItemID() === "-1") {
                slot.setItemID(newItem.getItemID());
                slot.setStackSize(newItem.getStackSize());
                return true;
            }
        }
        return false;
    }

    /**
     * Drops an item out of the inventory.
     * Returns true if the drop succeeded.
     */
    public dropItem(toDrop: ZIRInventoryStack): boolean {
        if (toDrop.getStackSize() < 0) {
            return false;
        }
        for (const slot of this.inventory) {
            if (slot.getItemID() === toDrop.getItemID()) {
                if (slot.getStackSize() < toDrop.getStackSize()) {
                    return false;
                }
                const newAmount = slot.getStackSize() - toDrop.getStackSize();
                slot.setStackSize(newAmount);
                if (newAmount === 0) {
                    slot.setItemID("-1");
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
    public reorderInventory(inventory: ZIRInventoryStack[]): boolean {
        if (inventory.length !== this.inventory.length) {
            return false;
        }
        for (const slot of inventory) {
            let found: boolean = false;
            for (let i = 0; !found && i < this.inventory.length; i++) {
                const oldSlot = this.inventory[i];
                if (oldSlot.getItemID() === slot.getItemID()) {
                    found = true;
                    if (oldSlot.getStackSize() !== slot.getStackSize()) {
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

    private getInventoryItemByID(itemID: string) {
        for (const inv of this.inventory) {
            if (inv.getItemID() === itemID) {
                return inv;
            }
        }
    }

    protected onBoomerangHit(other: ZIRZone) {
        const boomerang = other.getParent() as ZIRBoomerang;
        console.log(boomerang.getParent());
        console.log(this);
        if (boomerang.getParent() === this) {
            boomerang.kill();
        }
    }

    protected registerHitboxHandlers() {
        super.registerHitboxHandlers();
        this.hitboxHandlers["boomerang"] = this.onBoomerangHit.bind(this);
        // this.hitboxHandlers["collision"] = this.collide.bind(this);
    }

    public getObject() {
        return {
            health: this.health,
            inventory: this.inventory,
            name: this.name,
            playerID: this.id,
        };
    }

    public update() {
        return null;
    }

    protected createStaticHitboxes(): ZIRZone[] {
        const toReturn: ZIRZone[] = [];
        toReturn[0] = new ZIRRectangularZone(this.position, this, this.size, ["harvest", "player"]);
        return toReturn;
    }

    public toString(): string {
        return "Player" + this.id + "@" + this.position + "/V" + this.velocity + "/A" + this.acceleration;
    }
}

class ZIRAbilityCooldown extends ZIRSingleEvent {
    private abilityHandler: () => void;

    constructor(length: number, abilityHandler: () => void) {
        super(length);
        this.abilityHandler = abilityHandler;
    }

    public runEvent() {
        this.abilityHandler();
    }
}
