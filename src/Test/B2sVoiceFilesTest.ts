import { Config } from "../Config/Config";
import { TranscoderWavToGsm } from "../Core/TrasncoderFactory";
import { B2sSpeechGenerator } from "../Trunk/SpeechGenerator/B2sSpeechGenerator";
import { EVoiceStatus, EVoiceMessageTypes } from "../Types/VoiceModel";
import { ObjectID } from "bson";

(async () => {
    let speechkit = new B2sSpeechGenerator(Config.B2S_VOICE_FILES_URL, TranscoderWavToGsm);

    try {
        await speechkit.generate({
            systemId: new ObjectID().toString(),
            type: EVoiceMessageTypes.VOICE_FILE,
            status: EVoiceStatus.ACCEPTED,
            acceptedAt: Date.now() / 1000,
            clientId: 2,
            messageId: 123,
            retries: 0,
            recipient: "+7XXXXXXXXXX",
            voiceFile: "5cda67d46f95e2001d5ff3be",
            providerId: "megafon",
            attempRetries: 0,
            retryDelay: 300,
            caller: "+7XXXXXXXXXX"
        }, "/var/tmp/5cda67d46f95e2001d5ff3be.gsm");
    } catch (err) {
        console.log(err);
    }



})();

