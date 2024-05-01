import { DatabaseRedis } from "../Core/DatabaseRedis";
import { TVoiceMessage } from "../Types/VoiceModel";

export interface IVoicesQueue {
    add(message: TVoiceMessage): Promise<boolean>;
    get(limit: number): Promise<TVoiceMessage[]>;
    size(): Promise<number>;
}

export class VoicesQueue implements IVoicesQueue {

    private key: string;
    private redis: DatabaseRedis;

    constructor(name: string, redis: DatabaseRedis) {
        this.redis = redis;
        this.key = name;
    }

    public async add(voice: TVoiceMessage): Promise<boolean> {
        let item = JSON.stringify(voice);
        let result = await this.redis.zAdd(this.key, voice.priority, item);
        return result;
    }

    public async get(limit: number): Promise<TVoiceMessage[]> {
        let items = await this.redis.zRangeAndRem(this.key, limit);
        let voices: TVoiceMessage[] = [];

        for (let i in items) {
            if (items[i] !== null) {
                voices.push(JSON.parse(items[i]));
            }
        }

        return voices;
    }

    public async size(): Promise<number> {
        let value = await this.redis.zLen(this.key);
        return value;
    }
}