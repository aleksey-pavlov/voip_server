import * as request from "request";
import * as zlib from "zlib";
import { Http } from "../Core/HttpHelper";
import * as querystring from "querystring";
import { IApi, TConnectionParams } from "./IGatewayApi";

export class GatewayApi implements IApi {

    private ip: string = "127.0.0.1";
    private port: number = 8080;
    private user: string = "admin";
    private password: string = "admin";
    private auth: string = "";

    public setConnectionParams(params: TConnectionParams): void {
        this.ip = params.ip;
        this.port = params.port;
        this.user = params.user;
        this.password = params.password;
        this.auth = "Basic " + new Buffer(this.user + ":" + this.password).toString("base64");
    }

    /**
     * POST
     */
    public async send_sms(data: IApi.Data.SendSms):
        Promise<IApi.Response.SendSms> {

        let response = await this._request("send_sms", Http.Methods.POST, data);

        return {
            error_code: response.error_code || 500,
            sms_in_queue: response.sms_in_queue || 0,
            task_id: response.task_id || 0
        };
    }

    /**
     * POST
     */
    public async query_sms_result(data: IApi.Data.QuerySmsResult):
        Promise<IApi.Response.QuerySmsResult> {

        let response = await this._request("query_sms_result", Http.Methods.POST, data);

        return {
            error_code: response.error_code || 500,
            result: response.result
        };
    }

    /**
     * POST
     */
    public async query_sms_deliver_status(data: IApi.Data.QuerySmsDeliverStatus):
        Promise<IApi.Response.QuerySmsDeliverStatus> {

        let response = await this._request("query_sms_deliver_status", Http.Methods.POST, data);

        return {
            error_code: response.error_code || 500,
            result: response.result
        };
    }

    /**
     * GET
     */
    public async query_sms_in_queue():
        Promise<IApi.Response.QuerySmsInQueue> {

        let response = await this._request("query_sms_in_queue", Http.Methods.GET, {});

        return {
            error_code: response.error_code || 500,
            in_queue: response.in_queue
        };
    }

    /**
     * GET
     */
    public async query_incoming_sms(data: IApi.Data.QueryIncomingSms):
        Promise<IApi.Response.QueryIncomingSms> {

        let response = await this._request("query_incoming_sms", Http.Methods.GET, data);

        return {
            error_code: response.error_code || 500,
            read: response.read || 0,
            unread: response.unread || 0,
            sms: response.sms
        }
    }

    /**
     * POST
     */
    public async send_ussd(data: IApi.Data.SendUssd):
        Promise<IApi.Response.SendUssd> {

        let response = await this._request("send_ussd", Http.Methods.POST, data);

        return {
            error_code: response.error_code || 500,
            request_id: response.request_id,
            result: response.result
        }
    }

    /**
     * GET
     */
    public async query_ussd_reply(data: { port: Array<number> }):
        Promise<IApi.Response.QueryUssdReply> {

        let response = await this._request("query_ussd_reply", Http.Methods.GET, data);

        return {
            error_code: response.error_code || 500,
            reply: response.reply
        };
    }

    /**
     * GET
     */
    public async stop_sms(data: { task_id: number }): Promise<{ error_code: number }> {

        let response = await this._request("stop_sms", Http.Methods.GET, data);

        return { error_code: response.error_code || 500 };
    }

    /**
     * GET
     */
    public async get_port_info(data: IApi.Data.GetPortInfo):
        Promise<IApi.Response.GetPortInfo> {

        if (data.info_type === undefined)
            data.info_type = ["imei", "imsi", "iccid", "smsc", "type", "number", "reg"];

        let response = await this._request("get_port_info", Http.Methods.GET, data);

        return {
            error_code: response.error_code || 500,
            info: response.info
        };
    }

    public async update_mobile_config(configs: { [x: number]: IApi.Data.MobileConfig }):
        Promise<IApi.Response.MobileConfig> {

        let data = this.createMobileConfigData(configs);
        let response = await this._requestGui("goform/WIAPortCfgNew", "POST", data, { "Content-Type": "application/x-www-form-urlencoded" });

        return {
            error_code: response.code,
            response: response.body
        };
    }

    private createMobileConfigData(configs: { [x: number]: IApi.Data.MobileConfig }): Object {

        let data = {};

        for (let p in configs) {
            for (let k in configs[p]) {
                let key = k + p;
                let value = configs[p][k];
                data[key] = value;
            }
        }

        return data;
    }

    public async switch_sim_status(data: IApi.Data.SwitchSimStatus):
        Promise<IApi.Response.SwitchSimStatus> {

        let status: string = null;

        switch (data.action) {
            case "DISABLE": status = "D";
                break;
            case "ENABLE": status = "E";
                break;
            case "ACTIVATE": status = "H";
                break;
        }

        let query = {};

        let subText = status + data.slotIndex;
        query["SubText"] = subText;
        await this.changeActiveBoard(data.slotIndex);
        let response = await this._requestGui("goform/EiaHBSIM", "POST", query, { "Content-Type": "application/x-www-form-urlencoded" });

        return {
            error_code: response.code,
            response: response.body
        };
    }

