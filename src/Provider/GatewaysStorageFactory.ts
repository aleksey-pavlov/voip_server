import { GatewaysStorage } from "./GatewaysStorage";
import { IQueueSender } from "../Core/Queues/QueueSender";
import { TNumPortsByProvider } from "../Gateway/Ports/PortsStorage";

export type TGatewaysSender = { sender: IQueueSender, id: string };
export type TProviderGateways = {
    [provider: string]: TGatewaysSender[]
};
export type TGatewaysMap = { [provider: number]: { [x: number]: string } };
export type TQueueSenderFactory = (gatewayId: string) => Promise<IQueueSender>;

export interface IGatewaysStorage {
    append(numPortsByProvider: TNumPortsByProvider, gatewayId: string): void;
    remove(gatewayId: string): void;
    getSender(provider: string): IQueueSender;
    printMap(): TGatewaysMap;
}

export class GatewaysStorageFactory {

    private defaultType = "undefined";
    private storagesByMessageType: { [type: string]: IGatewaysStorage } = {};
    private queueSenderFactory: TQueueSenderFactory;

    constructor(queueSenderFactory: TQueueSenderFactory) {
        this.queueSenderFactory = queueSenderFactory;
    }

    public getStorageOrBuildIfNotExists(type: string): IGatewaysStorage {

        if (this.storagesByMessageType[type] == undefined) {
            let gatewayStorage = this.buildStorage();
            this.storagesByMessageType[type] = gatewayStorage;
        }

        return this.storagesByMessageType[type];
    }

    public getStorageByTypeOrDefault(type: string): IGatewaysStorage {

        if (this.storagesByMessageType[type] == undefined) {
            return this.storagesByMessageType[this.defaultType];
        }

        return this.storagesByMessageType[type];
    }

    public removeStorageByTypeIfEmpty(type: string): boolean {
        let storage = this.storagesByMessageType[type];
        let map = storage.printMap();
        if (Object.keys(map).length == 0) {
            delete this.storagesByMessageType[type];
            return true;
        }

        return false;
    }

    public getStoragesMaps(): Object {
        let map = {};
        for (let i in this.storagesByMessageType) {
            map[i] = this.storagesByMessageType[i].printMap();
        }

        return map;
    }

    private buildStorage(): IGatewaysStorage {
        return new GatewaysStorage(this.queueSenderFactory);
    }
}