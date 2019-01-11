interface IZIRClient {
    registerUpdateHandler: (objectToUpdate: IZIRServerUpdate) => void;
    getBackgroundImage: () => IZIRAsset;
}