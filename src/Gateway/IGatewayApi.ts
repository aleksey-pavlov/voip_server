
export type TConnectionParams = {
    ip: string,
    port: number,
    user: string,
    password: string
}

export interface IApi {

    setConnectionParams(params: TConnectionParams): void;
    send_sms(data: IApi.Data.SendSms): Promise<IApi.Response.SendSms>;
    query_sms_result(data: IApi.Data.QuerySmsResult): Promise<IApi.Response.QuerySmsResult>;
    query_sms_deliver_status(data: IApi.Data.QuerySmsDeliverStatus): Promise<IApi.Response.QuerySmsDeliverStatus>;
    query_sms_in_queue(): Promise<IApi.Response.QuerySmsInQueue>;
    query_incoming_sms(data: IApi.Data.QueryIncomingSms): Promise<IApi.Response.QueryIncomingSms>;
    send_ussd(data: IApi.Data.SendUssd): Promise<IApi.Response.SendUssd>;
    query_ussd_reply(data: { port: Array<number> }): Promise<IApi.Response.QueryUssdReply>;
    stop_sms(data: { task_id: number }): Promise<{ error_code: number }>;
    get_port_info(data: IApi.Data.GetPortInfo): Promise<IApi.Response.GetPortInfo>;
    switch_sim_status(data: IApi.Data.SwitchSimStatus): Promise<IApi.Response.SwitchSimStatus>;
    update_mobile_config(configs: { [x: number]: IApi.Data.MobileConfig }): Promise<IApi.Response.MobileConfig>
    get_cdr_report(): Promise<IApi.Response.CdrReport[]>
    query_gsm_events(data: IApi.Data.GsmEvent): Promise<IApi.Response.GsmEvent[]>
    query_all_gsm_events(event: IApi.Data.GsmEvents): Promise<IApi.Response.GsmEvent[]>
    clear_gsm_events(): Promise<void>;
}

export namespace IApi.Data {

    export type SendSms = {
        text: string,
        param: Array<{
            number: string,
            user_id: number
            text_params?: Array<string>,
        }>
        port?: Array<number>,
        encoding?: "unicode" | "gsm-7bit",
    }

    export type QuerySmsResult = {
        number?: Array<number>;
        port?: Array<number>;
        time_after?: string;
        time_before?: string;
        user_id: Array<number>;
    }

    export type QuerySmsDeliverStatus = {
        number: Array<number>;
        port: Array<number>;
        time_after: string;
        time_before: string;
    }

    export type QueryIncomingSms = {
        incoming_sms_id?: number;
        flag: "all" | "read" | "unread";
    }

    export type SendUssd = {
        port: number[];
        command: string;
        text: string;
    }

    export type GetPortInfo = {
        port?: Array<number>;
        info_type?: Array<"imei" | "imsi" | "iccid" | "smsc" | "type" | "number" | "reg">;
    }

    export type SwitchSimStatus = {
        slotIndex: number;
        action: "DISABLE" | "ENABLE" | "ACTIVATE";
    }

    export type MobileConfig = {
        CLIR: number;
        IsRevPola: number;
        IsGsmOpen: number;
        Micphone: number;
        Handset: number;
        APN: string;
        APNName: string;
        APNPSW: string;
        PortBandType: string;
        SimWorkMode: number;
        bandtypedata: number;
        SMSC: string;
    }

    export enum GsmEvents {
        CALL_OUT = 2,
        SEND_SMS = 3
    }

    export type GsmEvent = {
        event: GsmEvents;
        page: number
    }
}

export namespace IApi.Response {

    export type SendSms = {
        error_code: number;
        sms_in_queue: number;
        task_id: number;
    }

    export type QuerySmsResultStatus = "FAILED" | "SENDING" | "SENT_OK" | "DELIVERED";
    export type QuerySmsResult = {
        error_code: number;
        result: Array<{
            port: number,
            user_id: number,
            number: string,
            time: string,
            status: QuerySmsResultStatus,
            count: number,
            succ_count: number,
            ref_id: number
        }>;
    }

    export type QuerySmsDeliverStatus = {
        error_code: number;
        result: Array<{
            port: number,
            number: string,
            time: string,
            ref_id: number,
            status_code: number
        }>;
    }

    export type QuerySmsInQueue = {
        error_code: number,
        in_queue: number
    }

    export type QueryIncomingSms = {
        error_code: number;
        sms: Array<{
            incoming_sms_id: number,
            port: number,
            number: string,
            smsc: string,
            timestamp: string,
            text: string
        }>;
        read: number;
        unread: number;
    }

    export type SendUssd = {
        request_id: number;
        error_code: number;
        result: Array<{
            port: number,
            status: number
        }>;
    }

    export type QueryUssdReply = {
        error_code: number;
        reply: Array<{
            port: number,
            text: string
        }>;
    }

    export type PortInfo = {
        port: number,
        type?: string,
        imei?: string,
        imsi?: string,
        iccid?: string,
        smsc?: string,
        number?: string,
        reg?: "POWER_OFF" | "NO_SIM" | "PIN_REQUIRE" | "PUK_REQUIRE" | "UNREGISTER" | "SEARCHING_NETWORK" | "REGISTER_OK" | "UNKNOWN"
    }

    export type GetPortInfo = {
        error_code: number;
        info: Array<PortInfo>;
    }

    export type SwitchSimStatus = {
        error_code: number;
        response: any;
    }

    export type MobileConfig = {
        error_code: number;
        response: any;
    }

    export type CdrReportStatus = "NORMAL HANG UP" | "CANCELED" | "BUSY" | "NO ANSWER";

    export type CdrReport = {
        port: number,
        startDate: string,
        answerDate: string,
        callDirection: string,
        source: string,
        sourceIp: string,
        destination: string,
        hangSide: string,
        status: CdrReportStatus,
        duration: number
    }

    export type QueryGsmEvents = {
        total_count: number;
        gsm_event: GsmEvent[];
    }

    export type GsmEventCallStatus = "NORMAL HANG UP" | "CANCELED" | "BUSY" | "NO ANSWER";

    export type GsmEvent = {
        port: number;
        imsi: string;
        time: string;
        event: string;
        number: string;
        status: GsmEventCallStatus;
        duration: number;
        description: string;
    }
}
