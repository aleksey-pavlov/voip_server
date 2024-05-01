import { DatabaseRedis } from "../Core/DatabaseRedis";
import { TMessage } from "../Types/MessageModel";

export interface IBox {
    add(message: TMessage): Promise<boolean>;
    get(limit: number): Promise<TMessage[]>;
    size(): Promise<number>;
    stat(): Promise<{[x:string]: number}>;
}

export class GatewayBox implements IBox {

    private key: string;
    private redis: DatabaseRedis;

    constructor(name: string[], redis: DatabaseRedis) {
        this.redis = redis;
        this.key = name.join("::");
    }

    public async add(message: TMessage): Promise<boolean> {
        let item = JSON.stringify(message);
        let result = await this.redis.zAdd(this.key, message.priority, item);
        return result;
    }

    public async get(limit: number): Promise<TMessage[]> {
        let items = await this.redis.zRangeAndRem(this.key, limit);
        let messages: TMessage[] = [];

        for (let i in items) {
            if (items[i] !== null) {
                messages.push(JSON.parse(items[i]));
            }
        }

        return messages;
    }

    public async size(): Promise<number> {
        let value = await this.redis.zLen(this.key);
        return value;
    }

    public async stat(): Promise<{ [x: string]: number }> {
        let data: { [x: string]: number } = {};
        let source: string[] = await this.redis.zRange(this.key, 0);

        for (let i in source) {
            let item: string = source[i];
            let message: TMessage = JSON.parse(item);
            if (data[message.providerId] === undefined) {
                data[message.providerId] = 0;
            }

            data[message.providerId]++;
        }

        return data;
    }
}