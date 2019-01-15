import { IZIRServerUpdate, IZIRUpdateResult, IZIRResetResult } from "./IServerUpdate";
import { IZIRAsset, IZIRRenderable } from "./RenderingInterfaces";

export interface IZIRClient {
    getPlayersOnline: () => string[];
    /**
     * Registers a handler to be called when the the client is updated
     */
    registerUpdateHandler: (objectToUpdate: IZIRServerUpdate) => void;
    /**
     * Gets the current background image
     */
    getBackgroundImage: () => IZIRAsset;
    /**
     * Gets a list of all of the entities to render
     */
    getEntitiesToRender: () => IZIRRenderable[];
    /**
     * Sets the current view size so the client will know what needs to be rendered
     */
    setViewSize: (width: number, height: number) => void;
}

export interface IZIRServerCommunications {
    registerServerListeners: () => void;

    setUpdateHandler: (handler: (data: IZIRUpdateResult) => void) => void;

    setResetHandler: (handler: (data: IZIRResetResult) => void) => void;

    setMessageHandler: (handler: (message) => void) => void;

    setUsernameHandler: (handler: () => void) => void;

    sendInfoToServer: (type: string, message: any) => void;

    getPlayersOnline: () => string[];
}

export interface IZIREntity extends IZIRRenderable {
    getEntityId: () => number;
}