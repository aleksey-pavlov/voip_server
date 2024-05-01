import { Logger } from "../Core/Logger";
import { DatabaseMongo } from "../Core/DatabaseMongo";


export type Provider = {
    _id: string;
    def: number;
    from: number;
    to: number;
    capacity: number;
    provider: string;
    region: string;
    providerId: string;
    timeZone: number;
}

export type MovedProvider = {
    _id: string;
    Number: string;
    OwnerID: string;
    providerId: string;
}

export type NumberProviderResponse = {
    providerId: string,
    provider: string,
    region: string,
    timeZone: number
};

type Providers = { [def: number]: Provider[] };

export class RegistryProviderStorage {

    private collectionDEF = "asset.providers_def";
    private collectionMNT = "asset.providers_mnt";

    private defaultProviderId = "undefined";

    private mongoDb: DatabaseMongo;
    private providers: Providers = {};

    constructor(mongoDb: DatabaseMongo) {
        this.mongoDb = mongoDb;
        setInterval(async () => {
            await this.initialize();
        }, 12 * 60 * 60 * 1000)
    }

    public async initialize() {
        let providers = await this.getProvidersFromDb();
        if (providers) {
            this.providers = providers;
        }
    }

    public async cleanMNT() {
        await this.mongoDb.dropCollection(this.collectionMNT);
        await this.mongoDb.collection(this.collectionMNT).createIndex({ Number: 1 });
    }

    public async appendMNT(providers: Array<{}>) {
        await this.mongoDb.collection(this.collectionMNT).insert(providers);
    }

    public async cleanDEF() {
        await this.mongoDb.dropCollection(this.collectionDEF);
        await this.mongoDb.collection(this.collectionDEF).createIndex({ def: 1, from: 1, to: 1 });
    }

    public async appendDEF(providers: Array<{}>) {
        await this.mongoDb.collection(this.collectionDEF).insert(providers);
    }

    private async getProvidersFromDb(): Promise<Providers> {
        try {
            let rows = await this.mongoDb.collection(this.collectionDEF).find<Provider>().toArray();
            let providers: Providers = {};
            for (let i in rows) {
                let def = rows[i].def;
                if (providers[def] == undefined) {
                    providers[def] = [];
                }
                providers[def].push(rows[i]);
            }

            Logger.info("ProvidersRegistry", "Loaded providers %s", [rows.length]);
            return providers;
        } catch (err) {
            Logger.error("ProvidersRegistry", err.stack);
        }
    }

    public async get(def: string, capacity: string): Promise<NumberProviderResponse> {
        try {
            let provider = this.getInitialProvider(def, capacity);
            let movedProvider = await this.mongoDb.collection(this.collectionMNT).findOne<MovedProvider>({ "Number": `${def}${capacity}` });
            if (movedProvider) {
                provider.provider = movedProvider.OwnerID;
                provider.providerId = movedProvider.providerId || this.defaultProviderId;
            }

            return provider;
        } catch (err) {
            Logger.error("ProviderRegistry", err);
        }
    }

    private getInitialProvider(def: string, capacity: string): NumberProviderResponse {
        if (this.providers[def]) {
            let row = this.providers[def].filter((provider: Provider) => {
                if (provider.to >= Number(capacity) && provider.from <= Number(capacity)) {
                    return true;
                }
                return false;
            });
            return this.createNumberProvider(row[0]);
        }

        return this.createNumberProvider(undefined);
    }

    private createNumberProvider(row: Provider): NumberProviderResponse {

        let numberProvider = {
            provider: this.defaultProviderId,
            providerId: this.defaultProviderId,
            region: "",
            timeZone: 0
        };

        if (row) {
            numberProvider.provider = row.provider || numberProvider.provider;
            numberProvider.providerId = row.providerId || numberProvider.providerId;
            numberProvider.region = row.region || numberProvider.region;
            numberProvider.timeZone = row.timeZone || 0
        }

        return numberProvider;
    }
}