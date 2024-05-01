import { TTrunkRegisterParams } from "./TrunksBalancer";
import { DatabaseRedis } from "../Core/DatabaseRedis";

export type TRegisteredTrunks = { [x: string]: { [x: string]: TTrunkRegisterParams } };

export interface ITrunkRegisteredStorage {
    register(group: string, trunk: TTrunkRegisterParams): Promise<boolean>;
    unregister(group: string, trunk: TTrunkRegisterParams): Promise<boolean>;
    load(): Promise<TRegisteredTrunks>;
}

export class TrunkRegisteredStorage implements ITrunkRegisteredStorage {
    private STATE_KEY = "trunksBalancersStateKey";
    private registeredTrunksByGroupById: TRegisteredTrunks = {};

    constructor(private redis: DatabaseRedis) { }

    async register(group: string, trunk: TTrunkRegisterParams): Promise<boolean> {

        if (!this.registeredTrunksByGroupById[group])
            this.registeredTrunksByGroupById[group] = {};

        this.registeredTrunksByGroupById[group][trunk._id] = trunk;

        return await this.redis.set(this.STATE_KEY, JSON.stringify(this.registeredTrunksByGroupById));
    }

    async unregister(group: string, trunk: TTrunkRegisterParams): Promise<boolean> {
        if (!this.registeredTrunksByGroupById[group])
            this.registeredTrunksByGroupById[group] = {};

        delete this.registeredTrunksByGroupById[group][trunk._id];

        return await this.redis.set(this.STATE_KEY, JSON.stringify(this.registeredTrunksByGroupById));
    }

    async load(): Promise<TRegisteredTrunks> {
        let data = await this.redis.get(this.STATE_KEY);
        this.registeredTrunksByGroupById = JSON.parse(data) || {};

        return this.registeredTrunksByGroupById;
    }
}