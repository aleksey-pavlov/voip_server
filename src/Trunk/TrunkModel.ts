import { ObjectID } from "bson";
import { TVoiceMessage, EVoiceStatus, TVoiceMessageTimeLimits } from "../Types/VoiceModel";
import { IVoicesStatus } from "../Services/VoicesStatus";
import { IVoicesQueue } from "./VoicesQueue";
import { IVoiceFileGenerator } from "./VoiceFileGenerator";
import { IAsteriskManager, TEventCdrResponse, TEventCdrDisposition, cdrEventToCdrResponse } from "./AsteriskManager/IAsteriskManager";
import { Logger } from "../Core/Logger";
import { IVoicesStorage } from "./VoicesStorage";
import { NotificationService } from "../Services/NotificationService";

export type TTrunkSource = {
    _id: ObjectID;
    id: string;
    provider: string;
    weight: number;
    bandwidth: number;
    location: string;
    sipChannelTemplate: string;
    debugMode: boolean;
    devMode: boolean;
    host: string;
    port: number;
    user: string;
    pass: string;
    cronInterval: number;
    comment: string;
    batchSize: number;
    reservable: boolean;
    defaultCaller: string;
    thresholdQueueNotify: number;
    callers: string[];
    callerPrefix: string;
    notice: string;
    maxCongestionRetry: number;
    maxAllowCallingHour: number;
    minAllowCallingHour: number;
}

export type TTrunkSynhronizableData = {
    _id: ObjectID;
    statistic: TTrunkStatistic;
}

export type TTrunkStatistic = {
    queue: number;
    active: number;
    retry: number;
}

export type TResultCheckTimeLimits = {
    allow: boolean,
    retryAt?: number,
    retryDelay?: number,
    currentHour?: number
}

export interface ITrunk {
    getSource(): Promise<TTrunkSource>;
    getSynhronizableData(): Promise<TTrunkSynhronizableData>;
    enqueueHandler(voice: TVoiceMessage): Promise<boolean>;
    initialize(): Promise<void>;
    update(source: TTrunkSource): void;
    getId(): string;
    getVoicesQueue(): IVoicesQueue;
    getActiveVoices(): IVoicesStorage;
    deactivateTrunk(): void;
}

export class Trunk implements ITrunk {

    private _id: ObjectID;
    private id: string = "";
    private provider: string = "";
    private weight: number = 0;
    private bandwidth: number = 0;
    private location: string = "";
    private sipChannelTemplate: string = "${provider}_${id}/${recipient}";
    private debugMode: boolean = false;
    private devMode: boolean = false;
    private host: string = "localhost";
    private port: number = 5038;
    private user: string = "admin";
    private pass: string = "admin";
    private comment: string = "";
    private cronInterval: number = 5;
    private isRunning: boolean = true;
    private batchSize: number = 25;
    private reservable: boolean = false;
    private defaultCaller: string = "";
    private thresholdQueueNotify: number = 0;
    private firedQueueNotif: boolean = false;
    private callers: string[] = [];
    private callerPrefix: string = "";
    private notice: string = "";
    private maxCongetsionRetry: number = 5;
    private maxAllowCallingHour = 24;
    private minAllowCallingHour = 0;

    constructor(source: TTrunkSource,
        private voicesStatus: IVoicesStatus,
        private voicesQueue: IVoicesQueue,
        private voicesActive: IVoicesStorage,
        private voicesRetry: IVoicesStorage,
        private voiceFileGenerator: IVoiceFileGenerator,
        private asteriskManager: IAsteriskManager,
        private notificationService: NotificationService) {

        this.propertiesAssign(source);
    }

    public getId(): string {
        return this._id.toString();
    }

    public update(source: TTrunkSource): void {
        this.propertiesAssign(source);
    }

