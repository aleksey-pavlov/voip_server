import { RpcSender } from "../Core/Rpc/RpcSender";
import { QueueReciver } from "../Core/Queues/QueueReciver";
import { Logger } from "../Core/Logger";
import { IBoxes } from "./GatewayBoxes";
import { TMessage } from "../Types/MessageModel";
import { TGatewaySource, IGateway } from "./GatewayModel";
import { GatewaySource } from "./GatewaySource";
import { RpcCommands } from "../Config/Constants";

export type TBuilder = (source: TGatewaySource) => Promise<IGateway>;

export class GatewayController {

    private rpcProvider: RpcSender;
    private queueProvider: QueueReciver;
    private gatewaySource: GatewaySource;
    private gatewayBuilder: TBuilder;
    private gateway: IGateway;

    public constructor(
        rpcProvider: RpcSender,
        queueProvider: QueueReciver,
        gatewaySource: GatewaySource,
        gatewayBuilder: TBuilder
    ) {
        this.rpcProvider = rpcProvider;
        this.queueProvider = queueProvider;
        this.gatewaySource = gatewaySource;
        this.gatewayBuilder = gatewayBuilder;
    }

    public async launchGatway(gatewayId: string): Promise<void> {
        try {
            let source:TGatewaySource = await this.gatewaySource.get(gatewayId);
            this.gateway = await this.gatewayBuilder(source);
            await this.gateway.initialize(source.ports);
            this.registerGateway(this.gateway);
        } catch (err) {
            Logger.error("GatewayLoader", err.stack);
        }
    }

    public getGatewayBoxes(): IBoxes {
        return this.gateway.getBoxes();
    }

    public async updateGateway(source: TGatewaySource): Promise<void> {
        try {
            await this.gateway.update(source);
        } catch (err) {
            Logger.error("GatewayLoader", err.stack);
        }
    }

    public async downGateway(): Promise<void> {
        try {
            await this.unregisterGateway(this.gateway);
        } catch (err) {
            Logger.error("GatewayLoader", err.stack);
        }
    }

    private async registerGateway(gateway: IGateway): Promise<void> {
        setInterval(async () => {
            await this.syncGateway(this.gateway);
        }, 5000);

        this.registerQueueHandler(gateway);
        await this.registerInProvider(gateway);
    }

    private async registerInProvider(gateway: IGateway): Promise<void> {

        await this.rpcProvider.sendAndGetReply(
            RpcCommands.GATEWAY_UP,
            {
                gatewayId: gateway.getId(),
                numPortsByProvider: gateway.getNumPortsByProvider(),
                messagesType: gateway.getMessagesType()
            });
        Logger.info("GatewayLoader", "Register in provider");
    }

    private registerQueueHandler(gateway: IGateway): void {
        this.queueProvider.consume(async (message: TMessage) => {
            await gateway.enqueueMessage(message);
            return true;
        });
    }

    private async unregisterGateway(gateway: IGateway): Promise<void> {

        await this.rpcProvider.sendAndGetReply(
            RpcCommands.GATEWAY_DOWN,
            {
                gatewayId: gateway.getId(),
                messagesType: gateway.getMessagesType()
            });
        Logger.info("GatewayLoader", "Unregister gateway");
        await this.syncGateway(gateway);
    }

    private async syncGateway(gateway: IGateway): Promise<void> {
        let data = await gateway.get();
        let id = gateway.getId();
        await this.gatewaySource.update(data, id);
    }
}