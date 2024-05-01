import { flatten } from "../../Core/Utils";
import { TVoiceIvr, TIvrChannels } from "../../Types/VoiceModel";

let ivr: TVoiceIvr = {
    "1": { context: "webhook", url:"http://someurl.ru" },
    "2": { context: "repeat" },
    "3": { context: "dial", "channels": [ { number: "+7XXXXXXXXXX", providerId: "beeline" }, { number: "+7XXXXXXXXXX", providerId: "beeline" } ] }
};

let vars = flatten(ivr, { channels: (channels: TIvrChannels): string => {
    let dialChannels = [];

    for (let i in channels) {
        dialChannels.push(`SIP/${channels[i].number}/${channels[i].providerId}`);
    }

    return dialChannels.join("&");
} });

console.log(vars);