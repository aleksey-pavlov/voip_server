import { Publisher } from "../Core/PubSub/Publisher";
import { Logger } from "../Core/Logger";
import { TVoiceMessage } from "../Types/VoiceModel";
import { RoutingKeys } from "../Config/Constants";

export interface IVoicesStatus {
    change(voice: TVoiceMessage): void;
}

export class VoicesStatus implements IVoicesStatus {

    private publisher: Publisher;

    public constructor(publisher: Publisher) {
        this.publisher = publisher;
    }

    public change(voice: TVoiceMessage): void {
        try {
            this.publisher.publish(RoutingKeys.CHANGE_VOICE_STATUS, voice);
        } catch (err) {
            Logger.error("Common.VoicesStatus", err.stack);
        }
    }
}