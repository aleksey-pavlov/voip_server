import * as manager from "asterisk-manager";
import {
    IAsteriskManager,
    TAsteriskManagerParams,
    TOriginateResponse,
    TEventCdrResponse
} from "./IAsteriskManager";
import { TVoiceMessage } from "../../Types/VoiceModel";
import { IOriginateQueryBuider } from "./OriginateQueryBuilder";

export class AsteriskManager implements IAsteriskManager {

    private _manager;
    private originateQueryBuilder: IOriginateQueryBuider;

    constructor(params: TAsteriskManagerParams, originateQueryBuilder: IOriginateQueryBuider) {
        this._manager = new manager(params.port, params.host, params.user, params.password, true);
        this._manager.keepConnected();
        this.originateQueryBuilder = originateQueryBuilder;
    }

    originateAction(voice: TVoiceMessage): Promise<TOriginateResponse> {

        return new Promise<TOriginateResponse>((resolve, reject) => {
            let query = this.originateQueryBuilder.getQuery(voice);
            query.action = "Originate";
            this._manager.action(query, (err, res) => {
                if (err != null) {
                    return reject(err);
                }
                return resolve(res);
            });
        });
    }

    cdrEvent(cb: (event: TEventCdrResponse) => Promise<void>): void {
        this._manager.on('cdr', async (event: TEventCdrResponse) => {
            let parsedCallerId = this.callerIdParser(event.callerid);
            event.calleridname = parsedCallerId.calleridname;
            event.calleridnum = parsedCallerId.calleridnum;
            let parsedUserfield = this.userfieldParser(event.userfield);
            event.amdstatus = parsedUserfield["amdstatus"];
            event.dialstart = parsedUserfield["dialstart"];
            await cb(event);
        });
    }

    events(cb: (event: any) => void): void {
        this._manager.on("managerevent", event => cb(event));
    }

    callerIdParser(callerId: string): { calleridnum: string, calleridname: string } {

        let tapl = callerId.replace(/"|>|</g, '').split(" ");
        return {
            calleridnum: tapl[1],
            calleridname: tapl[0]
        };
    }

    userfieldParser(userfield: string): { [x: string]: string } {
        let data = {};

        let pairs = userfield.split(",");
        for (let i in pairs) {
            let pair = pairs[i].split("=");
            data[pair[0]] = pair[1];
        }

        return data;
    }
}