import { TSpeechGenerateParams, TSpeechGenerateParamsV2, TVoiceContexts, TVoiceIvr } from "./VoiceModel";

export type TRecipientTimeLimits = {
    from: string, // HH:MM:SS,
    to: string // HH:MM:SS 
}

export type TRecipientText = {
    message_id: number;
    recipient: string;
    text: string;
    speechOptions: TSpeechGenerateParams;
    retries: number;
    retry_delay: number;
    ivr?: TVoiceIvr;
    ivr_delay?: number;
    priority: number;
    caller?: string;
    timeout?: number;
    context?: TVoiceContexts,
    force?: boolean,
    time_limits?: TRecipientTimeLimits
}

export type TRecipientTextV2 =
    TRecipientText &
    {
        speechOptions: TSpeechGenerateParamsV2;
    }

export type TRecipientFile = {
    message_id: number;
    recipient: string;
    file_id: string;
    retries: number;
    retry_delay: number;
    ivr?: TVoiceIvr;
    ivr_delay?: number;
    priority: number;
    caller?: string;
    timeout?: number;
    force?: boolean;
    time_limits?: TRecipientTimeLimits
}

export type TRecipientBridge = {
    message_id: number;
    recipient: string;
    subscriber: string;
    retries: number;
    retry_delay: number;
    timeout?: number;
}