import { Router, Request, Response } from "express";
import { IRpcSender } from "../../Core/Rpc/RpcSender";
import { RpcCommands, Queues } from "../../Config/Constants";

export function TrunksRunningRouter(rpcSenderFactory: (queueName: string) => IRpcSender): Router {

    let router: Router = Router();

    router.put("/trunks-running/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let trunk = req.body;
        let sender = rpcSenderFactory(Queues.RPC_TRUNK_COMMANDS(id));
        let reply = await sender.sendAndGetReply(
            RpcCommands.TRUNK_UPDATE,
            trunk
        );
        resp.status(200).json(reply);
    });


    router.get("/trunks-running/evacuation/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let sender = rpcSenderFactory(Queues.RPC_TRUNK_COMMANDS(id));
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_EVACUATION, {});
        resp.status(200).json(reply);
    });

    router.get("/trunks-running/active-voices/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let sender = rpcSenderFactory(Queues.RPC_TRUNK_COMMANDS(id));
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_GET_ACTIVE_VOICES, {});
        resp.status(200).json(reply);
    });

    router.delete("/trunks-running/active-voices/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let sender = rpcSenderFactory(Queues.RPC_TRUNK_COMMANDS(id));
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_CLEAN_ACTIVE_VOICES, {});
        resp.status(200).json(reply);
    });

    router.get("/trunks-running/queue-voices/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let sender = rpcSenderFactory(Queues.RPC_TRUNK_COMMANDS(id));
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_GET_QUEUE, {});
        resp.status(200).json(reply);
    });

    router.delete("/trunks-running/queue-voices/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let sender = rpcSenderFactory(Queues.RPC_TRUNK_COMMANDS(id));
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_CLEAN_QUEUE, {});
        resp.status(200).json(reply);
    });

    router.get("/trunks-running/unregister/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let sender = rpcSenderFactory(Queues.RPC_TRUNK_COMMANDS(id));
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_UNREGISTER_PROVIDER, {});
        resp.status(200).json(reply);
    });

    router.get("/trunks-running/register/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let sender = rpcSenderFactory(Queues.RPC_TRUNK_COMMANDS(id));
        let reply = await sender.sendAndGetReply(RpcCommands.TRUNK_REGISTER_PROVIDER, {});
        resp.status(200).json(reply);
    });

    return router;
}