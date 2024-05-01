import { TVoiceMessage, EVoiceMessageTypes } from "../Types/VoiceModel";
import { ObjectID } from "bson";

export class VoiceValidationError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class VoiceValidationErorrs {

    static readonly UNDEFINED_TEXT = new VoiceValidationError("UNDEFINED_TEXT");
    static readonly INCORRECT_TEXT_LENGTH = new VoiceValidationError("INCORRECT_TEXT_LENGTH");

    static readonly UNDEFINED_VOICE_FILE_ID = new VoiceValidationError("UNDEFINED_VOICE_FILE_ID");
    static readonly INCORRECT_LENGTH_VOICE_FILE_ID = new VoiceValidationError("INCORRECT_LENGTH_VOICE_FILE_ID");
    static readonly INVALID_VOICE_FILE_ID = new VoiceValidationError("INVALID_VOICE_FILE_ID");

    static readonly UNDEFINED_SUBSCRIBER = new VoiceValidationError("UNDEFINED_SUBSCRIBER");
    static readonly INCORRECT_SUBSCRIBER_LENGTH = new VoiceValidationError("INCORRECT_SUBSCRIBER_LENGTH");

    static readonly UNDEFINED_RECIPIENT = new VoiceValidationError("UNDEFINED_RECIPIENT");
    static readonly INCORRECT_RECIPIENT_LENGTH = new VoiceValidationError("INCORRECT_RECIPIENT_LENGTH");
}

export class VoiceMessageValidator {

    public validate(voice: TVoiceMessage) {

        this.recipientVerif(voice);

        switch (voice.type) {
            case EVoiceMessageTypes.TEXT:
                this.textVerify(voice);
                break;
            case EVoiceMessageTypes.VOICE_FILE:
                this.voiceFileVerify(voice);
                break;
            case EVoiceMessageTypes.CALLBACK:
                this.callBackVerify(voice);
                break;
        }
    }

    private textVerify(voice: TVoiceMessage) {

        if (voice.text == undefined)
            throw VoiceValidationErorrs.UNDEFINED_TEXT;

        if (voice.text.length == 0)
            throw VoiceValidationErorrs.INCORRECT_TEXT_LENGTH;
    }

    private voiceFileVerify(voice: TVoiceMessage) {

        if (voice.voiceFile == undefined)
            throw VoiceValidationErorrs.UNDEFINED_VOICE_FILE_ID;

        if (voice.voiceFile.length == 0)
            throw VoiceValidationErorrs.INCORRECT_LENGTH_VOICE_FILE_ID;

        if (!ObjectID.isValid(voice.voiceFile))
            throw VoiceValidationErorrs.INVALID_VOICE_FILE_ID;
    }

    private callBackVerify(voice: TVoiceMessage) {

        if (voice.callback == undefined)
            throw VoiceValidationErorrs.UNDEFINED_SUBSCRIBER;

        if (voice.callback.recipient == undefined)
            throw VoiceValidationErorrs.UNDEFINED_SUBSCRIBER;

        if (voice.callback.recipient.length == 0)
            throw VoiceValidationErorrs.INCORRECT_SUBSCRIBER_LENGTH;
    }

    private recipientVerif(voice: TVoiceMessage) {

        if (voice.recipient == undefined)
            throw VoiceValidationErorrs.UNDEFINED_RECIPIENT;

        if (voice.recipient.length == 0)
            throw VoiceValidationErorrs.INCORRECT_RECIPIENT_LENGTH;
    }
}