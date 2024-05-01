export type TMessageStatus = "ACCEPTED" | "INQUEUE" | "SENDING" | "SENT_OK" | "DELIVERED" | "FAILED" | "DELETED";
export type TMessageTypes = "service" | "advertising";
export type TEncodingTypes = "gsm-7bit" | "unicode";

export type TMessage = {
    readonly systemId: string;
    readonly messageId: string;
    readonly clientId: number;
    readonly recipient: string;
    readonly acceptedAt: number;
    status: TMessageStatus
    text: string;
    textOrigin: string,
    textEncoding?: TEncodingTypes,
    textSizeBytes?: number,
    sentAt?: number;
    changeAt?: number;
    error?: string;
    deviceUserId?: number;
    deviceRefId?: number;
    gatewayIdSent?: string;
    gatewayNameSent?: string;
    portGatewaySent?: number;
    isResend?: boolean;
    portGatewayResend?: number;
    parts?: number;
    provider?: string;
    providerId?: string;
    def?: number;
    region?: string;
    type?: TMessageTypes;
    priority: number;
    iccid?: string;
    imsi?: string;
    isRedirected: boolean;
}