import { DatabaseMongo } from "../../Core/DatabaseMongo";

export interface IMessagesSettings {
    maxNumUses: number;
    maxReplaceChars: number;
}

export class MessagesSettings implements IMessagesSettings {

    private mongoDb: DatabaseMongo
    private mongoCollection: string = "asset.settings";

    public maxNumUses: number = 1;
    public maxReplaceChars: number = 1;

    constructor(mongoDb: DatabaseMongo) {
        this.mongoDb = mongoDb;
        this.initialize();
    }

    private async initialize(): Promise<void> {
        let data = await this.mongoDb.collection(this.mongoCollection).find().limit(1).next();
        this.maxNumUses = data["maxNumUses"] || this.maxNumUses;
        this.maxReplaceChars = data["maxReplaceChars"] || this.maxReplaceChars;
    }
}