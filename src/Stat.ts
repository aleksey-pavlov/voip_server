import { Config } from "./Config/Config";
import { MqConnect } from "./Core/DatabaseRabbit";
import { DatabaseMysql, DiStatTables } from "./Core/DatabaseMysql";
import { RpcReciver } from "./Core/Rpc/RpcReciver";
import { Subscriber } from "./Core/PubSub/Subscriber";
import { StatusQuery } from "./Stat/StatusQuery";
import { StatusResponse, VoiceStatusResponse } from "./Stat/StatusResponse";
import { Logger } from "./Core/Logger";
import * as mailer from "nodemailer";
import { FluentClientFactory } from "fluentd-client";
import { TMessage } from "./Types/MessageModel";
import { TVoiceMessage } from "./Types/VoiceModel";
import { MongoClient, ObjectID } from "mongodb";
import { ClientsCallbacks } from "./Stat/ClientsCallbacks";
import { Exchanges, RoutingKeys, Queues, RpcCommands } from "./Config/Constants";

let fluentFactory = new FluentClientFactory();
let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

// Update status or insert DB messages
(async () => {
    try {
        let mqConnect = await MqConnect(Config.RABBITMQ);
        let mqChannel = await mqConnect.createChannel();

        let subscriber = new Subscriber(Exchanges.SMS_EXCHANGE, Exchanges.SMS_EXCHANGE_TYPE, true, mqChannel);
        let routingKeys = [RoutingKeys.SEND_SMS, RoutingKeys.CHANGE_SMS_STATUS]
        subscriber.subscribe(Queues.STAT_MESSAGES, routingKeys, (message: TMessage) => {
            try {
                fluentClient.send("messages", message);
            } catch (err) {
                Logger.error("Stat.MainSmsStatusUpd.consume", err.stack);
            }

            return true;
        });

    } catch (err) {
        Logger.error("Stat.MainSmsStatusUpd", err.stack);
        process.exit();
    }
})();

// Update status or insert DB voices
(async () => {
    try {
        let mqConnect = await MqConnect(Config.RABBITMQ);
        let mongoDb = await MongoClient.connect(Config.MONGO, { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 });

        let clientCallbacks = new ClientsCallbacks(mongoDb);
        await clientCallbacks.initialize();

        let commandsSubscriber = new Subscriber(Exchanges.CMD_EXCHANGE, Exchanges.CMD_EXCHANGE_TYPE, false, await mqConnect.createChannel());
        commandsSubscriber.subscribeAsync(new ObjectID().toString(), [RpcCommands.SYNC], async () => {
            await clientCallbacks.initialize();
            return true;
        });

        let subscriber = new Subscriber(Exchanges.VOICE_EXCHANGE, Exchanges.VOICE_EXCHANGE_TYPE, true, await mqConnect.createChannel());
        let routingKeys = [RoutingKeys.SEND_VOICE, RoutingKeys.CHANGE_VOICE_STATUS]
        subscriber.subscribe(Queues.STAT_VOICES, routingKeys, (voice: TVoiceMessage) => {
            try {
                fluentClient.send("voices", voice);
                clientCallbacks.send(voice);
            } catch (err) {
                Logger.error("Stat.MainVoicesStatusUpd.subscribe", err.stack);
            }

            return true;
        });

    } catch (err) {
        Logger.error("Stat.MainVoicesStatusUpd", err.stack);
        process.exit();
    }
})();

// RPC query - get status messages
(async () => {
    try {
        let mqConnect = await MqConnect(Config.RABBITMQ);
        let mqChannel = await mqConnect.createChannel();
        let mysqlDb = new DatabaseMysql(Config.MYSQL);
        let reciver = new RpcReciver(Queues.RPC_STATUS_MESSAGES, mqChannel);
        reciver.subscribe(RpcCommands.GETMSG_STATUS, async msg => {
            try {

                let data: StatusQuery = {
                    messageIds: msg["messageIds"],
                    uid: msg["uid"]
                };

                let out: Array<StatusResponse> = [];

                if (data.messageIds.length > 0) {

                    let rows = await mysqlDb.query("SELECT messageId, status, error FROM ?? WHERE clientId=? AND messageId IN(?)",
                        [DiStatTables.Messages, data.uid, data.messageIds]);

                    for (let i in rows) {
                        out.push({
                            message_id: rows[i].messageId,
                            status: rows[i].status,
                            error: rows[i].error || ""
                        });
                    }
                }

                return out;

            } catch (err) {
                Logger.error("Stat.MainSmsStatusQuery", err.stack);
            }
        });
        reciver.listen();
    } catch (err) {
        Logger.error("Stat.MainSmsStatusQuery", err.stack);
    }
})();

