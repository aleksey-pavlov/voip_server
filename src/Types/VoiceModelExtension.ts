import { getHour } from "../Utils/DateTimeExtension";
import { TRecipientTimeLimits } from "./ClientVoiceTypes";
import { TVoiceMessageTimeLimits } from "./VoiceModel";
export { TRecipientTimeLimits } from "./ClientVoiceTypes";

export function recipientTimeLimitsToVoiceTimeLimits(limits: TRecipientTimeLimits): TVoiceMessageTimeLimits | undefined {


    if (!limits)
        return undefined;


    return {
        fromHour: getHour(limits.from, "HH:mm:ss"),
        toHour: getHour(limits.to, "HH:mm:ss")
    }
    
}