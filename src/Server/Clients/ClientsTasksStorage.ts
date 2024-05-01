import md5 = require("md5");
import { getCurrentTimeSec } from "../../Core/Utils";
import { IObjectRepository, ObjectID } from "../../Core/DatabaseMongo";
import { TClientTask, TClientTaskCreate } from "./ClientsTasks";


export class ClientTaskPersistence {

    from: string;
    to: string;
    expiredAt: number;
    _id: ObjectID;
    ckey: string;
    clientId: number;
    key: string;

    public static fromClientTaskDTO(source: TClientTaskCreate): ClientTaskPersistence {

        let task = new ClientTaskPersistence();

        task.from = source.from.slice(-10);
        task.to = source.to.slice(-10);
        task.key = md5(`${task.from}_${task.to}`);

        task.expiredAt = getCurrentTimeSec() + Number(source.expired);
        task._id = new ObjectID();
        task.ckey = source.ckey;
        task.clientId = source.clientId;

        return task;
    }

    public static toClientTaskDTO(source: ClientTaskPersistence): TClientTask {
        return {
            ckey: source.ckey,
            id: source._id.toString(),
            clientId: source.clientId,
            from: source.from,
            to: source.to
        };
    }
}

export interface IClientsTasksStorage {

    create(task: ClientTaskPersistence): Promise<{ id: string }>;
    find(key: string): Promise<ClientTaskPersistence>;
    remove(id: string): Promise<boolean>;
    clearExpired(): Promise<void>;
}

export class ClientsTasksStorage implements IClientsTasksStorage {

    public constructor(
        private repository: IObjectRepository,
        private expiredCall: (task: ClientTaskPersistence) => void = null
    ) { }

    async create(task: ClientTaskPersistence): Promise<{ id: string }> {

        let result = await this.repository.create(task);

        return { id: result._id.toString() };
    }

    async find(key: string): Promise<ClientTaskPersistence> {

        return await this.repository.findOne<ClientTaskPersistence>({ key: key });
    }

    async remove(id: string): Promise<boolean> {

        return await this.repository.removeOne({ _id: new ObjectID(id) });
    }


    public async clearExpired(): Promise<void> {

        let tasks = await this.repository.find<ClientTaskPersistence>({ expiredAt: { '$lte': getCurrentTimeSec() } });

        if (!this.expiredCall) {
            return;
        }

        for (let i in tasks) {
            await this.repository.removeOne({ _id: tasks[i]._id });
            this.expiredCall(tasks[i]);
        }
    }
}
