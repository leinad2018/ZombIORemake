import { IZIRInventoryStack } from "./globalInterfaces/UtilityInterfaces";

export class ZIRPlayerData{
    private playerID: string;
    private inventory: IZIRInventoryStack[];

	public getPlayerID(): string {
		return this.playerID;
	}

	public setPlayerID(value: string) {
		this.playerID = value;
    }
    
    public getInventory(){
        return this.inventory;
    }

    public setInventory(newInventory: IZIRInventoryStack[]){
        this.inventory = newInventory;
    }
}