import { Request, Response } from "express";
import * as md5 from "md5";

export class SessionsService {

    private static Sessions: { [x: string]: Object } = {};

    private static _accessMap = {
        "GET:/users": "admin",
        "POST:/users": "admin",
        "PUT:/users/:id": "admin",
        "DELETE:/users/:id": "admin"
    }

    private static _getRouteMethod(methods) {
        if (methods.get !== undefined && methods.get === true)
            return "GET"
        else if (methods.post !== undefined && methods.post === true)
            return "POST";
        else if (methods.put !== undefined && methods.put === true)
            return "PUT";
        else if (methods.delete !== undefined && methods.delete === true)
            return "DELETE";

        return "";
    }

    public static chekAuth(req: Request, resp: Response, next: any): any {

        let sessid = req.query.sessid;
        let user = SessionsService.Sessions[sessid] || undefined;

        if (user === undefined)
            return resp.status(401).json({ message: "Unauthorized!" });

        let accessKey = SessionsService._getRouteMethod(req.route.methods) + ":" + req.route.path;

        if (SessionsService._accessMap[accessKey] !== undefined) {
            let accessGroup = SessionsService._accessMap[accessKey];

            let groups = user['groups'];

            if (groups[accessGroup] === undefined)
                return resp.status(403).json({ message: "Access denied!" });
        }

        next();
    }

    public static createSession(data: Object) {
        let sessid = md5(Date.now() + "_" + data);
        this.Sessions[sessid] = data;

        return sessid;
    }

    public static destroySession(sessid: string) {
        delete this.Sessions[sessid];
    }

    public static getSession(sessid: string) {
        return this.Sessions[sessid] || null;
    }
}