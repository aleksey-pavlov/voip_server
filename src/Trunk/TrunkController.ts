import { ITrunkSource } from "./TrunkSource";
import { ITrunk, TTrunkSource } from "./TrunkModel";
import { IQueueReciver } from "../Core/Queues/QueueReciver";
import { TVoiceMessage } from "../Types/VoiceModel";
import { Logger } from "../Core/Logger";
import { IPublisher } from "../Core/PubSub/Publisher";
import { RpcCommands } from "../Config/Constants";
import { delayAsync } from "../Core/Utils";
import { TTrunkCommandParams } from "../TrunkProvider/TrunkProviderCommands";
import { TrunksBalancers } from "../TrunkProvider/TrunksBalancers";


export type TTrunkBuilder = (source: TTrunkSource) => Promise<ITrunk>;

export interface ITrunkController {
    launchTrank(trunkId: string): Promise<void>;
    shutdownTrunk(trunkId: string): Promise<void>;
    updateTrunk(source: TTrunkSource): Promise<void>;
    getTrunk(): ITrunk;
    registerProvider(): Promise<void>;
    unregisterProvider(): Promise<void>;
}

export class TrunkController implements ITrunkController {

    private trunk: ITrunk;

    constructor(private trunkSource: ITrunkSource,
        private cmdPublisher: IPublisher,
        private voicesProvider: IQueueReciver,
        private trunkBuilder: TTrunkBuilder) {
    }

    public async launchTrank(trunkId: string): Promise<void> {

        try {
            let trunkSource = await this.trunkSource.get(trunkId);

            if (!trunkSource) {
                Logger.warn("TrunkController.launchTrank", `TrunkId=${trunkId} not found`);
                process.exit();
            }

            this.trunk = await this.trunkBuilder(trunkSource);
            this.trunk.initialize();

            await this.registerQueueHandler(this.trunk);
            this.registerInProvider(this.trunk);

            setInterval(async () => {
                let syncData = await this.trunk.getSynhronizableData();
                this.trunkSource.sync(syncData, this.trunk.getId());
            }, 5 * 1000);

        } catch (err) {
            Logger.error("TrunkController.launchTrunk", err.stack);
        }
    }

    public async shutdownTrunk(): Promise<void> {
        try {
            await this.unregisterTrunk(this.trunk);
            this.trunk.deactivateTrunk();
            await this.shutdownReq();
        } catch (err) {
            Logger.error("TrunkController.shutdownTrunk", err.stack);
        }
    }

    private async shutdownReq(): Promise<void> {
        let source = await this.trunk.getSynhronizableData();
        if (source.statistic.active > 0) {
            Logger.info("TrunkController.shutdown", `TrunkId=${this.trunk.getId()} ActiveCalls=${source.statistic.active}`);
            await delayAsync(10);
            await this.shutdownReq();
        }
    }

    public async updateTrunk(source: TTrunkSource): Promise<void> {
        this.trunk.update(source);
        let updatedSource = await this.trunk.getSource();
        this.trunkSource.update(updatedSource, this.trunk.getId());
    }

    public getTrunk(): ITrunk {
        return this.trunk;
    }

    public async registerProvider(): Promise<void> {
        let trunk = this.getTrunk();
        await this.registerInProvider(trunk);
    }

    public async unregisterProvider(): Promise<void> {
        let trunk = this.getTrunk();
        await this.unregisterTrunk(trunk);
    }

    private async registerInProvider(trunk: ITrunk): Promise<void> {

        let params = await this.getTrunkRegisterParams(trunk);
        this.cmdPublisher.publish(RpcCommands.TRUNK_UP, params);

        Logger.info("TrunkController", `TrunkId=${trunk.getId()} register in provider done`);
    }

    private async unregisterTrunk(trunk: ITrunk): Promise<void> {

        let params = await this.getTrunkRegisterParams(trunk);
        this.cmdPublisher.publish(RpcCommands.TRUNK_DOWN, params);

        Logger.info("TrunkController", `TrunkId=${trunk.getId()} unregister done`);
    }

    private async getTrunkRegisterParams(trunk: ITrunk): Promise<TTrunkCommandParams> {

        let source = await trunk.getSource();

        let callers = [...source.callers]

        if (callers.length < 1)
            callers.push(TrunksBalancers.DEFAULT);

        if (source.reservable)
            callers.push(TrunksBalancers.RESERVABLE);

        return {
            _id: source._id.toString(),
            provider: source.provider,
            id: source.id,
            weight: source.weight,
            bandwidth: source.bandwidth,
            sipChannelTemplate: source.sipChannelTemplate,
            defaultCaller: source.defaultCaller,
            groups: callers
        }
    }

    private async registerQueueHandler(trunk: ITrunk): Promise<void> {
        await this.voicesProvider.consume(async (voice: TVoiceMessage) => await trunk.enqueueHandler(voice));

        Logger.info("TrunkController", `TrunkId=${trunk.getId()} register queue voices done`);
    }
}