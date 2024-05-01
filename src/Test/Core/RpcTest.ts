import { RpcReciver } from "../../Core/Rpc/RpcReciver";
import { RpcSender } from "../../Core/Rpc/RpcSender";
import { MqConnect } from "../../Core/DatabaseRabbit";
import { Config } from "../../Config/Config";

(async() => {

    let mqConnect = await MqConnect(Config.RABBITMQ);
    let mqChannel = await mqConnect.createChannel();

    let reciver = new RpcReciver("testRpc", mqChannel);
    let sender = new RpcSender("testRpc", mqChannel);
    reciver.subscribe("test", async msg => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({data: msg});
            }, 10);
        });
    });
    reciver.listen();

    setInterval(async () => {
        let reply = await sender.sendAndGetReply("test", {test: "345"});
        console.log("reply 345:", reply.data.test);
    }, 1000);


    setInterval(async () => {
        let reply = await sender.sendAndGetReply("test", {test: "123"});
        console.log("reply 123:", reply.data.test);
    }, 1000);

})();