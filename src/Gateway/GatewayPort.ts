
import { EventEmitter } from "events";
import { Logger } from "../Core/Logger";
import { NotificationTexts } from "../Services/NotificationService";
import { TMessageStatus } from "../Types/MessageModel";
import * as moment from "moment";
import { IApi } from "./IGatewayApi";
import { SimService, ETerms } from "./Sim/SimService";

export interface IPort {
    active: boolean;
    isResend: boolean;
    limitDay: number;
    limitMonth: number;
    events: IPortEvents;
    info: IApi.Response.PortInfo;
    mobileConfig: IApi.Data.MobileConfig;
    provider: string;
    alwaysGiveStatus: TMessageStatus;

    preparePort(info: IApi.Response.PortInfo);
    update(source: TPortSource);
    get(): TPortSource;
    trySendMessage(parts: number): Promise<boolean>;
    setResultSentStatus(status: IApi.Response.QuerySmsResultStatus);
}

export type TPortSource = {
    info: IApi.Response.PortInfo;
    mobileConfig: IApi.Data.MobileConfig;
    isResend: boolean;
    initialIsResend: boolean;
    active: boolean;
    initialActive: boolean;
    limitDay: number;
    resetDayAt: number;
    limitMonth: number;
    resetMonthAt: number;
    activeSlot: number;
    numSlots: number;
    numSentBySlot: NumSentBySlot;
    slotsIndexes: number[];
    provider: string;
    alwaysGiveStatus: TMessageStatus;
}

export interface IPortEvents extends NodeJS.EventEmitter {
    on(event: "changeSlot", handler: (portNum: number, slotIndex: number) => void);
    on(event: "notif", handler: (portNum: number, notif: string) => void);
    on(event: "updateMobileConfig", handler: () => void);
    emit(event: "changeSlot", portNum: number, slotIndex: number);
    emit(event: "notif", portNum: number, notif: string);
    emit(event: "updateMobileConfig");
}


export class MobileConfig implements IApi.Data.MobileConfig {

    public CLIR: number = 0;
    public IsRevPola: number = 1;
    public IsGsmOpen: number = 0;
    public Micphone: number = 3;
    public Handset: number = 7;
    public APN: string = "";
    public APNName: string = "";
    public APNPSW: string = "";
    public PortBandType: string = "Default(Auto)";
    public SimWorkMode: number = 0;
    public bandtypedata: number = 512;
    public SMSC: string = "";

    constructor(source: Object, info: IApi.Response.PortInfo) {
        this.update(source);
        if (this.SMSC.length === 0 && info.smsc.length > 0) {
            this.SMSC = info.smsc;
        }
    }

    public update(source: Object): void {
        Object.assign(this, source);
    }
}

export class NumSentBySlot {
    day: number[];
    month: number[];
}

export class Port implements IPort {

    public active: boolean = false;
    public isResend: boolean = false;
    public info: IApi.Response.PortInfo;
    public mobileConfig: MobileConfig;
    public provider: string = "undefined";
    public alwaysGiveStatus: TMessageStatus;

    public limitDay: number = 0;
    private resetDayAt: number = moment().add({ day: 1 }).unix();

    public limitMonth: number = 0;
    private resetMonthAt: number = moment().add({ month: 1 }).unix();

    public events: IPortEvents = new EventEmitter();

    private initialIsResend: boolean = false;
    private initialActive: boolean = false;
    private isSimUpdate: boolean = true;

    private numSlots: number = 1;
    private activeSlot: number = 0;
    private slotsIndexes: number[] = [];
    private numSentBySlot: NumSentBySlot = new NumSentBySlot();

    private simService: SimService;

    private lastSendStatus: IApi.Response.QuerySmsResultStatus;
    private numFailed: number = 0;
    private maxNumFailed: number = 4;

