import { AsteriskManager } from "../Trunk/AsteriskManager/AsteriskManager";
import { OriginateQueryBuider } from "../Trunk/AsteriskManager/OriginateQueryBuilder";
import { cdrEventToCdrResponse } from "../Trunk/AsteriskManager/IAsteriskManager";
import { EVoiceMessageTypes, EVoiceStatus } from "../Types/VoiceModel";
import { ObjectID } from "bson";

(async () => {

    let manager = new AsteriskManager({ host: 'localhost', port: 9039, user: "user", password: "password" }, new OriginateQueryBuider());

    manager.cdrEvent(async event => {
        console.log(event);
        console.log(cdrEventToCdrResponse(event));
    });

    try {
        let response = await manager.originateAction({
            systemId: new ObjectID().toString(),
            type: EVoiceMessageTypes.VOICE_FILE,
            status: EVoiceStatus.ACCEPTED,
            acceptedAt: Date.now() / 1000,
            clientId: 2,
            messageId: 123,
            retries: 0,
            recipient: "+7XXXXXXXXXX",
            voiceFile: "ffc53324294774ca1f93a012e570bed5",
            providerId: "undefined",
            context: "ivr",
            attempRetries: 0,
            retryDelay: 300,
            caller: undefined,
            sipChannel: "undefined_t2/01+7XXXXXXXXXX",
            callback: {
                recipient: "+7XXXXXXXXXX",
                sipChannel: "undefined_t2/01+7XXXXXXXXXX"
            },
            ivr: {
                "1": { context: "dial", channels: [{ number: "+7XXXXXXXXXX", sipChannel: "undefined_t2/01+7XXXXXXXXXX" }] }
            }
        });

        console.log(response);

    } catch (e) {
        console.log(e);
    }

})();
