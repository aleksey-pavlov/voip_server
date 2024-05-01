import { Router, Request, Response } from "express";
import { ClientsMiddleware } from "../Clients/ClientsMiddleware";
import { IClientService } from "../Clients/ClientsService";
import { ITrunkSource } from "../../Trunk/TrunkSource";
import { Http } from "../../Core/HttpHelper";
import { getRandomInt } from "../../Core/Utils";

export function TrunksRouter(clientService: IClientService, trunkSource: ITrunkSource): Router {

    let router = Router();

    router.get("/trunks/:id/:field", ClientsMiddleware.checkAuth(clientService),
        async (req: Request, resp: Response) => {

            let id = req.params.id;
            let field = req.params.field;

            let trunk = await trunkSource.get(id);

            if (trunk[field]) {
                return resp.json(trunk[field]);
            }

            return resp.status(Http.StatusCode.NOT_FOUND).send();

        });

    router.get("/trunks/:id/callers/random", ClientsMiddleware.checkAuth(clientService),
        async (req: Request, resp: Response) => {

            let id = req.params.id;

            let trunk = await trunkSource.get(id);

            if (!trunk) {
                return resp.status(Http.StatusCode.NOT_FOUND).send();
            }

            let callerIndex = getRandomInt(0, trunk.callers.length);

            let caller = `${trunk.callerPrefix}${trunk.callers[callerIndex]}`;
            
            return resp.send(caller);
        });


    return router;
}