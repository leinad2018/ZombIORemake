export class ZIRInventoryStack {
    private itemID: string;
    private stackSize: number;
    private assetName: string;
    protected readonly maxStackSize = 100;

    constructor(itemID: string, assetName: string, initialNumber: number) {
        this.itemID = itemID;
        this.assetName = assetName;
        this.stackSize = initialNumber;
    }

    public setItemID(id: string) {
        this.itemID = id;
    }

    public getItemID() {
        return this.itemID;
    }

    public setStackSize(size: number) {
        this.stackSize = size;
    }

    public getStackSize() {
        return this.stackSize;
    }
}
