import { DatabaseMongo, ObjectID } from "../Core/DatabaseMongo";
import { Logger } from "../Core/Logger";
import { TGatewaySource } from "./GatewayModel";

export class GatewaySource {
    private collection = "asset.gateways";
    private mongoDb: DatabaseMongo;
    public constructor(mongoDb: DatabaseMongo) {
        this.mongoDb = mongoDb;
    }

    public async getAll(filter: { location: string }): Promise<TGatewaySource[]> {
        try {
            let data = await this.mongoDb.collection(this.collection).find<TGatewaySource>(filter).toArray();
            return data;
        } catch (err) {
            Logger.error("GatewaySource.getAll", err.stack);
        }
    }

    public async get(gatewayId: string): Promise<TGatewaySource> {
        try {
            let id = new ObjectID(gatewayId);
            let data = await this.mongoDb.collection(this.collection).findOne({ _id: id });
            return data;
        } catch (err) {
            Logger.error("GatewaySource.get", err.stack);
        }
    }

    public async update(data: TGatewaySource, gatewayId: string): Promise<void> {
        try {
            let id = new ObjectID(gatewayId);
            delete data._id;
            await this.mongoDb.collection(this.collection).updateOne({ _id: id }, { '$set': data });
        } catch (err) {
            Logger.error("GatewaySource.update", err.stack);
        }
    }
}