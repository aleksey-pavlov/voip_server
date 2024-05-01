import { Router, Request, Response } from "express";
import { IRpcSender } from "../../Core/Rpc/RpcSender";
import { RpcCommands } from "../../Config/Constants";

export function TrunksProviderRouter(sender: IRpcSender): Router {

    let router: Router = Router();

    router.get("/trunks-provider/balancer/map", async (req: Request, resp: Response) => {
        let reply = await sender.sendAndGetReply(
            RpcCommands.TRUNK_PROVIDER_MAP, {}
        );
        resp.status(200).json(reply);
    });

    return router;
}