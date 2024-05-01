import { Router, Request, Response } from "express";
import { IRpcSender } from "../Core/Rpc/RpcSender";
import { RpcCommands } from "../Config/Constants";

export function AgentRouter(rpcSenderFactory: (queueName: string) => IRpcSender): Router {

    let router = Router();

    router.get("/agent/run/:location/:id", async (req: Request, resp: Response) => {
        let id = req.params.id;
        let location = req.params.location;

        let sender = rpcSenderFactory(location);
        let reply = await sender.sendAndGetReply(RpcCommands.GATEWAY_UP, { gatewayId: id });
        resp.status(200).json(reply);
    });

    router.get("/agent/stop/:location/:id", async (req: Request, resp: Response) => {
        let id = req.params.id;
        let location = req.params.location;

        let sender = rpcSenderFactory(location);
        let reply = await sender.sendAndGetReply(RpcCommands.GATEWAY_DOWN, { gatewayId: id });
        resp.status(200).json(reply);
    });

    router.get("/agent/info/:location/:id", async (req: Request, resp: Response) => {
        let id = req.params.id;
        let location = req.params.location;

        let sender = rpcSenderFactory(location);
        let reply = await sender.sendAndGetReply(RpcCommands.PROCESS_INFO, { gatewayId: id });
        resp.status(200).json(reply);
    });

    router.get("/agent/trunk/run/:location/:id", async (req: Request, resp: Response) => {
        let id = req.params.id;
        let location = req.params.location;
        let debug = req.query.debug;

        let sender = rpcSenderFactory(location);
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_UP, { trunkId: id, debugMode: debug });
        resp.status(200).json(reply);
    });

    router.get("/agent/trunk/stop/:location/:id", async (req: Request, resp: Response) => {
        let id = req.params.id;
        let location = req.params.location;

        let sender = rpcSenderFactory(location);
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_DOWN, { trunkId: id }, 120);
        resp.status(200).json(reply);
    });

    router.get("/agent/trunk/info/:location/:id", async (req: Request, resp: Response) => {
        let id = req.params.id;
        let location = req.params.location;

        let sender = rpcSenderFactory(location);
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_PROCESS_INFO, { trunkId: id });
        resp.status(200).json(reply);
    });

    return router;
}