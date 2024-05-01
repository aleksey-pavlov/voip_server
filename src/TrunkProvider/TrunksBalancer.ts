import { IQueueSender } from "../Core/Queues/QueueSender";
import { ArgumentNullError } from "../Core/Errors/ArgumentError";

export type TTrunkRegisterParams = {
    _id: string;
    id: string;
    provider: string;
    weight: number;
    bandwidth: number;
    sipChannelTemplate: string;
    defaultCaller: string;
}

export type TQueueSenderFactory = (trunkId: string) => Promise<IQueueSender>;
export type TTrunkSendersByGroup = { [provider: string]: TTrunkBalancer[] }
export type TTrunkBalancer = {
    id: string;
    provider: string;
    sipChannelTemplate: string;
    sender: IQueueSender;
    defaultCaller: string;
}

export type TTrunksBalancerTable = {
    map: { [provider: string]: { [x: number]: string } },
    trunks: { [id: string]: number }
};

export interface ITrunksBalancer {
    getTrunk(provider: string): TTrunkBalancer;
    getTrunkById(trunkId: string): TTrunkBalancer;
    addTrunk(trunk: TTrunkRegisterParams): Promise<boolean>;
    removeTrunk(trunk: TTrunkRegisterParams): boolean;
    getTable(): TTrunksBalancerTable;
}

export class TrunksBalancer implements ITrunksBalancer {

    private queueSenderFactory: TQueueSenderFactory;
    private numDivider: number = 1;
    private defaultGroup: string = "undefined";
    private trunksByProvider: TTrunkSendersByGroup = {};
    private trunksById: { [x: string]: TTrunkBalancer } = {}

    constructor(queueSenderFactory: TQueueSenderFactory) {

        if (!queueSenderFactory)
            throw new ArgumentNullError("queueSenderFactory");

        this.queueSenderFactory = queueSenderFactory;
    }

    public getTrunk(provider: string): TTrunkBalancer {

        let trunks = this.getTrunksProvider(provider);

        let trunksLength = trunks ? trunks.length : -1;
        let index = (this.numDivider++) % trunksLength;

        return trunks[index];
    }

    public getTrunkById(trunkId: string): TTrunkBalancer {
        return this.trunksById[trunkId];
    }

    public async addTrunk(trunk: TTrunkRegisterParams): Promise<boolean> {

        let provider = trunk.provider;
        let weight = trunk.weight;

        let sender = await this.queueSenderFactory(trunk._id);

        if (!this.trunksByProvider[provider])
            this.trunksByProvider[provider] = [];

        let trunkBalancer = {
            id: trunk.id,
            sender: sender,
            provider: provider,
            sipChannelTemplate: trunk.sipChannelTemplate,
            defaultCaller: trunk.defaultCaller,
        };

        for (let i = 0; i < weight; i++) {
            this.trunksByProvider[provider].push(trunkBalancer);
        }

        this.trunksById[trunk._id] = trunkBalancer;

        return true;
    }

    public removeTrunk(trunk: TTrunkRegisterParams): boolean {

        let provider = trunk.provider;
        let id = trunk.id;

        delete this.trunksById[trunk._id];

        if (!this.trunksByProvider[provider])
            return false;

        let remainder = this.trunksByProvider[provider].filter(trunk => trunk.id != id);
        if (remainder.length > 0) {
            this.trunksByProvider[provider] = remainder;
            return true;
        }

        delete this.trunksByProvider[provider];
    }

    public getTable(): TTrunksBalancerTable {

        let map: TTrunksBalancerTable = {
            map: {},
            trunks: this.getRegisteredTrunks()
        };

        for (let provider in this.trunksByProvider) {
            if (!map.map[provider])
                map.map[provider] = {};

            for (let t in this.trunksByProvider[provider]) {
                let trunk = this.trunksByProvider[provider][t];
                map.map[provider][t] = trunk.id;
            }
        }

        return map;
    }

    private getTrunksProvider(provider: string): TTrunkBalancer[] {
        if (!this.trunksByProvider[provider])
            return this.trunksByProvider[this.defaultGroup] || [];

        return this.trunksByProvider[provider];
    }

    private getRegisteredTrunks(): { [id: string]: number } {

        let trunks = {};

        for (let id in this.trunksById)
            trunks[id] = 1;

        return trunks;
    }

}