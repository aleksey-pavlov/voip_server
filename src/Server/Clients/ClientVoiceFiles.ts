import { DatabaseMongo, ObjectID } from "../../Core/DatabaseMongo";
import { WriteOpResult, DeleteWriteOpResultObject, Binary } from "mongodb";

export type VoiceFileModel = {
    _id: ObjectID;
    clientId: ObjectID;
    binary: Binary;
    comment: string;
}

export type VoiceFileResponse = {
    id: string;
    comment: string;
}

export class ClientVoiceFiles {

    private mongo: DatabaseMongo;
    private collection: string = "asset.voice_files";

    constructor(mongo: DatabaseMongo) {
        this.mongo = mongo;
    }

    public setCollection(collection: string) {
        this.collection = collection;
    }

    public async getFiles(clientId: string): Promise<VoiceFileResponse[]> {
        let files: VoiceFileModel[] = await this.mongo.collection(this.collection).find<VoiceFileModel>({ clientId: new ObjectID(clientId) }).toArray();

        let response: VoiceFileResponse[] = [];
        for (let i in files) {
            response.push({ id: files[i]._id.toString(), comment: files[i].comment });
        }

        return response;
    }

    public async getFile(id: string): Promise<Binary> {
        let file: VoiceFileModel = await this.mongo.collection(this.collection).findOne<VoiceFileModel>({ _id: new ObjectID(id) });
        return file.binary;
    }

    public async saveFile(clientId: string, buffer: Buffer, comment: string): Promise<string> {

        let file: VoiceFileModel = {
            _id: new ObjectID(),
            binary: new Binary(buffer, 2),
            clientId: new ObjectID(clientId),
            comment: comment
        };

        let result: WriteOpResult = await this.mongo.collection(this.collection).save(file);
        
        return result.result["upserted"][0]._id;
    }


    public async deleteFile(id: string): Promise<boolean> {
        let result: DeleteWriteOpResultObject = await this.mongo.collection(this.collection).deleteOne({ _id: new ObjectID(id) });
        return Boolean(result.result.ok);
    }
}