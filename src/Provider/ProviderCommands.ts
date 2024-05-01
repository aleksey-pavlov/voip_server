import { IGatewaysController } from "./GatewaysController";
import { RpcReciver } from "../Core/Rpc/RpcReciver";
import { MqChannel } from "../Core/DatabaseRabbit";
import { RpcCommands } from "../Config/Constants";
import { IBlackList } from "./BlackList";
import { Logger } from "../Core/Logger";

export class ProviderCommands {

    public constructor(private controller: IGatewaysController,
        private rpcGatewayReciver: RpcReciver,
        private smsDirectCh: MqChannel,
        private blackList: IBlackList) { }

    public listen() {
        let reciver = this.rpcGatewayReciver;
        reciver.subscribe(RpcCommands.GATEWAY_UP, async msg => {
            let numPortsByProvider = msg["numPortsByProvider"];
            let gatewayId = msg["gatewayId"];
            let messagesType = msg["messagesType"];
            await this.controller.registerGateway({
                id: gatewayId,
                numPortsByProvider: numPortsByProvider,
                messagesType: messagesType
            });
            await this.smsDirectCh.recover();
            return { status: 0, gatewayId: gatewayId };
        });

        reciver.subscribe(RpcCommands.GATEWAY_DOWN, async msg => {
            let gatewayId = msg["gatewayId"];
            let messagesType = msg["messagesType"];
            this.controller.unregisterGateway(gatewayId, messagesType);
            return { status: 0, gatewayId: gatewayId };
        });

        reciver.subscribe(RpcCommands.SYNC_BLACKLIST, async () => {
            await this.blackList.initialize();
            Logger.info("Provider", "Sync blacklist!");
            return true;
        });

        reciver.subscribe(RpcCommands.GATEWAYS_PROVIDER_MAP, async () => {
            return this.controller.getGatewaysMap();
        })

        reciver.listen();
    }
}