    constructor(source: TPortSource,
        info: IApi.Response.PortInfo,
        simService: SimService) {

        if (!source) {
            source = this.get();
        }

        this.info = info;
        this.mobileConfig = this.getMobileConfig(source);
        this.simService = simService;
        this.provider = source.provider;
        this.isResend = !!source.isResend;
        this.initialIsResend = !!source.initialIsResend;
        this.active = !!source.active;
        this.initialActive = !!source.initialActive;
        this.limitDay = Number(source.limitDay);
        this.resetDayAt = Number(source.resetDayAt);
        this.limitMonth = Number(source.limitMonth);
        this.resetMonthAt = Number(source.resetMonthAt);
        this.activeSlot = Number(source.activeSlot);
        this.numSlots = Number(source.numSlots);
        this.numSentBySlot.day = source.numSentBySlot.day || new Array(this.numSlots).fill(0);
        this.numSentBySlot.month = source.numSentBySlot.month || new Array(this.numSlots).fill(0);
        this.slotsIndexes = this.getSlotsIndexes(this.numSlots, this.info.port);
        this.alwaysGiveStatus = source.alwaysGiveStatus;
    }

    private getMobileConfig(source: TPortSource): MobileConfig {
        let mobileConfig = !source ? {} : source.mobileConfig || {};
        return new MobileConfig(mobileConfig || {}, this.info);
    }

    public update(source: TPortSource) {
        if (!source) {
            source = this.get();
        }
        this.provider = source.provider;
        this.isResend = !!source.isResend;
        this.initialIsResend = !!source.initialIsResend;
        this.active = !!source.active;
        this.initialActive = !!source.initialActive;
        this.limitDay = Number(source.limitDay);
        this.resetDayAt = Number(source.resetDayAt);
        this.limitMonth = Number(source.limitMonth);
        this.resetMonthAt = Number(source.resetMonthAt);

        let activeSlot = Number(source.activeSlot);
        if (this.numSlots > 1 && activeSlot != this.activeSlot) {
            this.activeSlot = activeSlot;
            let slotIndex = this.slotsIndexes[this.activeSlot];
            this.events.emit("changeSlot", this.info.port, slotIndex);
        }

        let numSlots = Number(source.numSlots);
        if (numSlots > 0 && numSlots !== this.numSlots) {
            this.numSlots = numSlots;
            this.numSentBySlot.day = new Array(this.numSlots).fill(0);
            this.numSentBySlot.month = new Array(this.numSlots).fill(0);
            this.slotsIndexes = this.getSlotsIndexes(this.numSlots, this.info.port);
        }

        this.isSimUpdate = true;
        this.mobileConfig.update(source.mobileConfig);

        if (this.mobileConfig.SMSC !== this.info.smsc) {
            this.events.emit("updateMobileConfig");
        }

        this.alwaysGiveStatus = source.alwaysGiveStatus;
    }

    public get(): TPortSource {
        return {
            info: this.info,
            mobileConfig: this.mobileConfig,
            isResend: this.isResend,
            initialIsResend: this.initialIsResend,
            active: this.active,
            initialActive: this.initialActive,
            limitDay: this.limitDay,
            resetDayAt: this.resetDayAt,
            limitMonth: this.limitMonth,
            resetMonthAt: this.resetMonthAt,
            activeSlot: this.activeSlot,
            numSlots: this.numSlots,
            numSentBySlot: this.numSentBySlot,
            slotsIndexes: this.slotsIndexes,
            provider: this.provider,
            alwaysGiveStatus: this.alwaysGiveStatus
        }
    }

    private getSlotsIndexes(numSlots: number, port: number): number[] {
        let slotsIndexes: number[] = [];
        let firstIndex = numSlots * port;
        let lastIndex = firstIndex + numSlots;
        for (let i = firstIndex; i < lastIndex; i++) {
            slotsIndexes.push(i);
        }

        return slotsIndexes;
    }

    private getNextSlotIndex(): number {

        if ((this.activeSlot + 1) < this.numSlots) {
            this.activeSlot++;
        } else {
            this.activeSlot = 0;
        }

        return this.slotsIndexes[this.activeSlot];
    }

    private setStatus(active: boolean, notif?: string) {

        if ((this.initialActive && active) || !active) {
            this.active = active;
        }

        if ((this.initialIsResend && active) || !active) {
            this.isResend = active;
        }

        if (notif !== undefined) {
            this.events.emit("notif", this.info.port, notif);
        }
    }

