import { Router, Request, Response } from "express";
import { Logger } from "../../Core/Logger";
import { IClientService } from "./ClientsService";
import { ClientsMiddleware } from "./ClientsMiddleware";
import { IClientsTasks } from "./ClientsTasks";

export function ClientsTasksRouter(
    clientService: IClientService,
    tasks: IClientsTasks): Router {

    let router = Router();

    router.post("/voice/task", ClientsMiddleware.checkAuth(clientService),
        async (req: Request, resp: Response) => {

            try {

                let from = req.body.from;
                let to = req.body.to;
                let expired = req.body.expired;
                let ckey = req.query.ckey;

                let client = clientService.getClient(ckey);

                let result = await tasks.create({ from: from, to: to, expired: expired, ckey: ckey, clientId: client.uid });

                resp.json(result);

                Logger.info("ClientsTasksRouter.create",
                    `Created task TaskId=${result.id} From=${from} To=${to} Expired=${expired} ClientId=${client.uid}`);

            } catch (err) {
                Logger.error("Server.ClientsTasks.create", err.stack);
                resp.send({ error: err.message });
            }

        });

    router.post("/voice/task/resolve/:from/:to",
        async (req: Request, resp: Response) => {

            try {
                let from = req.params.from;
                let to = req.params.to;

                let task = await tasks.resolve({ from: from, to: to });

                resp.json({ id: task.id });

                Logger.info("ClientsTasksRouter.resolve", `Resolved task TaskId=${task.id} From=${from} To=${to} ClientId=${task.clientId}`);

            } catch (err) {
                Logger.error("Server.ClientsTasks.resolve", err.stack);
                resp.json({ error: err.message });
            }
        });

    router.post("/voice/task/resolve/test", (req: Request, resp: Response) => {
        Logger.debug("ClientsTaskTest.resolve", "Task TaskId=%s has been resolved!", [req.body.id]);
        return resp.send();
    });



    return router;
}