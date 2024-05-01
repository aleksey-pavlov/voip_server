import { Router, Request, Response } from "express";
import { IRpcSender } from "../../Core/Rpc/RpcSender";
import { RpcCommands } from "../../Config/Constants";

export function GatewaysProviderRouter(rpcSender: IRpcSender): Router {

    let router: Router = Router();

    router.get("/gateways-provider/map", async (req: Request, resp: Response) => {
        let reply = await rpcSender.sendAndGetReply(
            RpcCommands.GATEWAYS_PROVIDER_MAP, {}
        );
        resp.status(200).json(reply);
    });

    return router;
}