import { GatewaysStorageFactory } from "./GatewaysStorageFactory";
import { Logger } from "../Core/Logger";
import { TMessageTypes, TMessage } from "../Types/MessageModel";
import { TNumPortsByProvider } from "../Gateway/Ports/PortsStorage";

export type TGatewayParams = {
    numPortsByProvider: TNumPortsByProvider,
    id: string,
    messagesType: TMessageTypes
};

export interface IGatewaysController {
    registerGateway(params: TGatewayParams);
    unregisterGateway(id: string, messagesType: TMessageTypes);
    messageToGateway(message: TMessage): boolean;
    getGatewaysMap(): Object;
}

export class GatewaysController implements IGatewaysController {

    private gatewayStorageFactory: GatewaysStorageFactory;

    constructor(gatewayStorageFactory: GatewaysStorageFactory) {
        this.gatewayStorageFactory = gatewayStorageFactory;
    }

    public async registerGateway(params: TGatewayParams) {
        let gatewayStorage = this.gatewayStorageFactory.getStorageOrBuildIfNotExists(params.messagesType);
        await gatewayStorage.append(params.numPortsByProvider, params.id);
        this.writeLogAboutRegisterGateway(params.id);
    }

    public unregisterGateway(id: string, messagesType: TMessageTypes) {
        let gatewayStorage = this.gatewayStorageFactory.getStorageOrBuildIfNotExists(messagesType);
        gatewayStorage.remove(id);
        this.gatewayStorageFactory.removeStorageByTypeIfEmpty(messagesType);
        this.writeLogAboutUnregisterGateway(id);
    }

    public messageToGateway(message: TMessage): boolean {
        let gatewayStorage = this.gatewayStorageFactory.getStorageByTypeOrDefault(message.type);
        if (!gatewayStorage) return false;

        let sender = gatewayStorage.getSender(message.providerId);
        if (!sender) return false;

        return sender.sendToQueue(message);
    }

    public getGatewaysMap(): Object {
        return this.gatewayStorageFactory.getStoragesMaps();
    }

    private writeLogAboutRegisterGateway(id: string): void {
        let map = this.gatewayStorageFactory.getStoragesMaps();
        let currentMap = JSON.stringify(map, null, 2);
        Logger.info("GatewaysController", "Registered gateway %s.\nCurrent map: %s", [id, currentMap]);
    }

    private writeLogAboutUnregisterGateway(id: string): void {
        let map = this.gatewayStorageFactory.getStoragesMaps();
        let currentMap = JSON.stringify(map, null, 2);
        Logger.info("GatewaysController", "Unregister gateway %s.\nCurrent map: %s", [id, currentMap]);
    }
}