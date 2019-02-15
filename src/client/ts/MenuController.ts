import { IZIRInventoryStack } from "./globalInterfaces/UtilityInterfaces";

/**
 * All of the menus in this controller should be changed to look good
 */
export class ZIRMenuController {
    private mainDiv: HTMLDivElement;

    constructor(mainDiv: HTMLDivElement) {
        this.mainDiv = mainDiv;
    }

    public toggleMenu(menuName: string, argument: any) {
        console.log(menuName);
        if (document.getElementById(menuName)) {
            this.hideMenu(menuName);
        } else {
            switch (menuName) {
                case "inventory":
                    this.showInventoryMenu(argument);
                    break;
                case "respawn":
                    this.showInventoryMenu(argument);
                    break;
                case "build":
                    this.showBuildMenu(argument);
                    break;
            }
        }
    }

    public showRespawnMenu(handler: () => void) {
        if (document.getElementById("respawn")) {
            return;
        }
        const div = document.createElement("div");
        div.id = "respawn";
        const button = document.createElement("button");
        button.textContent = "Respawn";
        button.addEventListener("click", handler);
        div.appendChild(button);
        div.setAttribute("style", "position:absolute;top:50%;left:50%");
        this.mainDiv.appendChild(div);
    }

    public hideRespawnMenu() {
        this.hideMenu('respawn');
    }

    public showInventoryMenu(inventory: IZIRInventoryStack[]) {
        if (document.getElementById('inventory')) {
            return;
        }
        let div = document.createElement('div');
        div.id = "inventory";
        let invList = this.createInventoryList(inventory);
        div.appendChild(invList);
        div.setAttribute('style', 'position:absolute;top:5%;left:0%');
        this.mainDiv.appendChild(div);
    }

    private createInventoryList(inventory: IZIRInventoryStack[]) {
        let mainList = document.createElement('ul');
        for (let inv of inventory) {
            let element = document.createElement('li');
            element.textContent = inv.itemID + ": " + inv.stackSize;
            mainList.appendChild(element);
        }
        return mainList;
    }

    public hideInventoryMenu() {
        this.hideMenu('inventory');
    }

    public showBuildMenu(handler: (buildingType: string) => void) {
        if (document.getElementById("build")) {
            return;
        }
        let div = document.createElement("div");
        div.id = "build";
        this.createBuildMenu(div, handler);
        this.mainDiv.appendChild(div);
    }

    private createBuildMenu(div: HTMLDivElement, handler: (buildingType: string) => void) {
        for (let i = 0; i < 4; i++) {
            let button = document.createElement("button");
            button.textContent = "Building " + i;
            button.addEventListener("click", () => { handler(button.textContent) });
            div.appendChild(button);
        }
    }

    public hideBuildMenu() {
        this.hideMenu("build");
    }

    private hideMenu(id: string) {
        const div = document.getElementById(id);
        if (div) {
            div.remove();
        }
    }
}