// RPC query - get status voices
(async () => {
    try {
        let mqConnect = await MqConnect(Config.RABBITMQ);
        let mqChannel = await mqConnect.createChannel();
        let mysqlDb = new DatabaseMysql(Config.MYSQL);
        let reciver = new RpcReciver(Queues.RPC_STATUS_VOICE, mqChannel);
        reciver.subscribe(RpcCommands.GETVOICE_STATUS, async msg => {
            try {

                let data: StatusQuery = {
                    messageIds: msg["messageIds"],
                    uid: msg["uid"]
                };

                let out: Array<VoiceStatusResponse> = [];

                if (data.messageIds.length > 0) {

                    let rows: Array<TVoiceMessage> = await mysqlDb.query("SELECT messageId, status, error, duration, actualDuration, cdrDestination, dialuptime, synthesCharsCount FROM ?? WHERE clientId=? AND messageId IN(?)",
                        [DiStatTables.Voices, data.uid, data.messageIds]);

                    for (let i in rows) {
                        out.push({
                            message_id: rows[i].messageId,
                            status: rows[i].status,
                            error: rows[i].error || "",
                            duration: rows[i].duration,
                            actual_duration: rows[i].actualDuration,
                            ivr_answer: rows[i].cdrDestination,
                            dialuptime: rows[i].dialuptime,
                            synthes_chars_count: rows[i].synthesCharsCount || 0
                        });
                    }
                }

                return out;

            } catch (err) {
                Logger.error("Stat.MainVoiceStatusQuery", err.stack);
            }
        });
        reciver.listen();
    } catch (err) {
        Logger.error("Stat.MainVoiceStatusQuery", err.stack);
    }
})();

// RPC query - commands
(async () => {

    let mqConnect = await MqConnect(Config.RABBITMQ);

    let mysqlDb = new DatabaseMysql(Config.MYSQL);

    let transporter = mailer.createTransport({
        service: 'gmail',
        auth: {
            user: Config.GMAIL_USER,
            pass: Config.GMAIL_PASS
        }
    });

    let reciver = new RpcReciver(Queues.RPC_STAT_COMMANDS, await mqConnect.createChannel());
    reciver.subscribe(RpcCommands.STATISTIC_SMS_UPLOAD, async msg => {
        try {
            let params = msg["params"];
            let from = params["from"];
            let to = params["to"];
            let email = params["email"];

            let rows = await mysqlDb.query("SELECT * FROM ?? WHERE acceptedAt BETWEEN ? AND ? LIMIT 200000",
                [DiStatTables.Messages, from, to]);

            let csvData: string[] = [];
            csvData.push(["clientId",
                "messageId",
                "status",
                "parts",
                "gateway",
                "port",
                "isResend",
                "resendPort",
                "text",
                "recipient",
                "acceptedAt"].join(";"));

            for (let i in rows) {

                let clientId = rows[i].clientId;
                let messageId = rows[i].messageId;
                let status = rows[i].status;
                let parts = rows[i].parts;
                let gateway = rows[i].gatewayIdSent;
                let port = rows[i].portGatewaySent;
                let isResend = rows[i].isResend;
                let resendPort = rows[i].portGatewayResend;
                let text = rows[i].text;
                let recipient = rows[i].recipient;
                let acceptedAt = new Date(rows[i].acceptedAt * 1000).toISOString();

                csvData.push([clientId,
                    messageId,
                    status,
                    parts,
                    gateway,
                    port,
                    isResend,
                    resendPort,
                    text,
                    recipient,
                    acceptedAt].join(";"));
            }

            let fromDateStr = new Date(from * 1000).toDateString();
            let toDateStr = new Date(to * 1000).toDateString();
            let mailOptions = {
                to: email,
                subject: 'Msg statistic ' + fromDateStr + ' - ' + toDateStr,
                attachments: [
                    {
                        filename: 'data.csv',
                        content: new Buffer(csvData.join("\n"), 'utf-8')
                    }]
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    Logger.error("Stat.Commands", error.stack);
                }

                Logger.info("Stat.Commands", 'Message %s sent: %s', [info.messageId, info.response]);
            });

            return { message: "Send to email" };

        } catch (err) {
            Logger.error("Stat.Commands", err.stack);
        }
    });

    reciver.subscribe(RpcCommands.STATISTIC_VOICES_INQUEUE, async data => {

        try {
            let clientId = data["clientId"];

            if (!clientId)
                throw new Error("Undefined clientId");

            let query = await mysqlDb.query(
                "SELECT COUNT(*) as count FROM ?? WHERE clientId=? AND `acceptedAt` >= UNIX_TIMESTAMP(DATE_ADD(NOW(), INTERVAL -60 MINUTE)) AND status=?", ["voices", clientId, "INQUEUE"]
            );

            return query[0].count;
        } catch (err) {
            Logger.error("Stat.Commands", err.stack);
            return 0;
        }
    });

    reciver.listen();
})();