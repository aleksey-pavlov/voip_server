import { VoiceStorage } from "../../Trunk/VoicesStorage";
import { DatabaseRedis } from "../../Core/DatabaseRedis";
import { EVoiceStatus, EVoiceMessageTypes } from "../../Types/VoiceModel";
import { ObjectID } from "bson";



(async () => {
    let storage = new VoiceStorage("test", new DatabaseRedis());

    console.log(await storage.add({
        systemId: new ObjectID().toString(),
        acceptedAt: Date.now() / 1000,
        attempRetries: 0,
        clientId: 2,
        messageId: 123,
        recipient: "",
        retries: 1,
        status: EVoiceStatus.ACCEPTED,
        type: EVoiceMessageTypes.TEXT,
        retryDelay: 300,
        caller: "test",
        timeout: 30
    }));
    console.log(await storage.del('11'));
    console.log(await storage.getAll());
})();