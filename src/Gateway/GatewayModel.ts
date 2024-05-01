import { GatewayBoxes, IBoxes } from "./GatewayBoxes";
import { format } from "util";
import { Logger } from "../Core/Logger";
import { TMessageTypes, TMessage, TMessageStatus } from "../Types/MessageModel";
import { IBox } from "./GatewayBox";
import { TPortSource, IPort, Port } from "./GatewayPort";
import { TNumPortsByProvider, IPortsStorage } from "./Ports/PortsStorage";
import { IApi } from "./IGatewayApi";
import { GatewayServices } from "./GatewayServices";
import { ErrorCode } from "./Api/ErrorCode";

export interface IGateway {
    initialize(source: TPortSource[]): Promise<void>;
    update(source: TGatewaySource): Promise<void>;
    get(): Promise<TGatewaySource>;
    getBoxes(): IBoxes
    enqueueMessage(message: TMessage): Promise<boolean>;
    getId(): string;
    getNumPortsByProvider(): TNumPortsByProvider;
    getMessagesType(): TMessageTypes;
}

export type TBoxesState = {
    outbox: number,
    sentbox: number
};

export type TGatewaySource = {
    _id: string;
    ports: TPortSource[];
    ip: string;
    port: number;
    user: string;
    password: string;
    maxMsgInQueue: number;
    maxQueryResult: number;
    limitMsgQueryResult: number;
    rutineInterval: number;
    name: string;
    statusCode: number;
    statusNote: string;
    location: string;
    sentBoxExpire: number;
    deviceUserId: number;
    messagesType: TMessageTypes;
    boxesState: TBoxesState;
    mobileConfigManual: boolean;
}

export class Gateway implements IGateway {

    private _id: string;
    private statusCode: number;
    private statusNote: string;
    private port: number = 8080;
    private ip: string = "127.0.0.1";
    private user: string = "admin";
    private password: string = "admin";
    private name: string;
    private location: string;
    private maxMsgInQueue: number = 32;
    private maxQueryResult: number = 32;
    private limitMsgQueryResult: number = 32;
    private rutineInterval: number = 1000;
    private sentBoxExpire: number = 60;
    private deviceUserId: number = 0;
    private messagesType: TMessageTypes = undefined;
    private api: IApi;
    private boxes: GatewayBoxes;
    private services: GatewayServices;
    private portsStorage: IPortsStorage;
    private mobileConfigManual: boolean = false;
    private ports: { [x: number]: IPort } = {};

    public constructor(
        source: TGatewaySource,
        boxes: GatewayBoxes,
        services: GatewayServices,
        api: IApi,
        portsStorage: IPortsStorage
    ) {
        this.propertiesAssign(source);

        this.api = api;
        this.boxes = boxes;
        this.services = services;
        this.portsStorage = portsStorage;

        this.api.setConnectionParams({
            ip: this.ip,
            port: this.port,
            user: this.user,
            password: this.password
        });

        this.deviceUserId = source.deviceUserId || this.deviceUserId;
        this.messagesType = source.messagesType || this.messagesType;
    }

    public async initialize(source: TPortSource[]): Promise<void> {
        await this.initializePorts(source);
        await this.preparePorts();
        this.crawler();
        Logger.info("Provider.Gateway.initialize", "[%s] Gateway initialize done!", [this.getId()]);
    }

    private propertiesAssign(source: TGatewaySource): void {
        this._id = source._id;
        this.port = source.port || this.port;
        this.ip = source.ip || this.ip;
        this.user = source.user || this.user;
        this.password = source.password || this.password;
        this.name = source.name || format("%s:%s", this.ip, this.port);
        this.location = source.location;
        this.maxMsgInQueue = source.maxMsgInQueue || this.maxMsgInQueue;
        this.maxQueryResult = source.maxQueryResult || this.maxQueryResult;
        this.limitMsgQueryResult = source.limitMsgQueryResult || this.limitMsgQueryResult;
        this.rutineInterval = source.rutineInterval || this.rutineInterval;
        this.sentBoxExpire = +source.sentBoxExpire || this.sentBoxExpire;
        this.mobileConfigManual = (source.mobileConfigManual !== undefined) ? source.mobileConfigManual : this.mobileConfigManual;
    }

