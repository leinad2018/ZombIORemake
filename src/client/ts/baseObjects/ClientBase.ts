export abstract class ZIRClientBase implements IZIRClient{
    private objectsToUpdate: IZIRServerUpdate[];

    constructor() {
        this.objectsToUpdate = [];
    }

    public registerUpdateHandler(objectToUpdate: IZIRServerUpdate) {
        this.objectsToUpdate.push(objectToUpdate);
    }

    protected updateObjects(){
        this.objectsToUpdate.forEach((object)=>{
            object.onServerUpdate();
        });
    }

    abstract getBackgroundImage();
}