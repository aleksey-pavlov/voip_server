import { Router, Request, Response } from "express";
import { IRpcSender } from "../../Core/Rpc/RpcSender";
import { RpcCommands } from "../../Config/Constants";

export function GatewaysRunningRouter(rpcSenderFactory: (queueName: string) => IRpcSender): Router {

    let router: Router = Router();

    router.put("/gateways-running/:id", async (req: Request, resp: Response) => {
        let gateway = req.body;
        let id = req.params.id;
        let sender = rpcSenderFactory(id);
        let reply = await sender.sendAndGetReply(
            RpcCommands.GATEWAY_UPDATE,
            { gateway: gateway, gatewayId: id }
        );
        resp.status(200).json(reply);
    });

    router.get("/gateways-running/evacuation/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let sender = rpcSenderFactory(id);
        let reply = await sender.sendAndGetReply(
            RpcCommands.GATEWAY_EVACUATION,
            { gatewayId: id }
        );
        resp.status(200).json(reply);
    });

    router.get("/gateways-running/outbox-stat/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let sender = rpcSenderFactory(id);
        let reply = await sender.sendAndGetReply(
            RpcCommands.GATEWAY_STAT_OUTBOX,
            { gatewayId: id }
        );
        resp.status(200).json(reply);
    });

    return router;
}