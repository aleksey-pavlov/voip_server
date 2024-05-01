import { ITrunksBalancer, TTrunkBalancer, TTrunkRegisterParams } from "./TrunksBalancer";



export interface ITrunksBalancers {
    getBalancer(group: string): ITrunksBalancer;
    getBalancerByTrunkId(id: string): ITrunksBalancer;
    getTrunk(group: string, provider: string): TTrunkBalancer;
    getTrunkById(trunkId: string): TTrunkBalancer;
    removeTrunk(group: string, trunk: TTrunkRegisterParams): boolean;
    addTrunk(group: string, trunk: TTrunkRegisterParams): Promise<boolean>;
    getTable(): Object;
}

export class TrunksBalancers implements ITrunksBalancers {

    public static readonly RESERVABLE = "reservable";
    public static readonly DEFAULT = "undefined";

    private balancersByGroup: { [x: string]: ITrunksBalancer } = {};
    private balancersByTrunkId: { [x: string]: ITrunksBalancer } = {};

    private balancersFactory: () => ITrunksBalancer;

    constructor(balancersFactory: () => ITrunksBalancer) {
        this.balancersFactory = balancersFactory;
    }

    public getBalancer(group: string): ITrunksBalancer {

        let key = group || TrunksBalancers.DEFAULT;
        return this.balancersByGroup[key];
    }

    public getBalancerByTrunkId(id: string): ITrunksBalancer {
        return this.balancersByTrunkId[id];
    }

    public getTrunk(group: string, provider: string): TTrunkBalancer {

        let balancer = this.getBalancer(group);
        if (!balancer)
            return undefined;

        return balancer.getTrunk(provider);
    }

    public getTrunkById(trunkId: string): TTrunkBalancer {
        let balancer = this.getBalancerByTrunkId(trunkId);
        if (!balancer)
            return undefined;

        return balancer.getTrunkById(trunkId);
    }

    public removeTrunk(group: string, trunk: TTrunkRegisterParams): boolean {

        let balancer = this.getBalancer(group);
        if (!balancer)
            return undefined;


        let isRemoved = balancer.removeTrunk(trunk);
        if (isRemoved)
            delete this.balancersByTrunkId[trunk._id];

        if (Object.keys(balancer.getTable().trunks).length < 1 )
            delete this.balancersByGroup[group];

        return isRemoved;
    }

    public async addTrunk(group: string, trunk: TTrunkRegisterParams): Promise<boolean> {

        let key = group || TrunksBalancers.DEFAULT;

        if (!this.balancersByGroup[key])
            this.balancersByGroup[key] = this.balancersFactory()

        let balancer = this.balancersByGroup[key];

        let isAdded = await balancer.addTrunk(trunk);
        if (isAdded)
            this.balancersByTrunkId[trunk._id] = balancer;

        return isAdded;
    }

    public getTable() {

        let map = {};

        for (let i in this.balancersByGroup)
            map[i] = this.balancersByGroup[i].getTable();

        return map;
    }
}