    private async setNumSent(sent: { day: number, month: number }) {
        this.numSentBySlot.day[this.activeSlot] = sent.day;
        this.numSentBySlot.month[this.activeSlot] = sent.month;
    }

    public async preparePort(info: IApi.Response.PortInfo) {
        try {
            let sentDay = await this.simService.getNumSent(info.imsi, ETerms.DAY);
            let sentMonth = await this.simService.getNumSent(info.imsi, ETerms.MONTH);

            this.setNumSent({
                day: sentDay,
                month: sentMonth
            });

            let isRegisterOk = (info.reg === "REGISTER_OK");
            let isOverLimitDay = (this.active && (this.limitDay > 0 && sentDay >= this.limitDay));
            let isOverLimitMonth = (this.active && (this.limitMonth > 0 && sentMonth >= this.limitMonth));
            let isPortDown = (this.info !== undefined && this.info.reg !== info.reg && !isRegisterOk);
            let isPortUp = (this.info !== undefined && this.info.reg !== info.reg && isRegisterOk);

            if (isPortDown) {
                this.setStatus(false);
            } else if (isOverLimitDay || isOverLimitMonth) {

                if (isOverLimitDay)
                    this.setStatus(false, NotificationTexts.OVERLIMIT_DAY);
                if (isOverLimitMonth)
                    this.setStatus(false, NotificationTexts.OVERLIMIT_MONTH);

                this.changeSlot(this.info.port);
            } else if (!isOverLimitDay && !isOverLimitMonth && isPortUp) {
                this.setStatus(true);
                this.isSimUpdate = true;
                this.events.emit("updateMobileConfig");
            }

            let nowTime = moment().unix();
            if (this.isSimUpdate) {
                let expireDay = this.resetDayAt - nowTime;
                await this.simService.setSim(info.imsi, ETerms.DAY, expireDay);

                let expireMonth = this.resetMonthAt - nowTime;
                await this.simService.setSim(info.imsi, ETerms.MONTH, expireMonth);
                this.isSimUpdate = false;
            }

            if (nowTime >= this.resetDayAt) {
                this.resetDayAt = moment().add({ day: 1 }).unix();
                this.numSentBySlot.day = new Array(this.numSlots).fill(0);
                this.isSimUpdate = true;
            }

            if (nowTime >= this.resetMonthAt) {
                this.resetMonthAt = moment().add({ month: 1 }).unix();
                this.numSentBySlot.month = new Array(this.numSlots).fill(0);
                this.isSimUpdate = true;
            }

            this.info.imsi = info.imsi;
            this.info.reg = info.reg;
            this.info.smsc = info.smsc;

        } catch (err) {
            Logger.error("Provider.Gateway.Port.preparePort", err.stack);
        }
    }

    public async trySendMessage(parts: number): Promise<boolean> {

        let sentNumDay = await this.simService.getNumSent(this.info.imsi, ETerms.DAY);
        let sentNumMonth = await this.simService.getNumSent(this.info.imsi, ETerms.MONTH);

        let afterSentNumDay = (sentNumDay + parts);
        let afterSentNumMont = (sentNumMonth + parts);

        if (this.limitDay > 0 && afterSentNumDay > this.limitDay) return false;
        if (this.limitMonth > 0 && afterSentNumMont > this.limitMonth) return false;

        await this.simService.incrNumSent(this.info.imsi, ETerms.DAY, parts);
        await this.simService.incrNumSent(this.info.imsi, ETerms.MONTH, parts);

        return true;
    }

    private changeSlot(port: number) {
        if (this.numSlots > 1) {
            let slotIndex = this.getNextSlotIndex();
            this.events.emit("changeSlot", port, slotIndex);
        }
    }

    public setResultSentStatus(status: IApi.Response.QuerySmsResultStatus) 
    {
        if (this.lastSendStatus !== status)
            this.numFailed = 0;

        this.lastSendStatus = status;

        if (status === "FAILED")
            this.numFailed++;

        if (this.active && this.numFailed >= this.maxNumFailed)
            this.setStatus(false, NotificationTexts.OVERLIMIT_FAILED);
    }
}