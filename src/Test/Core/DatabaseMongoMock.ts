import { ObjectId } from "mongodb";
import { IObjectRepository } from "../../Core/DatabaseMongo";

export class ObjectRepositoryMock implements IObjectRepository {

    private data = null;

    create(data: { _id: ObjectId; }): Promise<{ _id: ObjectId; }> {
        
        this.data = data;
        return new Promise(r => r({ _id: data._id }));
    }

    findOne<T>(filter: Object): Promise<T> {
        return new Promise(r => r(this.data as T));
    }

    find<T>(filter: Object): Promise<T[]> {
        return new Promise(r => r([this.data as T]));
    }

    removeOne(filter: Object): Promise<boolean> {
        this.data = null;
        return new Promise(r => r(true));
    }

}