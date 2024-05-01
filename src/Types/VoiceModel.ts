export type TVoiceContexts = "default" | "ivr" | "bridge" | "test" | "dialing";
export type TVoiceIvrContexts = "webhook" | "repeat" | "dial"

export type TVoiceIvr = { [x: string]: TIvr };

export enum EVoiceStatus {
    ACCEPTED = "ACCEPTED",
    FAILED = "FAILED",
    INQUEUE = "INQUEUE",
    CANCELED = "CANCELED",
    NORMAL = "NORMAL",
    BUSY = "BUSY",
    NOANSWER = "NOANSWER",
    DELETED = "DELETED"
}

export var VoiceStatusesRetried = [EVoiceStatus.BUSY, EVoiceStatus.NOANSWER];

export enum EVoiceMessageTypes {
    TEXT = "BY_TEXT",
    TEXT_V2 = "BY_TEXT_V2",
    VOICE_FILE = "BY_CLIENT_VOICE_FILE",
    CALLBACK = "CALLBACK"
}

export type TVoiceMessage = {
    readonly systemId: string;
    readonly messageId: number;
    readonly clientId: number;
    readonly recipient: string;
    readonly type: EVoiceMessageTypes;
    status: EVoiceStatus;
    retries: number;
    attempRetries: number;
    retryDelay: number;
    timeout?: number;
    retryAt?: number;
    acceptedAt: number;
    enqueueAt?: number;
    startAt?: number;
    finishAt?: number;
    error?: string;
    text?: string;
    speechGenerateParams?: TSpeechGenerateParams;
    speechGenerateParamsV2?: TSpeechGenerateParamsV2;
    voiceFile?: string;
    duration?: number;
    actualDuration?: number;
    priority?: number;
    provider?: string;
    providerId?: string;
    def?: number;
    region?: string;
    regionTimeZone?: number;
    ivr?: TVoiceIvr;
    ivrDelay?: number,
    callback?: TVoiceCallback;
    context?: TVoiceContexts;
    sipChannel?: string;
    trunkId?: string;
    reservableTrunkId?: string;
    isRedirected?: boolean;
    caller: string;
    cdrDestination?: number;
    cdrUniqueId?: string;
    cdrAmdStatus?: string;
    dialuptime?: number;
    congestionRetry?: number;
    force?: boolean;
    synthesCharsCount?: number;
    timeLimits?: TVoiceMessageTimeLimits
}

export type TVoiceMessageTimeLimits = {
    fromHour: number;
    toHour: number;
}

export type TIvr = {
    context: TVoiceIvrContexts;
    url?: string;
    channels?: TIvrChannels;
    limit?: number
}

export type TIvrChannels = Array<{
    providerId?: string,
    number: string,
    sipChannel?: string
}>;

export type TVoiceCallback = {
    recipient: string;
    providerId?: string;
    sipChannel?: string;
}

export type TSpeechGenerateParams = {
    lang?: "ru-RU" | "en-US" | "tr-TR";
    voice?: "alyss" | "jane" | "oksana" | "omazh" | "zahar" | "ermil";
    emotion?: "good" | "evil" | "neutral";
    speed?: number;
}

export type TSpeechGenerateParamsV2 = {
    voice?: "alyona" |
    "alyona:sad" |
    "alyona:funny" |
    "alyona:flirt" |
    "dorofeev:neutral" |
    "dorofeev:drama" |
    "dorofeev:comedy" |
    "dorofeev:info" |
    "dorofeev:tragedy" |
    "maxim";
}