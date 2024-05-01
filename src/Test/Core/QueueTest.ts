import { MqConnect } from "../../Core/DatabaseRabbit";
import { QueueSender } from "../../Core/Queues/QueueSender";
import { QueueReciver } from "../../Core/Queues/QueueReciver";
import { setInterval } from "timers";
import { Config } from "../../Config/Config";

(async () => {

    let mqConnect = await MqConnect(Config.RABBITMQ);
    let mqChannel = await mqConnect.createChannel();
    let sender = new QueueSender("test_queue1", false, mqChannel);
    let reciver = new QueueReciver("test_queue1", false, mqChannel);

    await reciver.consume(async (msg) => {
        console.log(msg);
        return true;
    });

    setInterval(() => {
        mqChannel.recover();
    }, 1000);


    sender.sendToQueue({ "test": Date.now() });
    setInterval(() => {
         
     }, 1000);

}) ();