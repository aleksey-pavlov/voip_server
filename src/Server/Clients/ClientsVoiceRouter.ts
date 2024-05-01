import { Router, Request, Response } from "express";
import { IRpcSender } from "../../Core/Rpc/RpcSender";
import { IPublisher } from "../../Core/PubSub/Publisher";
import { TVoiceMessage, EVoiceStatus, EVoiceMessageTypes } from "../../Types/VoiceModel";
import { Logger } from "../../Core/Logger";
import { Http } from "../../Core/HttpHelper";
import { StatusQuery } from "../../Stat/StatusQuery";
import { IClientService } from "./ClientsService";
import { ClientVoiceFiles } from "./ClientVoiceFiles";
import { Client } from "./ClientsModel";
import { IYandexSpeechKit } from "../../Core/YandexCloudApi/YandexSpeechKit";
import { RoutingKeys, RpcCommands, Ivr } from "../../Config/Constants";
import { IVoiceChannelState } from "./VoiceChannelState";
import { TranscoderRawToMp3 } from "../../Core/TrasncoderFactory";
import { ObjectID } from "bson";
import { ClientsMiddleware } from "./ClientsMiddleware";
import { ExpressMiddleware } from "../../Core/Express/ExpressMiddleware";
import { ITinkoffSpeechKit } from "../../Core/TinkoffCloudApi/TinkoffSpeechKit";
import { TRecipientBridge, TRecipientFile, TRecipientText, TRecipientTextV2 } from "../../Types/ClientVoiceTypes";
import { recipientTimeLimitsToVoiceTimeLimits } from "../../Types/VoiceModelExtension";


