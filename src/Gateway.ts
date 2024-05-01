import { RpcSender } from "./Core/Rpc/RpcSender";
import { RpcReciver } from "./Core/Rpc/RpcReciver";
import { QueueReciver } from "./Core/Queues/QueueReciver";
import { MqConnect } from "./Core/DatabaseRabbit";
import { MongoClient } from "./Core/DatabaseMongo";
import { DatabaseRedis } from "./Core/DatabaseRedis";
import { GatewayController } from "./Gateway/GatewayController";
import { GatewaySource } from "./Gateway/GatewaySource";
import { GatewayBoxes } from "./Gateway/GatewayBoxes";
import { GatewayServices } from "./Gateway/GatewayServices";
import { GatewayApi } from "./Gateway/GatewayApi";
import { PortsStorage } from "./Gateway/Ports/PortsStorage";
import { NotificationService } from "./Services/NotificationService";
import { SimService } from "./Gateway/Sim/SimService";
import { MessagesStatus } from "./Services/MessagesStatus";
import { GatewayBox } from "./Gateway/GatewayBox";
import { Config } from "./Config/Config";
import { Logger } from "./Core/Logger";
import { getProcessArgv } from "./Core/ProcessHelper";
import { Publisher } from "./Core/PubSub/Publisher";
import { FluentClientFactory } from "fluentd-client";
import { Gateway, TGatewaySource } from "./Gateway/GatewayModel";
import { GatewayCommands } from "./Gateway/GatewayCommands";
import { GatewayCacheMessages } from "./Gateway/GatewayCacheMessages";
import { QueueSender } from "./Core/Queues/QueueSender";
import { Queues, Exchanges } from "./Config/Constants";
import { NotificationProvider } from "./Services/NotificationProvider";

let fluentFactory = new FluentClientFactory();
let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

(async () => {
    try {
        let gatewayId = getProcessArgv("gatewayId");

        let mqConnection = await MqConnect(Config.RABBITMQ);
        let mongoDb = await MongoClient.connect(Config.MONGO, { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 });
        let redisDb = new DatabaseRedis(Config.REDIS);
        let agent = new GatewayController(
            new RpcSender(Queues.RPC_PROVIDER_COMMANDS, await mqConnection.createChannel()),
            new QueueReciver(Queues.SMS(gatewayId), true, await mqConnection.createChannel()),
            new GatewaySource(mongoDb),
            async (source: TGatewaySource) => {
                return new Gateway(source, new GatewayBoxes(
                    new GatewayBox([gatewayId, "outbox"], redisDb),
                    new GatewayBox([gatewayId, "sentbox"], redisDb),
                ), new GatewayServices(
                    new SimService(redisDb),
                    new MessagesStatus(new Publisher(Exchanges.SMS_EXCHANGE, Exchanges.SMS_EXCHANGE_TYPE, true, await mqConnection.createChannel())),
                    new NotificationService(new NotificationProvider(Config.TG_API_TOKEN, Config.TG_CHAT_ID)),
                    new GatewayCacheMessages(redisDb)
                ),
                    new GatewayApi(),
                    new PortsStorage())
            }
        );

        agent.launchGatway(gatewayId);

        let commands = new GatewayCommands(
            agent,
            new RpcReciver(Queues.RPC_GATEWAY_COMMANDS(gatewayId), await mqConnection.createChannel()),
            new QueueSender(Queues.PROVIDER_MESSAGES, true, await mqConnection.createChannel())
        );
        commands.listenCommands();

        process.on("SIGINT", async () => {
            try {
                await agent.downGateway();
            } catch (err) {
                Logger.error("Gateway.SIGINT", err.stack);
            } finally {
                setTimeout(() => { process.exit(); }, 1000);
            }
        });

    } catch (err) {
        Logger.error("Gateway.main", err.stack);
        process.exit();
    }
})();