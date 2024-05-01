import { Config } from "./Config/Config";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Logger } from "./Core/Logger";
import { FluentClientFactory } from "fluentd-client";
import { GatewayCacheMessages } from "./Gateway/GatewayCacheMessages";
import { DatabaseRedis } from "./Core/DatabaseRedis";
import { MessagesStatus } from "./Services/MessagesStatus";
import { Publisher } from "./Core/PubSub/Publisher";
import { MqConnect } from "./Core/DatabaseRabbit";
import { Exchanges } from "./Config/Constants";

type SmsResultEvent = {
    sn: string;
    sms_result: Smsresult[];
};

type Smsresult = {
    port: number;
    user_id: number;
    number: string;
    time: string;
    status: "SENDING" | "SENT_OK" | "DELIVERED" | "FAILED";
    count: number;
    succ_count: number;
    ref_id: number;
};

(async () => {

    let fluentFactory = new FluentClientFactory();
    let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
    Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
    Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

    let messagesCache = new GatewayCacheMessages(new DatabaseRedis(Config.REDIS));
    let mqConnect = await MqConnect(Config.RABBITMQ);
    let messagesStatus = new MessagesStatus(
        new Publisher(Exchanges.SMS_EXCHANGE, Exchanges.SMS_EXCHANGE_TYPE, true, await mqConnect.createChannel())
    );

    let app = express();
    app.use(bodyParser.json({ limit: "32mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post("/:gateway_id", async (req: express.Request, resp: express.Response) => {

        try {
            let body: SmsResultEvent = req.body;
            let gatewayId = req.params.gateway_id;

            if (body.sms_result) {
                let rows = body.sms_result;
                for (let i in rows) {
                    let cachedMessage = await messagesCache.get(gatewayId, rows[i].user_id);
                    if (cachedMessage && cachedMessage.status != rows[i].status) {
                        cachedMessage.status = rows[i].status;
                        cachedMessage.changeAt = Math.floor(Date.now() / 1000);
                        messagesStatus.change(cachedMessage);

                        Logger.info("GatewayEventListener.Message", JSON.stringify(cachedMessage, null, 2));
                    }
                }
            }
        } catch (err) {
            Logger.error("GatewayEventListener", err.stack);
        }

        resp.sendStatus(200);
    });

    app.listen(Config.GATEWAY_EVENT_LISTENER, () => {
        Logger.info("GatewayEventListener", "Starting on port %s", [Config.GATEWAY_EVENT_LISTENER]);
    });
})();