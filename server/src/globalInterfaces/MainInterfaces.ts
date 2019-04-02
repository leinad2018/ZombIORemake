import { IZIRServerUpdate, IZIRUpdateResult, IZIRResetResult } from "./IServerUpdate";

export interface IZIRServerCommunications {
    setUpdateHandler: (handler: (data: IZIRUpdateResult) => void) => void;

    setResetHandler: (handler: (data: IZIRResetResult) => void) => void;

    setMessageHandler: (handler: (message) => void) => void;

    setUsernameHandler: (handler: () => void) => void;

    sendInfoToServer: (type: string, message: string) => void;

    getPlayersOnline: () => string[];
}

export interface IZIREntity {
    getEntityId: () => string;
}
