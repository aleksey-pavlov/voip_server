
import { Config } from "../../Config/Config";
import { MqConnect } from "../../Core/DatabaseRabbit";
import { Publisher } from "../../Core/PubSub/Publisher";
import { Subscriber } from "../../Core/PubSub/Subscriber";

(async () => {

    let mqConnect = await MqConnect(Config.RABBITMQ);
    let publish = new Publisher("exgeneral.test1", "topic", false, await mqConnect.createChannel());
    let subscribe = new Subscriber("exgeneral.test1", "topic", false, await mqConnect.createChannel());

    setTimeout(async () => {
        await subscribe.subscribe("test_topic1", ["service.*", "advertising.mts", "advertising.beeline"], (msg) => {
            console.log("Subcriber-2: ", msg);
            return true;
        });
    }, 5000);

    setInterval(() => {
        publish.publish("service.mts", { "test": "service" });
    }, 1000);
})();