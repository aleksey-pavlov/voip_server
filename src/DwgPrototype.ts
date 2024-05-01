import * as express from "express";
import * as bodyParser from "body-parser";
import * as request from 'request';
import { ErrorCode } from "./Gateway/Api/ErrorCode";
import { IApi } from "./Gateway/IGatewayApi";

type SmsResultEvent = {
    sn: string;
    sms_result: Smsresult[];
};

type Smsresult = {
    port: number;
    user_id: number;
    number: string;
    time: string;
    status: "SENDING" | "SENT_OK" | "DELIVERED" | "FAILED";
    count: number;
    succ_count: number;
    ref_id: number;
};

type Message = {
    text: string,
    number: string,
    port: number,
    user_id: number,
    status: "FAILED" | "SENDING" | "SENT_OK" | "DELIVERED",
    time?: string
};

function makePushEvent(message: Message): SmsResultEvent {
    return {
        sms_result: [{
            count: 0,
            number: message.number,
            port: message.port,
            ref_id: 0,
            status: message.status,
            succ_count: 0,
            time: new Date().toLocaleString(),
            user_id: message.user_id
        }],
        sn: "sm"
    };
}

async function pushEvent(data: SmsResultEvent, url: string) {

    let options: request.OptionsWithUrl = {
        url: url,
        method: "POST",
        json: true,
        body: data
    };

    return new Promise((resolve, reject) => {
        request(url, options, (err, response, body) => {
            if (err) reject(err);
            resolve(body);
        });
    });
}

let app = express();
app.use(bodyParser.json({ limit: "32mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

let numPorts = process.argv[2] || 8;
let portListen = process.argv[3] || 8082;
let pushEventUrl = process.argv[4] || undefined;

let outbox: Message[] = [];

let task_id = 1;
let queue = 0;
setInterval(async () => {

    for (let i in outbox) {

        if (outbox[i].status == "SENT_OK") {
            let random = Math.floor(Math.random() * 100);
            if (random >= 30) {
                outbox[i].status = "DELIVERED";
            } else {
                outbox[i].status = "FAILED";
            }
            if (pushEventUrl!==undefined) await pushEvent(makePushEvent(outbox[i]), pushEventUrl);
            //delete outbox[i];
        }

        if (outbox[i].status == "SENDING") {
            outbox[i].status = "SENT_OK";
            outbox[i].time = new Date().toLocaleString();
            queue--;
            if (pushEventUrl!==undefined) await pushEvent(makePushEvent(outbox[i]), pushEventUrl);
        }
    }

}, 3000);

let portIndex = 0;

app.post("/api/send_sms", (req, resp) => {

    let data: IApi.Data.SendSms = req.body;

    let text = data.text;

    if (data.param.length > 128 || queue > 128) {
        return resp.json({ error_code: ErrorCode.BodyOverSize, sms_in_queue: 0 });
    }

    for (let i in data.param) {

        let port = data.port[portIndex];

        if (port === undefined) {
            portIndex = 0;
            port = data.port[portIndex];
        }
        portIndex++;

        outbox.push({
            text: text,
            number: data.param[i].number,
            port: port,
            user_id: data.param[i].user_id,
            status: "SENDING"
        });

        queue++;

        let row = [text, data.param[i].number, data.param[i].user_id, data.port, port];
        console.log(row.join(";"));
    }

    resp.json({
        error_code: ErrorCode.Accepted,
        in_queue: queue,
        task_id: task_id++
    });
});

app.post("/api/query_sms_result", (req, resp) => {

    let data: IApi.Data.QuerySmsResult = req.body;

    let response: IApi.Response.QuerySmsResult = { error_code: ErrorCode.Success, result: [] };

    if (data.user_id && data.user_id.length > 32) {
        return resp.json({ error_code: 413, sms_in_queue: 0 });
    }

    for (let i in outbox) {
        if (data.user_id && data.user_id.indexOf(outbox[i].user_id) < 0)
            continue;

        response.result.push({
            count: 1,
            number: outbox[i].number,
            port: outbox[i].port,
            ref_id: 1,
            status: outbox[i].status,
            succ_count: 1,
            time: outbox[i].time,
            user_id: outbox[i].user_id
        });

    }

    resp.json(response);

});

let portInfo: IApi.Response.GetPortInfo = { error_code: ErrorCode.Success, info: [] };

for (let i = 0; i < numPorts; i++) {
    portInfo.info.push({
        "port": i,
        "reg": "REGISTER_OK",
        "imsi": "" + portListen + numPorts + (i + 1),
        "iccid": "iccid_" + numPorts,
        "smsc": "+7XXXXXXXXXX"
    });
}

app.get("/api/get_port_info", (req, resp) => {
    resp.json(portInfo);
});

app.get("/api/query_sms_in_queue", (req, resp) => {

    let response: IApi.Response.QuerySmsInQueue = {
        error_code: ErrorCode.Success,
        in_queue: queue
    };

    resp.json(response);
});

app.get("/api/change_imsi", (req, resp) => {
    let portNum = req.query.port_num;
    let imsi = req.query.imsi || "" + Date.now();
    portInfo.info[portNum].imsi = imsi;
    resp.json({ status: 0 });
});

app.post("/goform/EiaHBSIM", (req, resp) => {
    resp.json({ status: 0 });
});

app.post("/goform/WIAPortCfgNew", (req, resp) => {
    console.log(req.body);
    resp.json({ status: 0 });
});

app.listen(portListen, () => {
    console.log("Start dwg prototype api on port %s...", portListen);
});