import { VoiceValidationErorrs, VoiceMessageValidator } from "../../TrunkProvider/VoiceMessageValidator";
import { TVoiceMessage, EVoiceMessageTypes, EVoiceStatus } from "../../Types/VoiceModel";
import { expect } from "chai";
import { ObjectID } from "bson";


let validator = new VoiceMessageValidator();

describe("Voice message validation", () => {

    it("Verify text length", () => {

        try {

            let voice: TVoiceMessage = {
                systemId: new ObjectID().toString(),
                acceptedAt: Date.now(),
                attempRetries: 0,
                clientId: 1,
                messageId: 1,
                retries: 2,
                retryDelay: 0,
                recipient: "+7XXXXXXXXXX",
                type: EVoiceMessageTypes.TEXT,
                text: '',
                status: EVoiceStatus.ACCEPTED,
                caller: "test"
            };

            validator.validate(voice);
        } catch (e) {
            expect(VoiceValidationErorrs.INCORRECT_TEXT_LENGTH).equal(e);
        }
    });

    it("Verify text undefined", () => {
        try {
            let voice: TVoiceMessage = {
                systemId: new ObjectID().toString(),
                acceptedAt: Date.now(),
                attempRetries: 0,
                clientId: 1,
                messageId: 1,
                retries: 2,
                retryDelay: 0,
                recipient: "+7XXXXXXXXXX",
                type: EVoiceMessageTypes.TEXT,
                //text: '',
                status: EVoiceStatus.ACCEPTED,
                caller: "test"
            };

            validator.validate(voice);
        } catch (e) {
            expect(VoiceValidationErorrs.UNDEFINED_TEXT).equal(e);
        }
    });


    it("Verify recipient length", () => {
        try {
            let voice: TVoiceMessage = {
                systemId: new ObjectID().toString(),
                acceptedAt: Date.now(),
                attempRetries: 0,
                clientId: 1,
                messageId: 1,
                retries: 2,
                retryDelay: 0,
                recipient: "",
                type: EVoiceMessageTypes.TEXT,
                text: 'text',
                status: EVoiceStatus.ACCEPTED,
                caller: "test"
            };

            validator.validate(voice);
        } catch (e) {
            expect(VoiceValidationErorrs.INCORRECT_RECIPIENT_LENGTH).equal(e);
        }
    });

    it("Verify voice file undefined", () => {
        try {
            let voice: TVoiceMessage = {
                systemId: new ObjectID().toString(),
                acceptedAt: Date.now(),
                attempRetries: 0,
                clientId: 1,
                messageId: 1,
                retries: 2,
                retryDelay: 0,
                recipient: "+7XXXXXXXXXX",
                type: EVoiceMessageTypes.VOICE_FILE,
                //voiceFile: '',
                status: EVoiceStatus.ACCEPTED,
                caller: "test"
            };
            validator.validate(voice);
        } catch (e) {
            expect(VoiceValidationErorrs.UNDEFINED_VOICE_FILE_ID).equal(e);
        }
    });

    it("Verify voice file length", () => {
        try {
            let voice: TVoiceMessage = {
                systemId: new ObjectID().toString(),
                acceptedAt: Date.now(),
                attempRetries: 0,
                clientId: 1,
                messageId: 1,
                retries: 2,
                retryDelay: 0,
                recipient: "+7XXXXXXXXXX",
                type: EVoiceMessageTypes.VOICE_FILE,
                voiceFile: '',
                status: EVoiceStatus.ACCEPTED,
                caller: "test"
            };
            validator.validate(voice);
        } catch (e) {
            expect(VoiceValidationErorrs.INCORRECT_LENGTH_VOICE_FILE_ID).equal(e);
        }
    });
});