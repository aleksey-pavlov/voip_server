import { IInMemoryDb } from "../DatabaseRedis";

export interface ITokensStorage {
    setToken(name: string, value: string, liveSeconds: number): Promise<void>;
    getToken(name: string): Promise<string>;
}

export class TokensStorage implements ITokensStorage {

    private redis: IInMemoryDb;

    constructor(redis: IInMemoryDb) {
        this.redis = redis;
    }

    async setToken(name: string, value: string, liveSeconds: number): Promise<void> {
        if (await this.redis.set(name, value)) {
            await this.redis.expire(name, liveSeconds);
        }
    }

    async getToken(name: string): Promise<string> {
        return await this.redis.get(name);
    }

}