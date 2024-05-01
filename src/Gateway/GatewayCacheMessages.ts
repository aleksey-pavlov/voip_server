import { DatabaseRedis } from "../Core/DatabaseRedis";
import { TMessage } from "../Types/MessageModel";

export interface ICacheMessages {
    append: (message: TMessage) => Promise<void>;
    get: (gatewaId: string, deviceUserId: number) => Promise<TMessage>;
}

export class GatewayCacheMessages implements ICacheMessages {

    private redis: DatabaseRedis;
    private expireTime: number = 43200;

    public constructor(redis: DatabaseRedis) {
        this.redis = redis;
    }

    public async append(message: TMessage): Promise<void> {
        let key = this.getCacheKey(message.gatewayIdSent, message.deviceUserId);
        let value = JSON.stringify(message);
        await this.redis.set(key, value);
        await this.redis.expire(key, this.expireTime);
    }

    public async get(gatewaId: string, deviceUserId: number): Promise<TMessage> {
        let key = this.getCacheKey(gatewaId, deviceUserId);
        let result = await this.redis.get(key);

        if (result) {
            let message = JSON.parse(result);
            return message;
        }

        return undefined;
    }

    private getCacheKey(gatewaId: string, deviceUserId: number): string {
        return ["msg", gatewaId, deviceUserId].join("::");
    }
}