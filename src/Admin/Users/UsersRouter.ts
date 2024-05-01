
import { Router, Request, Response } from "express";
import * as md5 from "md5";
import { ObjectID } from "mongodb";

import { DatabaseMongo } from "../../Core/DatabaseMongo";
import { SessionsService } from "../Sessions/SessionsService";
import { Logger } from "../../Core/Logger";

export function UsersRouter(db: DatabaseMongo): Router {

    let router = Router();
    let collection = "admin.users";

    // Возвращает список пользоваетелей
    router.get("/users", SessionsService.chekAuth, async (req: Request, resp: Response) => {

        try {
            let users = await db.collection(collection).find({}).toArray();
            resp.status(200).json(users);
        } catch (err) {
            Logger.error("Admin.UsersRouter", err.stack);
            return resp.status(500).json({ message: err.message });
        }

    });

    // Возвращает пользователя по id
    router.get("/users/:id", SessionsService.chekAuth, async (req, resp) => {

        try {
            let id = new ObjectID(req.params.id);
            let row = await db.collection(collection).findOne({ "_id": id });
            resp.status(200).json(row);
        } catch (err) {
            Logger.error("Admin.UsersRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }

    });

    // Добавление нового юзера
    router.post("/users", SessionsService.chekAuth, async (req, resp) => {

        try {
            let data = req.body;
            delete data._id;
            data.created_at = new Date();
            data.updated_at = new Date();
            data.password = md5(data.password);
            let result = await db.collection(collection).insert(data);
            resp.status(200).json(result);

        } catch (err) {
            Logger.error("Admin.UsersRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }

    });

    // редактирование пользователя
    router.put("/users/:id", SessionsService.chekAuth, async (req, resp) => {

        try {
            let _id = new ObjectID(req.params.id);
            let data = req.body;
            delete data._id;

            data.updated_at = new Date();

            if (data.password !== undefined && data.password !== '')
                data.password = md5(data.password);

            let result = await db.collection(collection).update({ "_id": _id }, { $set: data });
            resp.status(200).json(result);

        } catch (err) {
            Logger.error("Admin.UsersRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }

    });

    // Удаление пользователя
    router.delete("/users/:id", SessionsService.chekAuth, async (req, resp) => {
        try {
            let _id = new ObjectID(req.params.id);
            let result = await db.collection(collection).remove({ "_id": _id });
            resp.status(200).json(result);
        } catch (err) {
            Logger.error("Admin.UsersRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }
    });

    // проверка существования игрока в бд по логину и паролю
    router.post("/users/auth", async (req, resp) => {

        try {
            let email = req.body.email;
            let password = md5(req.body.password || "");
            let row = await db.collection(collection).findOne({ "email": email, "password": password });

            if (row !== null) {

                let sessid = SessionsService.createSession(row);

                // Обновим дату авторизации
                db.collection(collection).update({ "_id": row._id }, { "$set": { "authed_at": new Date() } });

                return resp.status(200).json({ "sessid": sessid });

            } else {
                return resp.status(401).json({ message: "Unauthorized!" });
            }

        } catch (err) {
            Logger.error("Admin.UsersRouter", err.stack);
            resp.status(500).json({ message: err.message });
        }

    });

    // Возвращает авторизованного пользователя, иначе ошибку 401
    router.post("/users/checkAuth", SessionsService.chekAuth, (req, resp) => {
        let sessid = req.query.sessid;
        let userSess = SessionsService.getSession(sessid);

        resp.status(200).json(userSess);
    });

    // завершить текущую сессию
    router.post("/users/destroyAuth", (req, resp) => {
        let sessid = req.query.sessid;
        SessionsService.destroySession(sessid);
        resp.status(200).json({ message: "OK" });
    });

    return router;
}