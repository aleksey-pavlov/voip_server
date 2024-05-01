import { Router, Request, Response } from "express";
import { DatabaseMongo, ObjectID } from "../Core/DatabaseMongo";
import { Logger } from "../Core/Logger";

export function BaseRouter(asset: string, db: DatabaseMongo): Router {

    let router = Router();

    router.get("/" + asset, async (req: Request, resp: Response) => {
        try {
            let rows:any[] = await db.collection("asset." + asset).find({}).toArray();
            resp.status(200).json(rows);
        } catch (err) {
            Logger.error("Admin.BaseRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }
    });

    router.get("/" + asset + "/:id", async (req: Request, resp: Response) => {
        try {
            let id = new ObjectID(req.params.id);
            let row = await db.collection("asset." + asset).findOne({ _id: id });

            resp.status(200).json(row);
        } catch (err) {
            Logger.error("Admin.BaseRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }
    });

    router.post("/" + asset, async (req: Request, resp: Response) => {
        try {
            let data = req.body;
            delete data._id;

            data.created_at = new Date();
            data.updated_at = new Date();

            let result = await db.collection("asset." + asset).insert(data);

            resp.status(200).json(result);
        } catch (err) {
            Logger.error("Admin.BaseRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }
    });

    router.put("/" + asset + "/:id", async (req: Request, resp: Response) => {
        try {
            let _id = new ObjectID(req.params.id);
            let data = req.body;
            delete data._id;

            data.updated_at = new Date();


            let result = await db.collection("asset." + asset).update({ "_id": _id }, { $set: data });

            resp.status(200).json(result);

        } catch (err) {
            Logger.error("Admin.BaseRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }
    });

    router.delete("/" + asset + "/:id", async (req: Request, resp: Response) => {
        try {
            let _id = new ObjectID(req.params.id);
            let result = await db.collection("asset." + asset).remove({ "_id": _id });
            resp.status(200).json(result);
        } catch (err) {
            Logger.error("Admin.BaseRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }
    });


    return router;
}