import {
    IAsteriskManager,
    TOriginateResponse,
    TEventCdrResponse,
    TEventCdrDisposition
} from "./IAsteriskManager";
import { TVoiceMessage } from "../../Types/VoiceModel";
import { getRandomInt } from "../../Core/Utils";

export class AsteriskManagerDev implements IAsteriskManager {

    private cdr: Array<(event: TEventCdrResponse) => Promise<void>> = [];

    originateAction(voice: TVoiceMessage): Promise<TOriginateResponse> {

        let actionId = `${Date.now()}`;
        let callTime = getRandomInt(1, 3);
        let duration = getRandomInt(0, voice.actualDuration);

        setTimeout(() => {

            setTimeout(() => {
                this.cdr.forEach(async cb => await cb({
                    accountcode:`${voice.clientId}-${voice.messageId}`,
                    amaflags:"DOCUMENTATION",
                    amdstatus: "HUMAN",
                    answertime:"",
                    billableseconds: duration,
                    callerid:`"${voice.systemId}" <${voice.caller}>`,
                    calleridname:voice.systemId,
                    calleridnum: `${voice.caller}`,
                    channel:"SIP/undefined_t2-00000170",
                    destination:"",
                    destinationchannel:"",
                    destinationcontext:"public",
                    disposition: TEventCdrDisposition.ANSWERED,
                    duration: duration,
                    endtime: "2019-10-15 11:56:45",
                    event:"Cdr",
                    lastapplication:"AppDial2",
                    lastdata:"(Outgoing Line)",
                    privilege:"cdr,all",
                    source:"undefined",
                    starttime: "2019-10-15 11:56:25",
                    uniqueid: actionId,
                    userfield:"",
                    dialstart: "2019-10-15 11:56:35"
                }));
            }, duration * 1000);

        }, callTime * 1000);

        return new Promise(resolve => resolve({ actionid: actionId, message: "", response: "Success" }));
    }
    cdrEvent(cb: (event: TEventCdrResponse) => Promise<void>): void {
        this.cdr.push(cb);
    }

    events(cb: (event: any) => void): void {
    }
}