    public async get(): Promise<TGatewaySource> {

        let ports: TPortSource[] = [];

        for (let i in this.ports) {
            if (this.ports[i] instanceof Port) {
                ports[i] = this.ports[i].get();
            }
        }

        return {
            _id: this._id,
            ports: ports,
            port: this.port,
            ip: this.ip,
            user: this.user,
            password: this.password,
            name: this.name,
            location: this.location,
            maxMsgInQueue: this.maxMsgInQueue,
            maxQueryResult: this.maxQueryResult,
            limitMsgQueryResult: this.limitMsgQueryResult,
            rutineInterval: this.rutineInterval,
            sentBoxExpire: this.sentBoxExpire,
            statusCode: this.statusCode,
            statusNote: this.statusNote,
            deviceUserId: this.deviceUserId,
            messagesType: this.messagesType,
            boxesState: await this.getBoxesState(),
            mobileConfigManual: this.mobileConfigManual
        };
    }

    public getBoxes(): IBoxes {
        return this.boxes;
    }

    private async getBoxesState(): Promise<TBoxesState> {

        let outBox = this.boxes.getOutbox();
        let sentBox = this.boxes.getSentbox();

        return {
            outbox: await outBox.size(),
            sentbox: await sentBox.size(),
        };
    }


    public async update(source: TGatewaySource): Promise<void> {
        this.propertiesAssign(source);
        await this.initializePorts(source.ports);
    }

    public getNumPortsByProvider(): TNumPortsByProvider {
        return this.portsStorage.getNumPortsByProvider();
    }

    public getMessagesType(): TMessageTypes {
        return this.messagesType;
    }

    private async initializePorts(ports: TPortSource[]): Promise<void> {
        try {
            let response = await this.api.get_port_info({});
            this.setStatus(response.error_code);

            if (response.error_code == ErrorCode.Success) {

                for (let i in response.info) {

                    let num = response.info[i].port;
                    let source = ports[num];

                    if (!(this.ports[num] instanceof Port)) {
                        let port = this.createPort(source, response.info[i]);
                        this.ports[num] = port;
                    } else {
                        this.ports[num].update(source);
                    }
                }

                Logger.info("Provider.Gateway.initializePorts", "[%s] Initialize ports done!", [this.getId()]);
            }
        } catch (err) {
            this.setStatus(ErrorCode.OtherError);
            Logger.error("Provider.Gateway.initializePorts", "[%s] %s", [this.getId(), err.stack]);
        }
    }

    private createPort(source: TPortSource, info: IApi.Response.PortInfo): IPort {
        let notificationService = this.services.getNotificationService();
        let simService = this.services.getSimService();
        let port = new Port(source, info, simService);

        port.events.on("changeSlot", (portNum: number, slotIndex: number) => {
            this.api.switch_sim_status({ action: "ACTIVATE", slotIndex: slotIndex });
            Logger.info("Provider.Gateway.changeSlot", "[%s] Port %s; SlotIndex %s", [this.getId(), portNum, slotIndex]);
        });

        port.events.on("notif", (portNum: number, notif: string) => {
            let port = this.ports[portNum];
            let notifTitle = format("Gateway %s (%s ports)", this.name, this.getNumPorts());
            let notifText = format("`%s %s` | *Port %s*: %s",
                port.info.imsi,
                port.info.reg,
                port.info.port,
                notif);
            notificationService.warning(notifTitle, notifText);
        });

        port.events.on("updateMobileConfig", () => {
            if (this.mobileConfigManual) {
                let data: { [x: number]: IApi.Data.MobileConfig } = {};
                for (let i in this.ports) {
                    data[i] = this.ports[i].mobileConfig;
                }
                this.api.update_mobile_config(data);
            }
        });

        return port;
    }

    private async crawler() {
        setTimeout(async () => {
            await this.preparePorts();
            await this.cronSendSms();
            await this.cronQueryResult();
            await this.crawler();
        }, this.rutineInterval);
    }

