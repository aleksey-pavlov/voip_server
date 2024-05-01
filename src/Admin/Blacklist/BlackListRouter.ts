import { RpcSender } from "../../Core/Rpc/RpcSender";
import { Router, Request, Response } from "express";
import { RpcCommands } from "../../Config/Constants";

export function BlackListRouter(rpcSender: RpcSender): Router {
    let router = Router();
    router.post("/blacklist/sync", async (req: Request, resp: Response) => {

        let reply = await rpcSender.sendAndGetReply(RpcCommands.SYNC_BLACKLIST, {});
        resp.status(200).json(reply);
    });

    return router;
}