import { DatabaseMongo, ObjectID } from "../Core/DatabaseMongo";
import { Logger } from "../Core/Logger";
import { TTrunkSource, TTrunkSynhronizableData } from "./TrunkModel";

export interface ITrunkSource {
    getAll(filter: { location: string }): Promise<TTrunkSource[]>;
    get(trunkId: string): Promise<TTrunkSource>;
    update(data: TTrunkSource, trunkId: string): Promise<void>;
    sync(data: TTrunkSynhronizableData, trunkId: string): Promise<void>;
}

export class TrunkSource implements ITrunkSource {
    private collection = "asset.trunks";
    private mongoDb: DatabaseMongo;
    public constructor(mongoDb: DatabaseMongo) {
        this.mongoDb = mongoDb;
    }

    public async getAll(filter: { location: string }): Promise<TTrunkSource[]> {
        try {
            let data = await this.mongoDb.collection(this.collection).find<TTrunkSource>(filter).toArray();
            return data;
        } catch (err) {
            Logger.error("TrunkSource.getAll", err.stack);
        }
    }

    public async get(trunkId: string): Promise<TTrunkSource> {
        try {
            let id = new ObjectID(trunkId);
            let data = await this.mongoDb.collection(this.collection).findOne<TTrunkSource>({ _id: id });
            return data;
        } catch (err) {
            Logger.error("TrunkSource.get", err.stack);
        }
    }

    public async update(source: TTrunkSource, trunkId: string): Promise<void> {
        try {
            let id = new ObjectID(trunkId);
            delete source._id;
            await this.mongoDb.collection(this.collection).updateOne({ _id: id }, { '$set': source });
        } catch (err) {
            Logger.error("TrunkSource.update", err.stack);
        }
    }


    public async sync(source: TTrunkSynhronizableData, trunkId: string): Promise<void> {
        try {
            let id = new ObjectID(trunkId);
            delete source._id;
            await this.mongoDb.collection(this.collection).updateOne({ _id: id }, { '$set': source });
        } catch (err) {
            Logger.error("TrunkSource.sync", err.stack);
        }
    }
}