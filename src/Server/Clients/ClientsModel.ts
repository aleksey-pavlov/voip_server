export var ClientsCollection: string = "asset.clients";

export type TSynhronizableClient = {
    sentTotal: number;
    voiceSentTotal: number;
    statDaily: ClientStatDaily;
    voiceStatDaily: ClientStatDaily;
    authAt: number;
    voiceQueue: number;
};

export type TProfile = {
    name: string;
    email:string;
    pricing: string;
    balance: number;
    authKey: string;
}

export class Client {

    public _id: string;
    public uid: number = 0;
    public name: string = "";
    public balance: number = 0;
    public pricing: string = "";
    public email: string = "";
    public password: string = "";
    public sendStatusUrl = undefined;
    public resolveTaskUrl = "http://localhost:8080/api/voice/task/resolve/test"
    public authKey: string = "";
    public sentTotal: number = 0;
    public voiceSentTotal: number = 0;
    public authAt: number = 0;
    public statDaily: ClientStatDaily;
    public voiceStatDaily: ClientStatDaily;
    public voiceBandwidthLimit: number = 0;
    public voiceQueue: number = 0;
    public voiceTrunkId: string = undefined;
    public voiceReservableTrunkId: string = undefined;

    public voiceRetryLimit: number = 3;
    public voiceRetryDelayLimit: number = 300;

    public ip: string = "";
    public active: boolean = false;
    public blocked: boolean = false;
    public dailyLimit: number = 0;
    public voiceDailyLimit: number = 0;
    public ipVerification: boolean = false;

    constructor(json: Object) {
        Object.assign(this, json);
        this.statDaily = new ClientStatDaily(json["statDaily"] || {});
        this.voiceStatDaily = new ClientStatDaily(json["voiceStatDaily"] || {});
    }

    public update(json: Object) {
        this.ip = json["ip"] || "";
        this.ipVerification = json["ipVerification"] || false;
        this.authKey = json["authKey"] || this._id;
        this.active = json["active"] || false;
        this.blocked = json["blocked"] || false;
        this.dailyLimit = Number(json["dailyLimit"]) || 0;
        this.voiceDailyLimit = Number(json["voiceDailyLimit"]) || 0;

        this.sendStatusUrl = json["sendStatusUrl"] || undefined;
        this.voiceBandwidthLimit = Number(json["voiceBandwidthLimit"]) || 0;
        this.voiceTrunkId = json["voiceTrunkId"] || undefined;
        this.voiceReservableTrunkId = json["voiceReservableTrunkId"] || undefined;
        this.voiceRetryLimit = Number(json["voiceRetryLimit"]) || this.voiceRetryLimit;
        this.voiceRetryDelayLimit = Number(json["voiceRetryDelayLimit"]) || this.voiceRetryDelayLimit;
        this.resolveTaskUrl = json['resolveTaskUrl'] || this.resolveTaskUrl;
    }

    public isOverDailyLimit(): boolean {
        let dailySent = this.statDaily.getCurrentSent();
        if (this.dailyLimit > 0 && dailySent >= this.dailyLimit) {
            return true;
        }

        return false;
    }

    public isOverVoiceDailyLimit(): boolean {
        let sent = this.voiceStatDaily.getCurrentSent();
        if (this.voiceDailyLimit > 0 && sent >= this.voiceDailyLimit) {
            return true;
        }

        return false;
    }

    public logSendMessage(): void {
        this.statDaily.sentLog();
        this.sentTotal++;
    }

    public logSendVoice(): void {
        this.voiceStatDaily.sentLog();
        this.voiceSentTotal++;
    }

    public logAuth(): void {
        this.authAt = Math.floor(Date.now() / 1000);
    }

    public isBlock(): boolean {
        return !this.active || this.blocked
    }

    public ipNotAllow(ip: string | string[]): boolean {
        return this.ipVerification && ip !== this.ip
    }

    public trimVoiceRetries(input: number): number {

        let source = Number(input);
        if (!source)
            return 0;

        if (source > this.voiceRetryLimit)
            return this.voiceRetryLimit;

        return source;
    }

    public trimVoiceRetryDelay(input: number): number {

        let source = Number(input);
        if (!source)
            return this.voiceRetryDelayLimit;

        if (source > this.voiceRetryDelayLimit)
            return this.voiceRetryDelayLimit;

        return source;
    }

    public getSynhronizableClient(): TSynhronizableClient {
        return {
            authAt: this.authAt,
            sentTotal: this.sentTotal,
            statDaily: this.statDaily,
            voiceQueue: this.voiceQueue,
            voiceStatDaily: this.voiceStatDaily,
            voiceSentTotal: this.voiceSentTotal
        };
    }

    public getProfile(): TProfile {
        return {
            authKey: this.authKey,
            balance: this.balance,
            email: this.email,
            name: this.name,
            pricing: this.pricing
        }
    }
}

export class ClientStatDaily {

    private sentMessages: number = 0;
    private resetAt: number = 0;
    private resetInterval: number = 86400;

    public constructor(source: Object) {
        this.sentMessages = source["sentMessages"] || this.sentMessages;
        this.resetAt = source["resetAt"] || Math.floor(Date.now() / 1000);
        this.resetInterval = source["resetInterval"] || this.resetInterval;

        setInterval(() => {
            this.onReset();
        }, 10 * 1000);
    }

    private onReset(): void {
        let nowTime = Math.floor(Date.now() / 1000);
        if (this.resetAt <= nowTime) {
            this.sentMessages = 0;
            this.resetAt += this.resetInterval;
        }
    }

    public sentLog(): void {
        this.sentMessages++;
    }

    public getCurrentSent(): number {
        return this.sentMessages;
    }
}