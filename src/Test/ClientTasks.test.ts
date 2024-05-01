import { assert, expect } from "chai";
import { ClientTaskNotFound } from "../Server/Clients/ClientsErrors";
import { ClientsTasks } from "../Server/Clients/ClientsTasks";
import { ClientsTasksStorage } from "../Server/Clients/ClientsTasksStorage";
import { ObjectRepositoryMock } from "./Core/DatabaseMongoMock";
import { HttpClientMock } from "./Core/HttpClientMock";
import { ClientsTasksResolver } from "../Server/Clients/ClientsTasksResolver";
import { IClientService, TCredentialsParams } from "../Server/Clients/ClientsService";
import { Client } from "../Server/Clients/ClientsModel";


export class ClientServiceMock implements IClientService {
    loadClients(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getClient(authKey: string): Client {
        return new Client( {

        } );
    }
    syncClients(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getClientByCredentials(params: TCredentialsParams): Client {
        throw new Error("Method not implemented.");
    }
}
 
describe("clients tasks", () => {
    
    it("create and resolve task", async () => {

        let tasks = new ClientsTasks(new ClientsTasksStorage(new ObjectRepositoryMock()), new ClientsTasksResolver(new ClientServiceMock(), new HttpClientMock()));

        let task = await tasks.create({ from: "+7XXXXXXXXXX", to: "+7XXXXXXXXXX", expired: 10, ckey: '3', clientId: 1 });

        let expectId = task.id;

        let resolvedTask = await tasks.resolve({ from: "+7XXXXXXXXXX", to: "7XXXXXXXXXX" });

        let actualId = resolvedTask.id;

        expect(expectId).equal(actualId);
    });


    it("create and resolve expired task", async() => {

        let storage = new ClientsTasksStorage(new ObjectRepositoryMock());

        let tasks = new ClientsTasks(storage, new ClientsTasksResolver(new ClientServiceMock(), new HttpClientMock()));

        await tasks.create({ from: "+7XXXXXXXXXX", to: "+7XXXXXXXXXX", expired: 0, ckey: '3', clientId: 1 });

        await storage.clearExpired();

        try {
            await tasks.resolve({ from: "1", to: "2" })
        } catch (error) {
            assert.instanceOf(error, ClientTaskNotFound);
        }

    });
});