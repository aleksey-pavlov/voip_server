import { ClientTaskPersistence, IClientsTasksStorage } from "./ClientsTasksStorage";
import { IClientsTasksResolver } from "./ClientsTasksResolver";
import { ArgumentNullError } from "../../Core/Errors/ArgumentError";
import { ClientTaskAlreadyExists, ClientTaskNotFound } from "./ClientsErrors";

export type TClientTaskCreate = {
    from: string;
    to: string;
    expired: number;
    ckey: string;
    clientId: number;
}

export type TClientTask = {
    id: string;
    ckey: string;
    clientId: number;
    from: string;
    to: string;
}

export type TClientTaskCreateResponse = {
    id: string;
}

export type TClientTaskResolve = {
    from: string;
    to: string;
}

export interface IClientsTasks {

    create(params: TClientTaskCreate): Promise<TClientTaskCreateResponse>;
    resolve(params: TClientTaskResolve): Promise<TClientTask>;
}


export class ClientsTasks implements IClientsTasks {

    constructor(private storage: IClientsTasksStorage, private resolver: IClientsTasksResolver) { }

    async create(params: TClientTaskCreate): Promise<TClientTaskCreateResponse> {

        if (params.expired === null || !params.from || !params.to)
            throw new ArgumentNullError(JSON.stringify(params));

        let task = ClientTaskPersistence.fromClientTaskDTO(params);

        let existTask = await this.storage.find(task.key)

        if (existTask)
            throw new ClientTaskAlreadyExists(params.from, params.to);

        await this.storage.create(task);

        return { id: task._id.toString() };

    }

    async resolve(params: TClientTaskResolve): Promise<TClientTask> {

        if (!params.from || !params.to)
            throw new ArgumentNullError(JSON.stringify(params));

        let task = ClientTaskPersistence.fromClientTaskDTO({
            from: params.from,
            to: params.to,
            expired: 0,
            ckey: "",
            clientId: 0
        });

        let existTask = await this.storage.find(task.key);

        if (!existTask) {
            throw new ClientTaskNotFound(params.from, params.to);
        }

        let taskDTO = ClientTaskPersistence.toClientTaskDTO(existTask);

        if (await this.resolver.resolve(taskDTO.id, taskDTO.ckey)) {
            await this.storage.remove(taskDTO.id);
        }

        return taskDTO;
    }

}