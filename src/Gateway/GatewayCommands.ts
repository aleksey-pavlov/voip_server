import { RpcReciver } from "../Core/Rpc/RpcReciver";
import { Logger } from "../Core/Logger";
import { TMessage } from "../Types/MessageModel";
import { IQueueSender } from "../Core/Queues/QueueSender";
import { IBoxes } from "./GatewayBoxes";
import { IBox } from "./GatewayBox";
import { GatewayController } from "./GatewayController";
import { TGatewaySource } from "./GatewayModel";
import { RpcCommands } from "../Config/Constants";

export class GatewayCommands {

    private controller: GatewayController;
    private rpcAdmin: RpcReciver;
    private providerQueue: IQueueSender;

    public constructor(controller: GatewayController, rpcAdmin: RpcReciver, providerQueue: IQueueSender) {
        this.rpcAdmin = rpcAdmin;
        this.controller = controller;
        this.providerQueue = providerQueue;
    }

    public listenCommands() {

        let reciver = this.rpcAdmin;
        reciver.subscribe(RpcCommands.GATEWAY_UPDATE, async msg => {
            try {
                let gateway: TGatewaySource = msg["gateway"];
                this.controller.updateGateway(gateway);
                return { message: "Ok" };
            } catch (err) {
                Logger.error("GatewayCommands.Update", err.stack);
                return { error: err.message };
            }
        });

        reciver.subscribe(RpcCommands.GATEWAY_EVACUATION, async msg => {

            try {
                let boxes: IBoxes = this.controller.getGatewayBoxes();
                let outbox: IBox = boxes.getOutbox();

                let messages: TMessage[] = null;
                while (messages = await outbox.get(1000)) {
                    for (let i in messages) {
                        messages[i].isRedirected = true;
                        this.providerQueue.sendToQueue(messages[i]);
                    }

                    if (messages.length === 0) {
                        break;
                    }
                }
                Logger.info("GatewayCommands.Evacuation", "Evacuetion success!");
                return { message: "Ok" };

            } catch (err) {
                Logger.error("GatewayCommands.Evacuation", err.stack);
                return { error: err.message };
            }
        });

        reciver.subscribe(RpcCommands.GATEWAY_STAT_OUTBOX, async msg => {

            try {
                let boxes: IBoxes = this.controller.getGatewayBoxes();
                let outbox: IBox = boxes.getOutbox();
                let stat: { [x: string]: number } = await outbox.stat();
                return stat;
            } catch (err) {
                Logger.error("GatewayCommands.OutboxStat", err.stack);
            }

        });

        reciver.listen();
    }
}