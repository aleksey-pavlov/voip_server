import { Router, Request, Response } from "express";
import { IClientService } from "../Clients/ClientsService";

export type TSignInParams = {
    login: string;
    password: string;
}

export function AuthRouter(clientService: IClientService): Router {

    let router = Router();

    router.post("/signin", (req: Request, resp: Response) => {

        let params: TSignInParams = req.body;
        let authKey = req.query.ckey;

        let client = clientService.getClientByCredentials({
            login: params.login,
            password: params.password,
            authKey: authKey
        });

        resp.json(client).send();
    });

    router.post("/signout", (req: Request, resp: Response) => {

    });

    router.post("/signup", (req: Request, resp: Response) => {

    });

    return router;
}