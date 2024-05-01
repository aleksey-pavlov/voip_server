import { IRpcReciver } from "../Core/Rpc/RpcReciver";
import { Logger } from "../Core/Logger";
import { MqChannel } from "../Core/DatabaseRabbit";
import { RpcCommands } from "../Config/Constants";
import { ISubscriber } from "../Core/PubSub/Subscriber";
import { ObjectID } from "bson";
import { TTrunkRegisterParams } from "./TrunksBalancer";
import { ITrunksBalancers } from "./TrunksBalancers";
import { ITrunkRegisteredStorage } from "./TrunkRegisteredStorage";

export interface ITrunksCommands {
    restoreRegisteredTrunks(): Promise<void>;
    listen(): void;
}

export interface TTrunkCommandParams {
    _id: string;
    id: string;
    provider: string;
    weight: number;
    bandwidth: number;
    sipChannelTemplate: string;
    defaultCaller: string;

    /** Balancing groups */
    groups: string[];
}

export class TTrunkCommandParamsExtensions {
    public static asTrunkRegisterParams(source: TTrunkCommandParams, caller: string): TTrunkRegisterParams {
        return {
            _id: source._id,
            id: source.id,
            provider: source.provider,
            weight: source.weight,
            bandwidth: source.bandwidth,
            sipChannelTemplate: source.sipChannelTemplate,
            defaultCaller: source.defaultCaller
        }
    }
}

export class TrunkProviderCommands implements ITrunksCommands {

    constructor(private cmdSubscriber: ISubscriber,
        private rpcReciver: IRpcReciver,
        private trunksBalancers: ITrunksBalancers,
        private voicesDirectCh: MqChannel,
        private persistenceStorage: ITrunkRegisteredStorage) {
    }

    public async restoreRegisteredTrunks(): Promise<void> {
        let registeredTrunksByGroupById = await this.persistenceStorage.load();
        for (let group in registeredTrunksByGroupById) {
            for (let id in registeredTrunksByGroupById[group]) {
                await this.trunksBalancers.addTrunk(group, registeredTrunksByGroupById[group][id]);
            }
        }

        Logger.info("TrunksCommands.restoreRegisteredTrunks", "Current balancer table after restore from storage %s", [JSON.stringify(this.trunksBalancers.getTable(), null, 2)]);
    }

    listen(): void {

        this.cmdSubscriber.subscribeAsync(new ObjectID().toString(), [RpcCommands.TRUNK_UP], async (trunkParams: TTrunkCommandParams) => {

            for (let i in trunkParams.groups) {

                let group = trunkParams.groups[i];
                let trunk = TTrunkCommandParamsExtensions.asTrunkRegisterParams(trunkParams, trunkParams.groups[i]);

                await this.trunksBalancers.removeTrunk(group, trunk);

                await this.trunksBalancers.addTrunk(group, trunk);

                await this.persistenceStorage.register(group, trunk);
            }

            await this.voicesDirectCh.recover();
            Logger.info("TrunksCommands.TrunkUp", "Current balancer table %s", [JSON.stringify(this.trunksBalancers.getTable(), null, 2)]);

            return true;
        });

        this.cmdSubscriber.subscribeAsync(new ObjectID().toString(), [RpcCommands.TRUNK_DOWN], async (trunkParams: TTrunkCommandParams) => {

            for (let i in trunkParams.groups) {

                let group = trunkParams.groups[i];
                let trunk = TTrunkCommandParamsExtensions.asTrunkRegisterParams(trunkParams, trunkParams.groups[i]);

                await this.trunksBalancers.removeTrunk(group, trunk);

                await this.persistenceStorage.unregister(group, trunk);
            }

            Logger.info("TrunksCommands.TrunkDown", "Current balancer table %s", [JSON.stringify(this.trunksBalancers.getTable(), null, 2)]);

            return true;
        });

        this.rpcReciver.subscribe(RpcCommands.TRUNK_PROVIDER_MAP, async () => {
            return this.trunksBalancers.getTable();
        });

        this.rpcReciver.listen();
    }

}