import { IZIRRenderable } from "./RenderingInterfaces";

export interface IZIRServerCommunications {
    registerServerListeners: () => void;

    setHandler: (type: string, handler: (data?: any) => void) => void;

    sendInfoToServer: (type: string, message: any) => void;

    getPlayersOnline: () => string[];
}

export interface IZIREntity extends IZIRRenderable {
    getEntityId: () => string;
}