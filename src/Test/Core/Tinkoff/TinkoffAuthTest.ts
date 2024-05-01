import { Config } from "../../../Config/Config";
import { IInMemoryDb } from "../../../Core/DatabaseRedis";
import { TinfoffAuth } from "../../../Core/TinkoffCloudApi/TinkoffAuth";
import { TokensStorage } from "../../../Core/YandexCloudApi/TokensStorage";


class RedisMock implements IInMemoryDb
{
    lPush(key: string, value: any): boolean {
        throw new Error("Method not implemented.");
    }
    rPush(key: string, value: any): boolean {
        throw new Error("Method not implemented.");
    }
    lPop(key: string, limit: number): Promise<any[]> {
        throw new Error("Method not implemented.");
    }
    lLen(key: string): Promise<number> {
        throw new Error("Method not implemented.");
    }
    get(key: string): Promise<any> {
        return new Promise<any>( resolve => {
            console.log(`RedisMock: try get ${key}`);
            resolve(false);
        });
    }
    set(key: string, value: any): Promise<boolean> {
        return new Promise<any>( resolve => {
            console.log(`RedisMock: set ${key} contain value ${value}`);
            resolve(true);
        });
    }
    del(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    expire(key: string, seconds: number): Promise<boolean> {
        return new Promise<boolean>( resolve => {
            console.log(`RedisMock: ${key} set expired to ${seconds} sec`);
            resolve(true);
        });
    }
    exists(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    incr(key: string, count: number): Promise<number> {
        throw new Error("Method not implemented.");
    }
    keys(keyMatch: string): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    zAdd(key: string, score: number, value: any): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    zRangeAndRem(key: string, count: number): Promise<any> {
        throw new Error("Method not implemented.");
    }
    zLen(key: string): Promise<number> {
        throw new Error("Method not implemented.");
    }
    zRange(key: string, count: number): Promise<string[]> {
        throw new Error("Method not implemented.");
    }
    hSet(key: string, field: string, value: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    hGet(key: string, field: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    hGetAll(key: string): Promise<{ [x: string]: string; }> {
        throw new Error("Method not implemented.");
    }
    hDel(key: string, field: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    hLen(key: string): Promise<number> {
        throw new Error("Method not implemented.");
    }

}


(async () => {
    let auth = new TinfoffAuth(Config.TINKOFF_API_KEY, Config.TINKOFF_API_SECRET, new TokensStorage(new RedisMock()));

    let token = await auth.getJwtToken();

    console.log(token);

})();

