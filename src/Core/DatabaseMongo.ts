import { MongoClient, Db, ObjectID } from "mongodb";
export { MongoClient, Db as DatabaseMongo, ObjectID };


export interface IObjectRepository {

    create(data: { _id: ObjectID }): Promise<{ _id: ObjectID }>;
    findOne<T>(filter: Object): Promise<T>;
    find<T>(filter: Object): Promise<Array<T>>
    removeOne(filter: Object): Promise<boolean>;
}

export class ObjectRepository implements IObjectRepository {

    constructor(private mongo: Db, private collection: string) {

    }

    async create(data: { _id: ObjectID }): Promise<{ _id: ObjectID }> {

        let result = await this.mongo.collection(this.collection).updateOne({ _id: data._id }, data, { upsert: true });

        return result.upsertedId;
    }

    async findOne<T>(filter: Object): Promise<T> {
        return await this.mongo.collection(this.collection).findOne<T>(filter);
    }

    async find<T>(filter: Object): Promise<T[]> {
        return await this.mongo.collection(this.collection).find<T>(filter).toArray();
    }

    async removeOne(filter: Object): Promise<boolean> {

        let result = await this.mongo.collection(this.collection).deleteOne(filter);

        return result.deletedCount > 0;
    }


}