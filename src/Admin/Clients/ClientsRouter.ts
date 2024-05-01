import { Router, Request, Response } from "express";
import { Logger } from "../../Core/Logger";
import { DatabaseMongo, ObjectID } from "../../Core/DatabaseMongo";
import * as md5 from "md5";
import { Publisher } from "../../Core/PubSub/Publisher";
import { RpcCommands } from "../../Config/Constants";

export async function fillDataClient(data: any, db: DatabaseMongo): Promise<any> {

    if (!data.authKey) {
        data.authKey = md5(JSON.stringify(data) + "_" + Date.now());
    }

    if (!data.uid) {
        let counter = await db.collection("admin.counters").findOneAndUpdate({ "id": "uid" }, { '$inc': { "value": 1 } }, { upsert: true });
        data.uid = counter.value.value;
    }

    data.updated_at = new Date();

    return data;
}

export function ClientsRouter(db: DatabaseMongo, publisher: Publisher): Router {

    let router = Router();
    let collection = "asset.clients";

    router.post("/clients/sync", async (req: Request, resp: Response) => {
        if (publisher.publish(RpcCommands.SYNC, {})) {
            return resp.status(200).json({ message: "sync ok" });
        }

        return resp.status(400).json({ message: "sync failed" });
    });

    router.post("/clients", async (req: Request, resp: Response) => {
        try {
            let data = req.body;
            delete data._id;

            data = await fillDataClient(data, db);
            data.created_at = new Date();

            let result = await db.collection(collection).insert(data);

            resp.status(200).json(result);
        } catch (err) {
            Logger.error("Admin.BaseRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }
    });

    router.put("/clients/:id", async (req: Request, resp: Response) => {
        try {
            let _id = new ObjectID(req.params.id);
            let data = req.body;
            delete data._id;

            data = await fillDataClient(data, db);

            let result = await db.collection(collection).update({ "_id": _id }, { $set: data });

            resp.status(200).json(result);

        } catch (err) {
            Logger.error("Admin.BaseRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }
    });


    return router;

}