    private propertiesAssign(source: TTrunkSource) {

        this._id = source._id;
        this.id = source.id;
        this.provider = source.provider;
        this.weight = Number(source.weight) || 0;
        this.bandwidth = Number(source.bandwidth) || 0;
        this.location = String(source.location);
        this.sipChannelTemplate = String(source.sipChannelTemplate) || this.sipChannelTemplate;
        this.debugMode = source.debugMode || false;
        this.devMode = source.devMode || false;
        this.host = String(source.host) || this.host;
        this.port = Number(source.port) || this.port;
        this.user = String(source.user) || this.user;
        this.pass = String(source.pass) || this.pass;
        this.comment = String(source.comment) || this.comment;
        this.cronInterval = Number(source.cronInterval) || this.cronInterval;
        this.batchSize = Number(source.batchSize) || this.batchSize;
        this.reservable = source.reservable || false;
        this.defaultCaller = source.defaultCaller || this.defaultCaller;
        this.thresholdQueueNotify = source.thresholdQueueNotify || 0;
        this.callers = source.callers || this.callers;
        this.callerPrefix = source.callerPrefix || this.callerPrefix;
        this.notice = source.notice || this.notice;
        this.maxCongetsionRetry = source.maxCongestionRetry || this.maxCongetsionRetry;
        this.maxAllowCallingHour = Number(source.maxAllowCallingHour) || 24;
        this.minAllowCallingHour = Number(source.minAllowCallingHour) || 0;
    }

    public async initialize(): Promise<void> {

        this.asteriskManager.cdrEvent(
            async (event: TEventCdrResponse) =>
                await this.cdrEventHandler(event));

        this.loadVoicesRetryTimers();
        this.loadActiveVoicesTimers();

        this.cron();

        Logger.info("Trunk", `TrunkId=${this._id.toString()} initialize done!`);
    }

    public async getSource(): Promise<TTrunkSource> {
        return {
            _id: this._id,
            provider: this.provider,
            id: this.id,
            weight: this.weight,
            sipChannelTemplate: this.sipChannelTemplate,
            bandwidth: this.bandwidth,
            location: this.location,
            debugMode: this.debugMode,
            devMode: this.devMode,
            host: this.host,
            port: this.port,
            user: this.user,
            pass: this.pass,
            cronInterval: this.cronInterval,
            comment: this.comment,
            batchSize: this.batchSize,
            reservable: this.reservable,
            defaultCaller: this.defaultCaller,
            thresholdQueueNotify: this.thresholdQueueNotify,
            callers: this.callers,
            callerPrefix: this.callerPrefix,
            notice: this.notice,
            maxCongestionRetry: this.maxCongetsionRetry,
            maxAllowCallingHour: this.maxAllowCallingHour,
            minAllowCallingHour: this.minAllowCallingHour
        }
    }

    public async getSynhronizableData(): Promise<TTrunkSynhronizableData> {
        return {
            _id: this._id,
            statistic: await this.getStatistic()
        }
    }

    public async getStatistic(): Promise<TTrunkStatistic> {
        return {
            active: await this.voicesActive.count(),
            queue: await this.voicesQueue.size(),
            retry: await this.voicesRetry.count()
        };
    }

    public async enqueueHandler(voice: TVoiceMessage): Promise<boolean> {
        voice.status = EVoiceStatus.INQUEUE;
        voice.enqueueAt = Date.now() / 1000;
        voice.trunkId = this.getId();
        voice.caller = `${this.callerPrefix}${voice.caller}`;
        voice.congestionRetry = 0;

        if (!voice.isRedirected)
            this.voicesStatus.change(voice);

        return await this.voicesQueue.add(voice);
    }

    public getVoicesQueue(): IVoicesQueue {
        return this.voicesQueue;
    }

    public deactivateTrunk(): void {
        this.isRunning = false;
        Logger.info("Trunk.deactivate", `TrunkId=${this.getId()} deactivated!`);
    }

    public getActiveVoices(): IVoicesStorage {
        return this.voicesActive;
    }

    private async cron() {
        setTimeout(async () => {
            await this.checkThresholdQueueCron();
            await this.originateCron();
            await this.cron();
        }, this.cronInterval * 1000);
    }

