import { TVoiceMessage } from "../Types/VoiceModel";
import { IInMemoryDb } from "../Core/DatabaseRedis";

export interface IVoicesStorage {

    add(voice: TVoiceMessage): Promise<boolean>;
    get(systemId: string): Promise<TVoiceMessage>;
    del(systemId: string): Promise<boolean>;

    getAll(): Promise<TVoiceMessage[]>;
    count(): Promise<number>;

}

export class VoiceStorage implements IVoicesStorage {

    private db: IInMemoryDb;
    private storageId: string;

    constructor(storageId: string, db: IInMemoryDb) {
        this.db = db;
        this.storageId = storageId;
    }

    public async add(voice: TVoiceMessage): Promise<boolean> {

        let id = this.getStorageId();
        let field = voice.systemId;

        return await this.db.hSet(id, field, JSON.stringify(voice));
    }

    public async get(systemId: string): Promise<TVoiceMessage> {
        let id = this.getStorageId();
        let field = systemId;
        let source = await this.db.hGet(id, field);
        return JSON.parse(source);
    }

    public async del(systemId: string): Promise<boolean> {

        let id = this.getStorageId();
        let field = systemId;
        return await this.db.hDel(id, field);
    }

    public async getAll(): Promise<TVoiceMessage[]> {

        let id = this.getStorageId();
        let source = await this.db.hGetAll(id);

        let voices = [];
        for (let i in source)
            voices.push(JSON.parse(source[i]));

        return voices;
    }

    public async count(): Promise<number> {
        let id = this.getStorageId();
        let count = await this.db.hLen(id);
        return count;
    }

    private getStorageId(): string {
        return this.storageId;
    }
}

