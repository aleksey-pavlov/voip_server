import { GatewayBox } from "../Gateway/GatewayBox";
import { TMessage } from "../Types/MessageModel";
import { DatabaseRedis } from "../Core/DatabaseRedis";
import { Config } from "../Config/Config";
import { getProcessArgv } from "../Core/ProcessHelper";

(async () => {
    try {

        let gatewayId = getProcessArgv("gatewayId");

        let outbox = new GatewayBox([gatewayId, "outbox"], new DatabaseRedis(Config.REDIS));

        let messages: TMessage[] = null;
        let filteredMessages: { [x: string]: TMessage } = {};

        while (messages = await outbox.get(1000)) {

            for (let i in messages) {
                let uniqId = `${messages[i].clientId}_${messages[i].messageId}`;
                filteredMessages[uniqId] = messages[i];
            }

            if (messages.length === 0) {
                break;
            }
        }

        for (let i in filteredMessages)
            await outbox.add(filteredMessages[i]);

        console.log("Completed!");

    } catch (err) {
        console.error(err);
    }
})();