    private isAllowCallingByTime(voice: TVoiceMessage): TResultCheckTimeLimits {

        let timezone = voice.regionTimeZone;
        let currentDate = new Date();
        currentDate.setHours(currentDate.getUTCHours() + timezone);
        let hour = currentDate.getHours();

        let minAllowCallingHour = this.minAllowCallingHour;
        let maxAllowCallingHour = this.maxAllowCallingHour;

        let timeLimitVoice: TVoiceMessageTimeLimits = voice.timeLimits;

        if (timeLimitVoice) {
            minAllowCallingHour = timeLimitVoice.fromHour || this.minAllowCallingHour;
            maxAllowCallingHour = timeLimitVoice.toHour || this.maxAllowCallingHour;
        }

        if (!voice.force && (hour > maxAllowCallingHour || hour < minAllowCallingHour)) {

            if (hour > maxAllowCallingHour)
                currentDate.setDate(currentDate.getDate() + 1);

            currentDate.setHours(minAllowCallingHour);
            currentDate.setMinutes(0);
            let retryAt = (currentDate.getTime() / 1000);

            return {
                allow: false,
                retryAt: retryAt,
                retryDelay: retryAt - (Date.now() / 1000),
                currentHour: hour
            };
        }

        return {
            allow: true
        };
    }

    private async originateCron() {

        try {

            if (!this.isRunning)
                return;

            let activeVoices = await this.voicesActive.count();

            let availableBandwidth = this.bandwidth - activeVoices;
            let remaining: number = Math.min(availableBandwidth, this.batchSize);
            if (remaining > 0) {
                let voices: TVoiceMessage[] = await this.voicesQueue.get(remaining);

                let voicePromises = [];

                for (let i in voices) {

                    let timeLimits = this.isAllowCallingByTime(voices[i]);
                    if (!timeLimits.allow) {
                        voices[i].retryAt = timeLimits.retryAt;
                        voices[i].retryDelay = timeLimits.retryDelay;

                        await this.createRetryTimer(voices[i]);

                        Logger.info("Trunk.originateCron.voice",
                        `Retried by hours limitation MessageId=${voices[i].messageId} TrunkId=${voices[i].trunkId} CurrentHour=${timeLimits.currentHour} Timezone=${voices[i].regionTimeZone} RetryDelay=${voices[i].retryDelay} RetryAt=${voices[i].retryAt}`);
        
                        continue;
                    }

                    voicePromises.push(new Promise(async resolve => {
                        let voice: TVoiceMessage = voices[i];
                        try {

                            let voiceFileInfo = await this.voiceFileGenerator.generate(voice);

                            voice.actualDuration = Math.ceil(Number(voiceFileInfo.duration));
                            voice.voiceFile = voiceFileInfo.name;

                            if (!voiceFileInfo.exists)
                                voice.synthesCharsCount = voiceFileInfo.chars;

                            let response = await this.asteriskManager.originateAction(voice);

                            if (response.response == "Error") {
                                Logger.warn("Trunk.originateCron.voice", `Originate response error on TrunkId=${this.getId()} MessageId=${voice.messageId} Message=${response.message}`);
                                await this.voicesQueue.add(voice);
                                await this.voicesActive.del(voice.systemId);
                                return resolve(1);
                            }

                            await this.onOriginateVoice(voice);

                            Logger.info("Trunk.originateCron.voice", `Originated ${voice.systemId} voice`);

                            return resolve(1);

                        } catch (err) {
                            voice.priority += activeVoices;
                            await this.voicesQueue.add(voice);
                            await this.voicesActive.del(voice.systemId);
                            Logger.error("Trunk.originateCron.voice", `TrunkId=${this.getId()} MessageId=${voice.messageId} ${err.stack}`);
                            return resolve(1);
                        }
                    }));

                    Logger.info("Trunk.originateCron.voice", `Added to calls ${voices[i].systemId} voice`);
                    await this.onOriginateVoice(voices[i]);
                }

                if (voicePromises.length > 0) {
                    Logger.info("Trunk.originateCron.voice", `Execute ${voicePromises.length} voices`);
                }

                Promise.all(voicePromises);
            }
        } catch (err) {
            Logger.error("Trunk.originateCron", `${this.getId()} ${err.stack}`);
        }
    }