export function ClientsVoiceRouter(
    clientService: IClientService,
    publisher: IPublisher,
    voiceChannelState: IVoiceChannelState,
    rpcStatus: IRpcSender,
    rpcAssetsManager: IRpcSender,
    clientVoiceFiles: ClientVoiceFiles,
    speechKit: IYandexSpeechKit,
    speechKitV2: ITinkoffSpeechKit): Router {

    let router = Router();

    router.get("/voice/channel", ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) => {

        try {
            let authKey: string = req.query.ckey;
            let client: Client = clientService.getClient(authKey);
            let state = await voiceChannelState.getState(client.uid);
            client.voiceQueue = state.inqueue;
            let bandwidth = client.voiceBandwidthLimit - state.inqueue;
            resp.json({ bandwidth: bandwidth >= 0 ? bandwidth : 0 });
        } catch (err) {
            Logger.error("Server.ClientsVoice.bandwidth", err.stack);
            resp.send(0);
        }
    });

    router.post("/voice/duration", ExpressMiddleware.checkEmptyBodyFields(["text"]), (req: Request, resp: Response) => {
        let text: string = req.body.text;
        const durationByChars = {
            " ": 0.12,
            "*": 0.14
        }

        let duration: number = 0;
        for (let i = 0; i < text.length; i++) {
            let char: string = text[i];
            duration += durationByChars[char] || durationByChars["*"];
        }

        resp.json({ duration: Math.ceil(duration) });
    });

    router.get("/voice/files", ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) => {
        let authKey: string = req.query.ckey;
        let client: Client = clientService.getClient(authKey);
        let files = await clientVoiceFiles.getFiles(client._id);
        resp.json({ files: files });
    });

    router.get("/voice/files/:id", async (req: Request, resp: Response) => {
        let id: string = req.params.id;
        let file = await clientVoiceFiles.getFile(id);
        if (!file) {
            return resp.status(Http.StatusCode.NOT_FOUND).send();
        }

        resp.set("Content-Type: application/octet-stream");
        resp.set(`Content-Length: ${file.buffer.length}`);
        resp.set("Pragma: no-cache");
        resp.set("Expires: 0");
        resp.send(file.buffer);
    });

    router.post("/voice/files/:comment", ExpressMiddleware.checkEmptyBody(), ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) => {
        try {
            let authKey: string = req.query.ckey;
            let client: Client = clientService.getClient(authKey);
            let comment: string = req.params.comment;
            let result = await clientVoiceFiles.saveFile(client._id, req.body, comment);
            resp.json({ id: result });
        } catch (err) {
            Logger.error("Server.ClientsVoice.postfiles", err.stack);
            return resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send();
        }
    });

    router.post("/voice/push/file",
        ExpressMiddleware.checkArrayBody(),
        ClientsMiddleware.checkAuth(clientService),
        ClientsMiddleware.checkVoiceLimits(clientService), async (req: Request, resp: Response) => {
            try {
                let authKey: string = req.query.ckey;
                let client: Client = clientService.getClient(authKey);
                let force: boolean = req.query.force;
                let recipients: TRecipientFile[] = req.body;

                if (client.voiceBandwidthLimit > 0 && !force) {
                    let state = await voiceChannelState.getState(client.uid);
                    client.voiceQueue = state.inqueue;
                    if (recipients.length > (client.voiceBandwidthLimit - state.inqueue))
                        return resp.status(Http.StatusCode.BANDWIDTH_LIMIT_EXCEEDED).send();
                }

                for (let i in recipients) {
                    let recipient: TRecipientFile = recipients[i];
                    let voice: TVoiceMessage = {
                        systemId: new ObjectID().toString(),
                        type: EVoiceMessageTypes.VOICE_FILE,
                        acceptedAt: Date.now() / 1000,
                        messageId: recipient.message_id || 0,
                        clientId: client.uid,
                        recipient: recipient.recipient,
                        status: EVoiceStatus.ACCEPTED,
                        voiceFile: recipient.file_id ? String(recipient.file_id) : undefined,
                        retries: client.trimVoiceRetries(recipient.retries),
                        retryDelay: client.trimVoiceRetryDelay(recipient.retry_delay),
                        attempRetries: 0,
                        ivr: recipient.ivr,
                        ivrDelay: Number(recipient.ivr_delay) || Ivr.DELAY,
                        priority: Number(recipient.priority) || 0,
                        trunkId: client.voiceTrunkId,
                        reservableTrunkId: client.voiceReservableTrunkId,
                        caller: recipient.caller || "",
                        timeout: recipient.timeout,
                        force: Boolean(recipient.force),
                        timeLimits: recipientTimeLimitsToVoiceTimeLimits(recipient.time_limits)
                    };

                    publisher.publish(RoutingKeys.SEND_VOICE, voice);
                    client.logSendVoice();
                }

            } catch (err) {
                Logger.error("Server.ClientsVoice.push", err.stack);
                return resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send();
            }

            resp.status(200).send();
        });

    router.post("/voice/push/text",
        ExpressMiddleware.checkArrayBody(),
        ClientsMiddleware.checkAuth(clientService),
        ClientsMiddleware.checkVoiceLimits(clientService), async (req: Request, resp: Response) => {
            try {
                let authKey: string = req.query.ckey;
                let client: Client = clientService.getClient(authKey);
                let force: boolean = req.query.force;
                let recipients: TRecipientText[] = req.body;

                if (client.voiceBandwidthLimit > 0 && !force) {
                    let state = await voiceChannelState.getState(client.uid);
                    client.voiceQueue = state.inqueue;
                    if (recipients.length > (client.voiceBandwidthLimit - state.inqueue))
                        return resp.status(Http.StatusCode.BANDWIDTH_LIMIT_EXCEEDED).send();
                }

                for (let i in recipients) {
                    let recipient: TRecipientText = recipients[i];
                    let voice: TVoiceMessage = {
                        systemId: new ObjectID().toString(),
                        type: EVoiceMessageTypes.TEXT,
                        acceptedAt: Date.now() / 1000,
                        messageId: recipient.message_id || 0,
                        clientId: client.uid,
                        recipient: recipient.recipient,
                        status: EVoiceStatus.ACCEPTED,
                        text: recipient.text ? String(recipient.text) : undefined,
                        speechGenerateParams: recipient.speechOptions || {},
                        retries: client.trimVoiceRetries(recipient.retries),
                        retryDelay: client.trimVoiceRetryDelay(recipient.retry_delay),
                        attempRetries: 0,
                        ivr: recipient.ivr,
                        ivrDelay: Number(recipient.ivr_delay) || Ivr.DELAY,
                        priority: Number(recipient.priority) || 0,
                        trunkId: client.voiceTrunkId,
                        reservableTrunkId: client.voiceReservableTrunkId,
                        caller: recipient.caller || "",
                        timeout: recipient.timeout,
                        context: recipient.context || null,
                        force: Boolean(recipient.force),
                        timeLimits: recipientTimeLimitsToVoiceTimeLimits(recipient.time_limits)
                    };

                    publisher.publish(RoutingKeys.SEND_VOICE, voice);
                    client.logSendVoice();
                }

            } catch (err) {
                Logger.error("Server.ClientsVoice.push", err.stack);
                return resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send();
            }

            resp.status(200).send();
        });

    router.post("/voice/push/text_v2",
        ExpressMiddleware.checkArrayBody(),
        ClientsMiddleware.checkAuth(clientService),
        ClientsMiddleware.checkVoiceLimits(clientService), async (req: Request, resp: Response) => {
            try {
                let authKey: string = req.query.ckey;
                let client: Client = clientService.getClient(authKey);
                let force: boolean = req.query.force;
                let recipients: TRecipientTextV2[] = req.body;

                if (client.voiceBandwidthLimit > 0 && !force) {
                    let state = await voiceChannelState.getState(client.uid);
                    client.voiceQueue = state.inqueue;
                    if (recipients.length > (client.voiceBandwidthLimit - state.inqueue))
                        return resp.status(Http.StatusCode.BANDWIDTH_LIMIT_EXCEEDED).send();
                }

                for (let i in recipients) {
                    let recipient = recipients[i];

                    let speechOptions = recipient.speechOptions || {};

                    let voice: TVoiceMessage = {
                        systemId: new ObjectID().toString(),
                        type: EVoiceMessageTypes.TEXT_V2,
                        acceptedAt: Date.now() / 1000,
                        messageId: recipient.message_id || 0,
                        clientId: client.uid,
                        recipient: recipient.recipient,
                        status: EVoiceStatus.ACCEPTED,
                        text: recipient.text ? String(recipient.text) : undefined,
                        speechGenerateParamsV2: speechOptions,
                        retries: client.trimVoiceRetries(recipient.retries),
                        retryDelay: client.trimVoiceRetryDelay(recipient.retry_delay),
                        attempRetries: 0,
                        ivr: recipient.ivr,
                        ivrDelay: Number(recipient.ivr_delay) || Ivr.DELAY,
                        priority: Number(recipient.priority) || 0,
                        trunkId: client.voiceTrunkId,
                        reservableTrunkId: client.voiceReservableTrunkId,
                        caller: recipient.caller || "",
                        timeout: recipient.timeout,
                        context: recipient.context || null,
                        force: Boolean(recipient.force),
                        timeLimits: recipientTimeLimitsToVoiceTimeLimits(recipient.time_limits)
                    };

                    publisher.publish(RoutingKeys.SEND_VOICE, voice);
                    client.logSendVoice();
                }

            } catch (err) {
                Logger.error("Server.ClientsVoice.push", err.stack);
                return resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send();
            }

            resp.status(200).send();
        });

    router.post("/voice/push/callback",
        ExpressMiddleware.checkArrayBody(),
        ClientsMiddleware.checkAuth(clientService),
        ClientsMiddleware.checkVoiceLimits(clientService), async (req: Request, resp: Response) => {
            try {
                let authKey: string = req.query.ckey;
                let force: boolean = req.query.force;
                let client: Client = clientService.getClient(authKey);
                let recipients: TRecipientBridge[] = req.body;

                if (client.voiceBandwidthLimit > 0 && !force) {
                    let state = await voiceChannelState.getState(client.uid);
                    client.voiceQueue = state.inqueue;
                    if (recipients.length > (client.voiceBandwidthLimit - state.inqueue))
                        return resp.status(Http.StatusCode.BANDWIDTH_LIMIT_EXCEEDED).send();
                }

                for (let i in recipients) {
                    let recipient: TRecipientBridge = recipients[i];
                    let voice: TVoiceMessage = {
                        systemId: new ObjectID().toString(),
                        type: EVoiceMessageTypes.CALLBACK,
                        acceptedAt: Date.now() / 1000,
                        messageId: recipient.message_id || 0,
                        clientId: client.uid,
                        recipient: recipient.recipient,
                        status: EVoiceStatus.ACCEPTED,
                        callback: {
                            recipient: recipient.subscriber ? String(recipient.subscriber) : undefined
                        },
                        retries: client.trimVoiceRetries(recipient.retries),
                        retryDelay: client.trimVoiceRetryDelay(recipient.retry_delay),
                        attempRetries: 0,
                        priority: 0,
                        trunkId: client.voiceTrunkId,
                        reservableTrunkId: client.voiceReservableTrunkId,
                        caller: recipient.subscriber || "",
                        timeout: recipient.timeout
                    };

                    publisher.publish(RoutingKeys.SEND_VOICE, voice);
                    client.logSendVoice();
                }

            } catch (err) {
                Logger.error("Server.ClientsVoice.push", err.stack);
                return resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send();
            }

            resp.status(200).send();
        });

    router.post("/voice/status", ExpressMiddleware.checkArrayBody(), ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) => {
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

            let reply: any = await rpcStatus.sendAndGetReply(RpcCommands.GETVOICE_STATUS, query);
            resp.json(reply);

        } catch (err) {
            resp.sendStatus(Http.StatusCode.INTERNAL_SERVER_ERROR);
            Logger.error("Server.ClientsVoice.status", err.stack);
        }
    });

    router.get("/voice/synthesize", ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) => {

        try {
            let text = req.query.text;

            if (!text)
                return resp.status(Http.StatusCode.BAD_REQUEST).send()

            let emotion = req.query.emotion;
            let lang = req.query.lang;
            let speed = req.query.speed;
            let voice = req.query.voice;

            resp.header("Content-type", "audio/mp3");

            let stream = await speechKit.synthesis({
                text: text,
                emotion: emotion || "neutral",
                lang: lang || "ru-RU",
                speed: speed || 1.0,
                voice: voice || "alyss",
                format: "lpcm",
                sampleRateHertz: 16000
            });

            stream.pipe(TranscoderRawToMp3())
                .on("data", (chunk) => resp.write(chunk))
                .on("end", () => {
                    resp.end();
                })
                .on("error", (err) => {
                    Logger.error("Server.ClientVoice.synthesize", err);
                    resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send(err.stack);
                });

        } catch (err) {
            Logger.error("Server.ClientVoice.synthesize", err.stack);
            resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send(err.stack);
        }

    });

    router.get("/voice/synthesize_v2", ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) => {

        try {
            let text = req.query.text;

            if (!text)
                return resp.status(Http.StatusCode.BAD_REQUEST).send()

            let voice = req.query.voice;

            resp.header("Content-type", "audio/mp3");

            let stream = await speechKitV2.synthesis({
                input: {
                    text: text
                },
                audioConfig: {
                    audioEncoding: "LINEAR16",
                    sampleRateHertz: 16000
                },
                voice: {
                    name: voice || "alyona"
                }
            });

            stream.pipe(TranscoderRawToMp3())
                .on("data", (chunk) => resp.write(chunk))
                .on("end", () => {
                    resp.end();
                })
                .on("error", (err) => {
                    Logger.error("Server.ClientVoice.synthesize_v2", err);
                    resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send(err.stack);
                });

        } catch (err) {
            Logger.error("Server.ClientVoice.synthesize_v2", err.stack);
            resp.status(Http.StatusCode.INTERNAL_SERVER_ERROR).send(err.stack);
        }

    });

    router.get("/voice/record/file/input/:id", ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) =>
        await recordFileResponse(req, resp, RpcCommands.VOICE_INPUT_RECORD_FILE));

    router.get("/voice/record/file/output/:id", ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) =>
        await recordFileResponse(req, resp, RpcCommands.VOICE_OUTPUT_RECORD_FILE));

    router.get("/voice/record/file/mixed/:id", ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) =>
        await recordFileResponse(req, resp, RpcCommands.VOICE_MIXED_RECORD_FILE));

    router.get("/voice/record/text/:id", ClientsMiddleware.checkAuth(clientService), async (req: Request, resp: Response) => { });

    async function recordFileResponse(req: Request, resp: Response, cmd: RpcCommands): Promise<void> {

        let authKey: string = req.query.ckey;
        let client: Client = clientService.getClient(authKey);
        let messageId = String(req.params.id);

        let data = await rpcAssetsManager.sendAndGetReply(`${cmd}`, { messageId: messageId, clientId: client.uid })

        resp.header('Content-type', 'audio/mp3');
        resp.send(Buffer.alloc(data['size'], data['body'], "base64"));
    }

    return router;
}