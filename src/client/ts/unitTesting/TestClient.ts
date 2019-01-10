import { ZIRClientBase } from "../baseObjects/ClientBase";

export class ZIRTestClient extends ZIRClientBase{
    public runTest(){
        this.updateObjects();
    }

    public getBackgroundImage(){
        return "../assets/grass.png";
    }

}