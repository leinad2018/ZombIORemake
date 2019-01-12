import { IZIRServerUpdate } from "./IServerUpdate";
import { IZIRAsset, IZIRRenderable } from "./RenderingInterfaces";

export interface IZIRClient {
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