    private async changeActiveBoard(slotIndex: number): Promise<void> {
        let currentUserBoard = Math.ceil((slotIndex) / 32);
        let query = {};
        query["SubText"] = "F" + currentUserBoard;
        await this._requestGui("goform/EiaHBSIM", "POST", query, { "Content-Type": "application/x-www-form-urlencoded" });
    }

    public async get_cdr_report(): Promise<IApi.Response.CdrReport[]> {
        let response = await this._requestGui("cdr.csv.gz", "GET", {});
        return new Promise<IApi.Response.CdrReport[]>((resolve, reject) => {
            zlib.unzip(response.body, (error: Error, result: Buffer) => {
                if (error) { reject(error); }
                let csv: string = result.toString('utf-8');
                resolve(this.cdrCsvToJson(csv));
            });
        });
    }

    private cdrCsvToJson(csv: string): IApi.Response.CdrReport[] {
        let report: IApi.Response.CdrReport[] = [];

        let rows: string[] = csv.replace(/"/g, "").split("\r\n");
        delete rows[0];
        for (let i in rows) {

            let row: string = rows[i];
            let cols: string[] = row.split(',');
            report.push({
                port: Number(cols[0]),
                startDate: cols[1],
                answerDate: cols[2],
                callDirection: cols[3],
                source: cols[4],
                sourceIp: cols[5],
                destination: cols[6],
                hangSide: cols[7],
                status: this.cdrGetStatus(cols[8]),
                duration: Number(cols[9])
            });
        }
        return report;
    }

    private cdrGetStatus(status: string): IApi.Response.CdrReportStatus {
        switch (status) {
            case "CANCELED": return "CANCELED";
            case "BUSY": return "BUSY";
            case "NORMAL HANG UP": return "NORMAL HANG UP";
            case "NO ANSWER": return "NO ANSWER";
        }
    }

    public async query_gsm_events(data: IApi.Data.GsmEvent): Promise<IApi.Response.GsmEvent[]> {
        let response: IApi.Response.QueryGsmEvents = await this.requestGsmEvents(data);
        return response.gsm_event;
    }

    public async query_all_gsm_events(event: IApi.Data.GsmEvents): Promise<IApi.Response.GsmEvent[]> {

        let events: IApi.Response.GsmEvent[] = [];
        let response = await this.requestGsmEvents({ event: event, page: 0 });
        events = events.concat(response.gsm_event);
        for (let i = 1; i < response.total_count / 20; i++) {
            let response = await this.requestGsmEvents({ event: event, page: i });
            events = events.concat(response.gsm_event);
        }

        return events;
    }

    private async requestGsmEvents(data: IApi.Data.GsmEvent): Promise<IApi.Response.QueryGsmEvents> {
        let response = await this._requestGui("queryGsmEvent", "GET", data, { "Content-Type": "application/json" });
        return JSON.parse(response.body.toString().replace("},]", "}]"));
    }

    public async clear_gsm_events(): Promise<void> {
        await this._requestGui("goform/GSMEventClear", "GET", {});
    }

    private async _request(action: string, method: string, data: {}): Promise<any> {

        return new Promise((resolve, reject) => {

            let url = "http://" + this.ip + ":" + this.port + "/api/" + action;

            let options: request.OptionsWithUrl = {
                url: url,
                headers: { "Authorization": this.auth },
                method: method,
                json: true
            };

            if (method == Http.Methods.GET) {
                for (let i in data) {
                    if (Array.isArray(data[i]))
                        data[i] = data[i].join(",");
                }
                options.qs = data;
            } else if (method == Http.Methods.POST) {
                options.body = data;
            }

            request(options, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(body);
                }
            });
        });
    }

    private async _requestGui(action: string, method: string, data: any, inputHeaders?: Object): Promise<{ code: number, body: any }> {

        return new Promise<{ code: number, body: any }>((resolve, reject) => {

            let url = "http://" + this.ip + ":" + this.port + "/" + action;

            let headers: Object = {
                "Authorization": this.auth,
            };

            if (inputHeaders) {
                headers = Object.assign({}, headers, inputHeaders);
            }

            let options: request.OptionsWithUrl = {
                url: url,
                headers: headers,
                method: method,
                encoding: null
            }

            if (method == Http.Methods.GET) {
                options.qs = data;
            } else if (method == Http.Methods.POST) {
                options.body = querystring.stringify(data);;
            }

            request(options, (err, response, body) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        code: response.statusCode,
                        body: body
                    });
                }
            });
        });
    }
}