    private async cdrEventHandler(event: TEventCdrResponse): Promise<void> {

        try {

            if (RegExp(/^from-/).test(event.destinationcontext))
                return;

            if (event.accountcode.length < 1)
                return;

            let voice = await this.onResponseVoice(event.calleridname);
            if (!voice)
                return;

            if (event.disposition == TEventCdrDisposition.CONGESTION && voice.congestionRetry < this.maxCongetsionRetry) {

                voice.congestionRetry++;

                await this.voicesQueue.add(voice);
                Logger.warn("Trunk.Originate.Congestion", `TrunkId=${this.getId()} TrunkComment=${this.comment} MessageId=${voice.messageId} Retry=${voice.congestionRetry} of ${this.maxCongetsionRetry}`);
                return;
            }

            let response = cdrEventToCdrResponse(event);

            voice.status = response.status;
            voice.duration = response.duration;
            voice.cdrDestination = response.cdrDestination;
            voice.cdrUniqueId = response.cdrUniqueId;
            voice.cdrAmdStatus = response.cdrAmdStatus;
            voice.startAt = response.startAt;
            voice.finishAt = response.finishAt;
            voice.dialuptime = response.dialuptime;

            if ([EVoiceStatus.BUSY, EVoiceStatus.NOANSWER, EVoiceStatus.FAILED].indexOf(voice.status) >= 0 && voice.retries > 0 && voice.attempRetries < voice.retries) {
                voice.attempRetries++;
                voice.retryAt = (Date.now() / 1000) + Number(voice.retryDelay);
                await this.createRetryTimer(voice);
                Logger.warn("Trunk.Originate.VoiceRetry", JSON.stringify(voice, null, 2));
                return;
            }

            this.voicesStatus.change(voice);

        } catch (err) {
            Logger.error("Trunk.hangUpEventHandler", `${this.getId()} ${err.stack}`);
        }
    }

    private async loadVoicesRetryTimers() {
        let voices = await this.voicesRetry.getAll();
        for (let i in voices)
            await this.createRetryTimer(voices[i]);
    }

    private async createRetryTimer(voice: TVoiceMessage) {
        let retryTimeout = voice.retryDelay * 1000;
        setTimeout(async () => {
            await this.voicesQueue.add(voice);
            await this.voicesRetry.del(voice.systemId);
        }, retryTimeout);

        await this.voicesRetry.add(voice);
    }

    private async loadActiveVoicesTimers() {
        let voices = await this.voicesActive.getAll();
        for (let i in voices)
            await this.onOriginateVoice(voices[i]);
    }

    private async onOriginateVoice(voice: TVoiceMessage): Promise<void> {
        await this.voicesActive.add(voice);
    }

    private async onResponseVoice(systemId: string): Promise<TVoiceMessage> {

        let voice = await this.voicesActive.get(systemId);

        if (!voice)
            return null;

        await this.voicesActive.del(systemId);

        return voice;
    }

    private async checkThresholdQueueCron() {

        if (this.thresholdQueueNotify <= 0)
            return;

        let queueSize = await this.voicesQueue.size();

        if (!this.firedQueueNotif && queueSize > this.thresholdQueueNotify) {
            await this.notificationService.warning(`Trunk ${this.comment}`, `QUEUE SIZE ${queueSize} OVER LIMIT ${this.thresholdQueueNotify}!`);
            this.firedQueueNotif = true;
            return;
        }

        if (this.firedQueueNotif && queueSize < this.thresholdQueueNotify)
            this.firedQueueNotif = false;
    }
}