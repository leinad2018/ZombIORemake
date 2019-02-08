import { IZIRInventoryStack } from "./globalInterfaces/UtilityInterfaces";

export class ZIRPlayerData{
    private playerID: string;
    private inventory: IZIRInventoryStack[];
    private health: number;
    private name: string;

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

    public getHealth(): number {
        return this.health;
    }

    public setHealth(health: number) {
        this.health = health;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }
}