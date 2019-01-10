interface IZIRClient {
    registerUpdateHandler: (objectToUpdate: IZIRServerUpdate) => void;
    getBackgroundImage: () => string;
}