import { TOriginateQuery } from "./IAsteriskManager";
import { flatten } from "../../Core/Utils";
import { TVoiceMessage, TVoiceContexts, TVoiceIvr, TIvrChannels } from "../../Types/VoiceModel";
import { Ivr } from "../../Config/Constants";

export interface IOriginateQueryBuider {
    getQuery(voice: TVoiceMessage): TOriginateQuery;
}

export class OriginateQueryBuider implements IOriginateQueryBuider {

    public getQuery(voice: TVoiceMessage): TOriginateQuery {

        voice.context = this.getContext(voice);

        let query: TOriginateQuery = {
            async: "true",
            callerid: `${voice.systemId} <${voice.caller}>`,
            channel: `SIP/${voice.sipChannel}`,
            context: voice.context,
            exten: "s",
            priority: 1,
            account: `${voice.clientId}-${voice.messageId}`,
            variable: {
                soundfile: `${voice.voiceFile}`,
                messageid: `${voice.messageId}`,
                subscriber: voice.callback ? `SIP/${voice.callback.sipChannel}` : "",
                actualduration: `${(Number(voice.actualDuration) || 0) + (Number(voice.ivrDelay) || Ivr.DELAY)}`
            }
        };

        if (voice.ivr) {
            let copiedIvr = JSON.parse(JSON.stringify(voice.ivr));
            let ivrVariables = this.getIvrVariables(copiedIvr);
            for (let i in ivrVariables)
                query.variable[i] = ivrVariables[i];
        }

        if (voice.timeout)
            query.timeout = voice.timeout * 1000;

        return query;
    }

    private getContext(voice: TVoiceMessage): TVoiceContexts {

        if (voice.context) {
            return voice.context;
        }

        if (voice.ivr) {
            return "ivr";
        }

        if (voice.callback) {
            return "bridge";
        }

        return "default";
    }

    private getIvrVariables(ivr: TVoiceIvr): Object {
        var variables = {};

        if (!ivr) {
            return variables;
        }

        var copyIvr = Object.assign({}, ivr);

        let pairs = flatten(copyIvr, {
            channels: (channels: TIvrChannels): string => {
                let dialChannels = [];
                for (let i in channels) {
                    dialChannels.push(`SIP/${channels[i].sipChannel}`);
                }
                return dialChannels.join("&");
            }
        });

        for (let i in pairs) {
            variables[i] = pairs[i];
        }

        return variables;
    }
}