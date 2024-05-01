import { TMessage } from "../../Types/MessageModel";

export class MessageValidationErrors extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class MessagesValidator {

    public validate(message: TMessage) {

        let error = "";

        if (!message.messageId) {
            error += "incorrect message_id;";
        }

        if (message.recipient.length < 1) {
            error += "incorrect recipient;";
        }

        if (message.text.length < 1) {
            error += "incorrect text length;";
        }

        if (message.textSizeBytes > 1500) {
            error += "text over limit 1500 bytes";
        }

        if (error.length > 0)
            throw new MessageValidationErrors(error);
    }
}