import { DatabaseRedis } from "../../Core/DatabaseRedis";
import { Logger } from "../../Core/Logger";

export enum ETerms {
    DAY,
    MONTH
}

export class SimService {

    private keyPrefix: string = "sim";
    private redis: DatabaseRedis;

    public constructor(redis: DatabaseRedis) {
        this.redis = redis;
    }

    public async getNumSent(imsi: string, term: ETerms): Promise<number> {
        try {
            let keyQuery = this.getQueryKey(imsi, term);
            let num = await this.redis.get(keyQuery);
            return Number(num)
        } catch (err) {
            Logger.error("Provider.SimService.getNumSent", err.stack);
        }
    }

    public async setSim(imsi: string, term: ETerms, expire?: number): Promise<boolean> {
        try {

            let keyQuery = this.getQueryKey(imsi, term);
            let isExists = await this.redis.exists(keyQuery);

            let result = true;

            if (!isExists) {
                result = await this.redis.set(keyQuery, 0);
            }
            
            if ( result && expire != undefined ) {
                result = await this.redis.expire(keyQuery, expire);
            }

            return result;

        } catch (err) {
            Logger.error("Provider.SimService.setSim", err.stack);
        }
    }

    public async incrNumSent(imsi: string, term: ETerms, count: number): Promise<number> {
        try {

            let keyQuery = this.getQueryKey(imsi, term);
            let num = await this.redis.incr(keyQuery, count);
            return Number(num);

        } catch (err) {
            Logger.error("Provider.SimService.incrNumSent", err.stack);
        }
    }

    private getQueryKey(imsi: string, term: ETerms): string {
        return `${this.keyPrefix}::${term}::${imsi}`;
    }

}