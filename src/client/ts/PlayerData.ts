import { IZIRInventorySlot } from "./globalInterfaces/UtilityInterfaces";

export class ZIRPlayerData{
    private playerID: string;
    private inventory: IZIRInventorySlot[];

	public getPlayerID(): string {
		return this.playerID;
	}

	public setPlayerID(value: string) {
		this.playerID = value;
    }
    
    public getInventory(){
        return this.inventory;
    }

    public setInventory(newInventory: IZIRInventorySlot[]){
        this.inventory = newInventory;
    }
}