import { DatabaseMongo } from "../Core/DatabaseMongo";
import { Logger } from "../Core/Logger";

type BlackListDocument = {
    recipient: string,
}

export interface IBlackList {
    initialize(): Promise<void>;
    isBlocked(recipient: string): boolean;
}

export class BlackList implements IBlackList {

    private collection = "asset.blacklist";
    private mongoDb: DatabaseMongo;
    private recipients: { [x: string]: number } = {};
    constructor(mongoDb: DatabaseMongo) {
        this.mongoDb = mongoDb;
    }

    public async initialize(): Promise<void> {
        try {
            let rows = await this.mongoDb.collection(this.collection).find<BlackListDocument>({}).toArray();
            let recipients = {};
            if (rows) {
                for (let i in rows) {
                    recipients[rows[i].recipient] = 1;
                }

                this.recipients = recipients;
            }
        } catch (err) {
            Logger.error("BlackList", err.stack);
        }
    }

    public isBlocked(recipient: string): boolean {
        if (!!this.recipients[recipient])
            return true;

        return false;
    }
}