    private async preparePorts(): Promise<void> {
        try {
            let response = await this.api.get_port_info({ info_type: ["reg", "imsi", "smsc"] });
            this.setStatus(response.error_code);

            if (response.error_code == ErrorCode.Success) {
                for (let i in response.info) {
                    let num = response.info[i].port;
                    let port = this.ports[num];
                    let provider = port.provider;

                    await port.preparePort(response.info[i]);

                    let isActive = port.active;
                    let isResend = port.isResend;

                    this.portsStorage.putActivePort(provider, num, isActive);
                    this.portsStorage.putResendPort(provider, num, isResend);
                }
            }

        } catch (err) {
            this.setStatus(ErrorCode.OtherError);
            Logger.error("Provider.Gateway.getPortInfo", "[%s] %s", [this.getId(), err.stack]);
        }
    }

    public async enqueueMessage(message: TMessage): Promise<boolean> {
        try {
            message.gatewayIdSent = this.getId();
            message.gatewayNameSent = this.name;

            if (!message.isRedirected) {
                this.setMessageStatus(message, "INQUEUE");
            }

            let outBox: IBox = this.boxes.getOutbox();
            let result: boolean = await outBox.add(message);
            return result;
        } catch (err) {
            Logger.error("Gateway.enqueueMessage", err.stack);
            return false;
        }
    }

    public getNumPorts(): number {
        return Object.keys(this.ports).length;
    }

    public getId(): string {
        return this._id.toString();
    }

    private async cronSendSms(): Promise<number> {

        let queue: IApi.Response.QuerySmsInQueue = {
            error_code: 200,
            in_queue: 0
        };

        let messages: TMessage[] = [];
        let queries: Array<Promise<IApi.Response.SendSms>> = [];
        let outbox = this.boxes.getOutbox();

        try {
            queue = await this.api.query_sms_in_queue();
            let isSuccess = (queue.error_code === ErrorCode.Success);
            let isFullQueue = (queue.in_queue >= this.maxMsgInQueue);

            if (isSuccess && !isFullQueue) {

                let remaind = this.maxMsgInQueue - queue.in_queue;

                messages = await outbox.get(remaind);

                for (let i in messages) {
                    let isResend = !!messages[i].isResend;
                    let numPort = this.portsStorage.getPort(messages[i].providerId, isResend);
                    if (numPort != null) {
                        if (isResend) {
                            messages[i].portGatewayResend = numPort;
                        } else {
                            messages[i].portGatewaySent = numPort;
                        }

                        let imsi: string = this.ports[numPort].info.imsi;
                        let iccid: string = this.ports[numPort].info.iccid;
                        let parts: number = +messages[i].parts;

                        let alwaysGiveStatus: TMessageStatus = this.ports[numPort].alwaysGiveStatus;
                        if (alwaysGiveStatus && alwaysGiveStatus.length > 0) {
                            messages[i].iccid = iccid;
                            messages[i].imsi = imsi;
                            this.setMessageStatus(messages[i], this.ports[numPort].alwaysGiveStatus);
                            delete messages[i];

                        } else {

                            // check limits
                            let sentAllow = this.ports[numPort].trySendMessage(parts)
                            if (sentAllow) {
                                let data: IApi.Data.SendSms = {
                                    port: [numPort],
                                    text: messages[i].text,
                                    param: [{
                                        number: messages[i].recipient,
                                        user_id: messages[i].deviceUserId = this.getDeviceUserId()
                                    }],
                                    encoding: messages[i].textEncoding
                                };

                                queries.push(this.api.send_sms(data));
                                messages[i].iccid = iccid;
                                messages[i].imsi = imsi;
                                this.setMessageStatus(messages[i], "SENDING");
                                await this.messageToSendbox(messages[i]);
                                delete messages[i];
                            }
                        }
                    }
                }

                if (queries.length > 0) {
                    await Promise.all(queries);
                }
            }

        } catch (err) {
            this.setStatus(ErrorCode.OtherError);
            Logger.error("Provider.Gateway.cronSendSms", "[%s] %s", [this.getId(), err.stack]);
        } finally {
            for (let i in messages) {
                if (messages[i]) {
                    await outbox.add(messages[i]);
                }
            }

            return queue.in_queue;
        }
    }

    private getDeviceUserId() {
        return this.deviceUserId++;
    }

    private async messageToSendbox(message: TMessage): Promise<void> {
        let sentbox = this.boxes.getSentbox();
        await sentbox.add(message);
    }

