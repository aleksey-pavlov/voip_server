import { Router, Request, Response } from "express";
import { Http } from "../../Core/HttpHelper";
import { RpcSender } from "../../Core/Rpc/RpcSender";
import { Publisher } from "../../Core/PubSub/Publisher";
import { StatusQuery } from "../../Stat/StatusQuery";
import { Logger } from "../../Core/Logger";
import { TMessage } from "../../Types/MessageModel";
import { IClientService } from "./ClientsService";
import { Client } from "./ClientsModel";
import { RoutingKeys, RpcCommands } from "../../Config/Constants";
import { ObjectID } from "bson";
import { ExpressMiddleware } from "../../Core/Express/ExpressMiddleware";
import { ClientsMiddleware } from "./ClientsMiddleware";

export function ClientsSmsRouter(clientService: IClientService, publisher: Publisher, rpcStatus: RpcSender): Router {

    let router = Router();

    router.post("/push",
        ExpressMiddleware.checkArrayBody(),
        ClientsMiddleware.checkAuth(clientService),
        ClientsMiddleware.checkSmsLimits(clientService),
        (req: Request, resp: Response) => {

            // send task to queue
            try {
                let authKey: string = req.query.ckey;
                let client: Client = clientService.getClient(authKey);
                let currentTime: number = Math.floor(Date.now() / 1000);

                // create and validation task
                let body: any = req.body;

                for (let i in body) {

                    let value: any = body[i];
                    let text: string = value.text || "";
                    let recipient: string = value.recipient.toString() || "";

                    let message: TMessage = {
                        systemId: new ObjectID().toString(),
                        messageId: value.message_id || 0,
                        clientId: client.uid,
                        text: String(text),
                        textOrigin: String(text),
                        recipient: recipient,
                        status: "ACCEPTED",
                        acceptedAt: currentTime,
                        sentAt: 0,
                        changeAt: 0,
                        error: "",
                        deviceUserId: 0,
                        deviceRefId: 0,
                        gatewayIdSent: "",
                        gatewayNameSent: "",
                        parts: 0,
                        provider: "",
                        providerId: "",
                        def: 0,
                        region: "",
                        isResend: false,
                        isRedirected: false,
                        priority: value.priority
                    };

                    publisher.publish(RoutingKeys.SEND_SMS, message);
                    client.logSendMessage();
                }

            } catch (err) {
                Logger.error("Server.ClientsSms.push", err.stack);
                return resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send();
            }

            resp.status(200).json({ status: 0 });
        });

    router.post("/status", ExpressMiddleware.checkArrayBody(), ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) => {

        try {

            let authKey: string = req.query.ckey;
            let client: Client = clientService.getClient(authKey);
            let body: any = req.body;

            let messageIds: any[] = [];
            for (let i in body) {
                messageIds.push(body[i]);
            }

            let query: StatusQuery = {
                uid: client.uid,
                messageIds: messageIds
            };

            let reply: any = await rpcStatus.sendAndGetReply(RpcCommands.GETMSG_STATUS, query);
            resp.json(reply);

        } catch (err) {
            Logger.error("Server.ClientsSms.status", err.stack);
        }
    });

    return router;
}