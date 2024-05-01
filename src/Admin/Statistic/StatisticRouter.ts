import { Router, Request, Response } from "express";
import { RpcSender } from "../../Core/Rpc/RpcSender";
import { RpcCommands } from "../../Config/Constants";

export function StatisticRouter(rpcSender: RpcSender): Router {

    let router = Router();

    router.get("/statistic/upload", async (req: Request, resp: Response) => {

        let from = req.query.from;
        let to = req.query.to;
        let email = req.query.email;
        let reply = await rpcSender.sendAndGetReply(
            RpcCommands.STATISTIC_SMS_UPLOAD,
            {
                params: {
                    from: from,
                    to: to,
                    email: email
                }
            });

        resp.status(200).json(reply);
    });

    return router;
}