    private async cronQueryResult(): Promise<number> {

        let countInResult = 0;
        let currentTime = Math.floor(Date.now() / 1000);
        let messages: { [x: string]: TMessage } = {};
        let sentbox = this.boxes.getSentbox();

        try {

            let items: TMessage[] = await sentbox.get(this.limitMsgQueryResult);
            for (let i in items) {
                messages[items[i].deviceUserId] = items[i];
            }

            let response = await this.queryResult(messages);
            let isSuccess = (response.error_code === ErrorCode.Success);

            if (isSuccess) {

                countInResult = response.result.length;

                for (let i in response.result) {

                    let result = response.result[i];
                    let message = messages[result.user_id];

                    if (message !== undefined) {
                        let status = result.status;
                        if (message.status !== status) {

                            let refId = result.ref_id;
                            let time = Math.floor(new Date(result.time).getTime() / 1000);

                            message.sentAt = time || 0;
                            message.changeAt = currentTime;
                            message.deviceRefId = refId;
                            message.status = status;

                            this.setMessageStatus(message, status);

                            let isResend = (status === "FAILED" && !message.isResend);
                            if (isResend) {
                                await this.resendMessage(message);
                            }

                            this.ports[result.port].setResultSentStatus(status);
                        }

                        let isComplete = (["FAILED", "DELIVERED"].indexOf(status) >= 0);
                        if (isComplete) {
                            delete messages[result.user_id];
                        }
                    }
                }
            }

        } catch (err) {
            Logger.error("Provider.Gateway.cronQueryResult", "[%s] %s", [this.getId(), err.stack]);
        } finally {
            for (let i in messages) {
                let isExpired = (currentTime - messages[i].changeAt) >= this.sentBoxExpire;
                if (!isExpired && messages[i]) {
                    await sentbox.add(messages[i]);
                } else {
                    await this.messageToCache(messages[i]);
                }
            }

            return countInResult;
        }
    }

    private async queryResult(messages: { [x: string]: TMessage }): Promise<IApi.Response.QuerySmsResult> {

        let data: IApi.Response.QuerySmsResult = { error_code: 0, result: [] };

        let chunks = this.prepareQueryResult(messages);
        let requests: Array<Promise<IApi.Response.QuerySmsResult>> = [];
        for (let i in chunks) {
            requests.push(this.api.query_sms_result(chunks[i]));
        }

        let responses = await Promise.all(requests);

        for (let i in responses) {
            let response = responses[i];
            data.error_code = response.error_code;
            if (data.error_code === ErrorCode.Success) {
                data.result = data.result.concat(response.result);
            } else {
                Logger.warn("Provider.Gateway.queryResult",
                    "[%s] Query result error_code: %s!",
                    [this.getId(), response.error_code]);
            }
        }

        return data;
    }

    private prepareQueryResult(messages: { [x: string]: TMessage }): { [x: number]: IApi.Data.QuerySmsResult } {

        let data: { [x: number]: IApi.Data.QuerySmsResult } = {};

        let index = 0;

        for (let i in messages) {
            if (data[index] === undefined)
                data[index] = { user_id: [] };

            data[index].user_id.push(messages[i].deviceUserId);

            if (data[index].user_id.length >= this.maxQueryResult)
                index++;
        }

        return data;
    }

    private async resendMessage(message: TMessage): Promise<void> {
        message.isResend = true;
        this.setMessageStatus(message, "INQUEUE");
        let outBox = this.boxes.getOutbox();
        await outBox.add(message);
    }

    private async messageToCache(message: TMessage): Promise<void> {
        let cache = this.services.getMessageCacheService();
        await cache.append(message);
    }

    private setStatus(statusCode: number) {
        this.statusCode = statusCode;
        this.statusNote = ErrorCode[statusCode];
        if (this.statusCode !== ErrorCode.Success) {
            Logger.info("Provider.Gateway.setStatus",
                "[%s] status %s (%s)",
                [this.getId(), this.statusCode, this.statusNote]);
        }
    }

    private setMessageStatus(message: TMessage, status: TMessageStatus) {
        message.status = status;
        message.changeAt = Math.floor(Date.now() / 1000);
        let messageStatus = this.services.getMessagesStatus();
        messageStatus.change(message);
    }
}

