import { IRpcReciver } from "../Core/Rpc/RpcReciver";
import { Logger } from "../Core/Logger";
import { RpcCommands } from "../Config/Constants";
import { ITrunkController } from "./TrunkController";
import { TTrunkSource } from "./TrunkModel";
import { IQueueSender } from "../Core/Queues/QueueSender";
import { TVoiceMessage, EVoiceStatus } from "../Types/VoiceModel";
import { IVoicesStatus } from "../Services/VoicesStatus";


export class TrunkCommands {

    public constructor(private rpcAdmin: IRpcReciver,
        private trunkController: ITrunkController,
        private providerQueue: IQueueSender,
        private voiceStatus: IVoicesStatus) {
    }

    public listenCommands() {

        let reciver = this.rpcAdmin;

        reciver.subscribe(RpcCommands.TRUNK_UPDATE, async (source: TTrunkSource) => {
            try {
                await this.trunkController.updateTrunk(source);
                return { message: "Ok" };
            } catch (err) {
                Logger.error("TrunkCommands.update", err.stack);
                return { message: "Error" }
            }
        });

        reciver.subscribe(RpcCommands.TRUNK_EVACUATION, async () => {

            try {
                let trunk = this.trunkController.getTrunk();
                let queue = trunk.getVoicesQueue();
                let voices: TVoiceMessage[] = null;
                while (voices = await queue.get(1000)) {
                    for (let i in voices) {
                        voices[i].isRedirected = true;
                        this.providerQueue.sendToQueue(voices[i]);
                    }

                    if (voices.length === 0) {
                        break;
                    }
                }
                Logger.info("GatewayCommands.Evacuation", "Evacuetion success!");
                return { message: "Ok" };

            } catch (err) {
                Logger.error("TrunkCommands.evacuation", err.stack);
                return { message: "Error" }
            }

        });

        reciver.subscribe(RpcCommands.TRUNK_GET_ACTIVE_VOICES, async () => {
            try {
                let trunk = this.trunkController.getTrunk();
                let storage = trunk.getActiveVoices();
                return await storage.getAll();
            } catch (e) {
                Logger.error("TrunkCommands.getActiveVoices", e.stack);
                return { message: "Error" }
            }
        });

        reciver.subscribe(RpcCommands.TRUNK_CLEAN_ACTIVE_VOICES, async () => {
            try {
                let trunk = this.trunkController.getTrunk();
                let storage = trunk.getActiveVoices();
                let voices: TVoiceMessage[] = await storage.getAll();
                for (let i in voices) {
                    voices[i].status = EVoiceStatus.DELETED;
                    await this.voiceStatus.change(voices[i]);
                    await storage.del(voices[i].systemId);
                }

                return { message: "Ok" };
            } catch (e) {
                Logger.error("TrunkCommands.cleanActiveVoices", e.stack);
                return { message: "Error" }
            }
        });

        reciver.subscribe(RpcCommands.TRUNK_GET_QUEUE, async () => {
            try {
                let trunk = this.trunkController.getTrunk();
                let queue = trunk.getVoicesQueue();

                let voices = await queue.get(10);
                let returnedVoices = [];
                for (let i in voices) {
                    await queue.add(voices[i]);
                    returnedVoices.push(voices[i]);
                }

                return returnedVoices;
            } catch (e) {
                Logger.error("TrunkCommands.getActiveVoices", e.stack);
                return { message: "Error" }
            }
        });

        reciver.subscribe(RpcCommands.TRUNK_CLEAN_QUEUE, async () => {
            try {
                let trunk = this.trunkController.getTrunk();
                let queue = trunk.getVoicesQueue();

                let voices = await queue.get(10);

                for (let i in voices) {
                    voices[i].status = EVoiceStatus.DELETED;
                    await this.voiceStatus.change(voices[i]);
                }

                return { message: "Ok" };
            } catch (e) {
                Logger.error("TrunkCommands.cleanActiveVoices", e.stack);
                return { message: "Error" }
            }
        });

        reciver.subscribe(RpcCommands.TRUNK_UNREGISTER_PROVIDER, async () => {
            try {
                await this.trunkController.unregisterProvider();
                return { message: "Ok" };
            } catch (e) {
                Logger.error("TrunkCommands.unregisterProvider", e.stack);
                return { message: "Error" }
            }
        });

        reciver.subscribe(RpcCommands.TRUNK_REGISTER_PROVIDER, async () => {
            try {
                await this.trunkController.registerProvider();
                return { message: "Ok" };
            } catch (e) {
                Logger.error("TrunkCommands.registerProvider", e.stack);
                return { message: "Error" }
            }
        });

        reciver.listen();
    }
}