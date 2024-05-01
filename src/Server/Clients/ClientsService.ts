import { DatabaseMongo } from "../../Core/DatabaseMongo";
import { Logger } from "../../Core/Logger";
import { Client, ClientsCollection } from "./ClientsModel";
import md5 = require("md5");

export type TCredentialsParams = {
    login: string;
    password: string;
    authKey: string;
}

export interface IClientService {
    loadClients(): Promise<void>;
    getClient(authKey: string): Client;
    syncClients(): Promise<void>;
    getClientByCredentials(params: TCredentialsParams): Client;
}

export class ClientService implements IClientService {

    private clients: { [x: string]: Client } = {};
    private clientsByCredentials: { [x: string]: Client } = {};
    private mongoDb: DatabaseMongo;

    public constructor(mongoDb: DatabaseMongo) {
        this.mongoDb = mongoDb;
    }

    public async loadClients(): Promise<void> {
        try {
            let rows: Client[] = await this.mongoDb.collection(ClientsCollection).find<Client>({}).toArray();
            for (let row of rows) {
                let authKey: string = row.authKey;
                if (this.clients[authKey] === undefined) {
                    let client = new Client(row);

                    this.clients[authKey] = client;
                    this.clientsByCredentials[`${row.email}${row.password}`] = client;
                } else {
                    this.clients[authKey].update(row);
                }
            }

            Logger.info("Clients.LoadClients", "Loading %s clients", [Object.keys(this.clients).length]);

        } catch (err) {
            Logger.error("Clients.LoadClients", err.stack);
        }
    }

    public getClient(authKey: string): Client {
        return this.clients[authKey];
    }

    public getClientByCredentials(params: TCredentialsParams): Client {

        let client = this.clients[params.authKey];
        if (client)
                return client;

        return this.clientsByCredentials[`${params.login}${md5(params.password)}`];
    }

    public async syncClients(): Promise<void> {
        try {
            let collection = this.mongoDb.collection(ClientsCollection);
            let bulk = collection.initializeUnorderedBulkOp();
            for (let i in this.clients) {
                let updated = this.clients[i].getSynhronizableClient();
                bulk.find({ _id: this.clients[i]._id }).updateOne({ '$set': updated });
            }
            await bulk.execute();
        } catch (err) {
            Logger.error("Clients.LoadClients", err.stack);
        }
    }
}