export class ZIRMenuController{
    private mainDiv: HTMLDivElement;

    constructor(mainDiv: HTMLDivElement){
        this.mainDiv = mainDiv;
    }

    public showRespawnMenu(handler: () => void){
        if(document.getElementById('respawn')){
            return;
        }
        let div = document.createElement('div');
        div.id = "respawn";
        let button = document.createElement('button');
        button.textContent = "Respawn";
        button.addEventListener('click', handler);
        div.appendChild(button);
        div.setAttribute('style', 'position:absolute;top:50%;left:50%');
        this.mainDiv.appendChild(div);
    }

    public hideRespawnMenu(){
        let div = document.getElementById('respawn');
        if(div){
            div.remove();
        }
    }
}