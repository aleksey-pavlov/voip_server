import { IQueueSender } from "../Core/Queues/QueueSender";
import { TNumPortsByProvider } from "../Gateway/Ports/PortsStorage";
import { IGatewaysStorage, TQueueSenderFactory, TProviderGateways, TGatewaysSender, TGatewaysMap } from "./GatewaysStorageFactory";


export class GatewaysStorage implements IGatewaysStorage {

    private defaultProvider: string = "undefined";
    private queueSenderFactory: TQueueSenderFactory;
    private providerGateways: TProviderGateways = {};
    private numDivider: number = 1

    public constructor(queueSenderFactory: TQueueSenderFactory) {
        this.queueSenderFactory = queueSenderFactory;
    }

    public async append(numPortsByProvider: TNumPortsByProvider, gatewayId: string): Promise<void> {

        for (let provider in numPortsByProvider) {
            let numPorts = numPortsByProvider[provider];
            for (let i = 0; i < numPorts; i++) {
                await this.appendGateway(provider, gatewayId);
            }
        }
    }

    private async appendGateway(provider: string, gatewayId: string): Promise<void> {
        let sender = await this.queueSenderFactory(gatewayId);
        let gateway = { id: gatewayId, sender: sender };
        this.pushGatewaysAndCreateProviderIfNotExists(provider, gateway);
    }

    private pushGatewaysAndCreateProviderIfNotExists(provider: string, gateway: TGatewaysSender): void {
        if (!this.providerGateways[provider]) {
            this.providerGateways[provider] = [];
        }
        this.providerGateways[provider].push(gateway);
    }

    public remove(gatewayId: string): void {
        for (let provider in this.providerGateways) {
            let gateways = this.providerGateways[provider];
            let remainderGateways = gateways.filter(gateway => gateway.id !== gatewayId);
            this.setGateways(provider, remainderGateways);
        }
    }

    private setGateways(provider: string, gateways: TGatewaysSender[]): void {
        this.providerGateways[provider] = gateways;
        this.removeProviderIfEmpty(provider);
    }

    private removeProviderIfEmpty(provider: string): void {
        if (this.providerGateways[provider].length === 0) {
            delete this.providerGateways[provider];
        }
    }

    public getSender(provider: string): IQueueSender {
        let gateways = this.getGateways(provider);
        let gatewaysLength = gateways ? gateways.length : -1;
        let index = (this.numDivider++) % gatewaysLength;
        if (!gateways[index]) {
            return undefined;
        }

        return gateways[index].sender;
    }

    private getGateways(provider: string): TGatewaysSender[] {
        if (!this.providerGateways[provider]) {
            return this.providerGateways[this.defaultProvider] || [];
        }
        return this.providerGateways[provider];
    }

    public printMap(): TGatewaysMap {

        let map: TGatewaysMap = {};
        for (let provider in this.providerGateways) {
            let gateways = this.providerGateways[provider];
            if (!map[provider]) {
                map[provider] = {};
            }

            for (let port in gateways) {
                map[provider][port] = gateways[port].id;
            }
        }

        return map;
    }
}