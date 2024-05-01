import * as redis from "redis";

export interface IInMemoryDb {

    lPush(key: string, value: any): boolean;
    rPush(key: string, value: any): boolean;
    lPop(key: string, limit: number): Promise<any[]>;
    lLen(key: string): Promise<number>;

    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<boolean>;
    del(key: string): Promise<boolean>;
    expire(key: string, seconds: number): Promise<boolean>;
    exists(key: string): Promise<boolean>;
    incr(key: string, count: number): Promise<number>;
    keys(keyMatch: string): Promise<string[]>;

    zAdd(key: string, score: number, value: any): Promise<boolean>;
    zRangeAndRem(key: string, count: number): Promise<any>;
    zLen(key: string): Promise<number>;
    zRange(key: string, count: number): Promise<string[]>;

    hSet(key: string, field: string, value: string): Promise<boolean>;
    hGet(key: string, field: string): Promise<string>;
    hGetAll(key: string): Promise<{ [x: string]: string }>;
    hDel(key: string, field: string): Promise<boolean>;
    hLen(key: string): Promise<number>;
}

export class DatabaseRedis implements IInMemoryDb {

    private client: redis.RedisClient;

    public constructor(redisUrl = "redis://localhost:6379") {
        this.client = redis.createClient(redisUrl);
    }

    public lPush(key: string, value: any): boolean {
        return this.client.lpush(key, value);
    }

    public rPush(key: string, value: any): boolean {
        return this.client.rpush(key, value);
    }

    public async lPop(key: string, limit: number): Promise<any[]> {
        return new Promise<any[]>((resolve, reject) => {
            let multi = this.client.multi();
            for (let i = 0; i < limit; i++) {
                multi.lpop(key);
            }
            multi.exec((err, result) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    public async lLen(key: string): Promise<number> {
        return new Promise<number>(resolve => {
            this.client.llen(key, (err, value) => {
                resolve(value);
            });
        });
    }

    public async get(key: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.client.get(key, (err, result) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    public async set(key: string, value: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.set(key, value, (err, result) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }

    public async del(key: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.del(key, (err, result) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }

    public async expire(key: string, seconds: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.expire(key, seconds, (err, result) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }

    public async exists(key: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.exists(key, (err, result) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(result > 0);
            });
        });
    }

    public async incr(key: string, count: number): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            let multi = this.client.multi();
            for (let i = 0; i < count; i++) {
                multi.incr(key);
            }
            multi.exec((err, result) => {
                if (err !== null) {
                    reject(err);
                }
                resolve(result[result.length - 1]);
            });
        });
    }

    public async zAdd(key: string, score: number, value: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.zadd(key, score, value, (err, result) => {
                if (err) reject(err);
                resolve(result > 0);
            });
        });
    }

    public async zRangeAndRem(key: string, count: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let multi = this.client.multi();
            let start = 0;
            let stop = count - 1;
            multi.zrange(key, start, stop);
            multi.zremrangebyrank(key, start, stop);
            multi.exec((err, result) => {
                if (err) reject(err);
                resolve(result[0]);
            });
        });
    }

    public async zLen(key: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.client.zcount(key, "-inf", "+inf", (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    public async zRange(key: string, count: number): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let start = 0;
            let stop = count - 1;
            this.client.zrange(key, start, stop, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
    }

    public async keys(keyMatch: string): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            this.client.keys(keyMatch, (err, keys: string[]) => {
                if (err) {
                    return reject(err);
                }

                resolve(keys);
            });
        });
    }

    public async hSet(key: string, field: string, value: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.hset(key, field, value, (err: Error, reply: number) => {

                if (err) {
                    return reject(err);
                }

                resolve(reply > 0);
            });
        });
    }

    public async hGet(key: string, field: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.client.hget(key, field, (err: Error, reply: string) => {
                if (err) {
                    return reject(err);
                }

                resolve(reply);
            });
        });
    }

    public async hGetAll(key: string): Promise<{ [x: string]: string }> {
        return new Promise<{ [x: string]: string }>((resolve, reject) => {
            this.client.hgetall(key, (err: Error, reply: { [x: string]: string }) => {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        });
    }

    public async hDel(key: string, field: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.client.hdel(key, field, (err: Error, reply: number) => {
                if (err) {
                    return reject(err);
                }

                resolve(reply > 0);
            });
        });
    }

    public async hLen(key: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            this.client.hlen(key, (err: Error, reply: number) => {
                if (err) {
                    return reject(err);
                }

                resolve(reply);
            });
        });
    }
}