import { ZIREntity } from "../baseObjects/EntityBase";
import { Vector } from "../utilityObjects/Math";
import { ZIRZone, ZIRRectangularZone } from "../baseObjects/Hitbox";
import { ZIRPlayer } from "./mobs/Player";
import { ZIRInventoryStack } from "../baseObjects/Inventory";

export class ZIRResourceNode extends ZIREntity {
    private itemType: string;

    constructor(position: Vector, size: Vector = new Vector(50, 50), asset: string, type: string) {
        super(position, size, asset, false);
        this.itemType = type;
    }

    protected registerHitboxHandlers() {
        this.hitboxHandlers["harvest"] = this.handleHarvest.bind(this);
    }

    private handleHarvest(otherZone: ZIRZone) {
        const parent: ZIREntity = otherZone.getParent();
        if (parent instanceof ZIRPlayer) {
            const player = (parent as ZIRPlayer);
            const resourceToGive = new ZIRInventoryStack(this.itemType, this.asset, 1);
            player.addToInventory(resourceToGive);
        }
    }

    protected createStaticHitboxes() {
        const hitbox = new ZIRRectangularZone(this.position, this, this.size);
        return [hitbox];
    }
}
