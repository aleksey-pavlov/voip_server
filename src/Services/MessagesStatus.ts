import { Publisher } from "../Core/PubSub/Publisher";
import { Logger } from "../Core/Logger";
import { TMessage } from "../Types/MessageModel";
import { RoutingKeys } from "../Config/Constants";

export class MessagesStatus {

    private publisher: Publisher;

    public constructor(publisher: Publisher) {
        this.publisher = publisher;
    }

    public change(message: TMessage): void {
        try {
            this.publisher.publish(RoutingKeys.CHANGE_SMS_STATUS, message);
        } catch (err) {
            Logger.error("Common.MessagesStatus", err.stack);
        }
    }
}