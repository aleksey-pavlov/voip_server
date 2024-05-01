import { MongoClient } from "./Core/DatabaseMongo";
import { MqConnect } from "./Core/DatabaseRabbit";
import { QueueSender } from "./Core/Queues/QueueSender";
import { Publisher } from "./Core/PubSub/Publisher";
import { Subscriber } from "./Core/PubSub/Subscriber";
import { RpcReciver } from "./Core/Rpc/RpcReciver";
import { MessageText } from "./Provider/Messages/MessagesText";
import { MessagesStatus } from "./Services/MessagesStatus";
import { MessagesValidator, MessageValidationErrors } from "./Provider/Messages/MessagesValidator";
import { NumberProvider, NumberValidationError } from "./RegistryProvider/NumberProvider";
import { MessagesType } from "./Provider/Messages/MessagesType";
import { RegistryProviderStorage } from "./RegistryProvider/RegistryProviderStorage";
import { GatewaysController } from "./Provider/GatewaysController";
import { ProviderCommands } from "./Provider/ProviderCommands";
import { Logger } from "./Core/Logger";
import { Config } from "./Config/Config";
import { FluentClientFactory } from "fluentd-client";
import { MessagesPriority } from "./Provider/Messages/MessagePriority";
import { BlackList } from "./Provider/BlackList";
import { GatewaysStorageFactory } from "./Provider/GatewaysStorageFactory";
import { MessageContentBlender } from "./Provider/Messages/MessageContentBlender";
import { MessageWordsBlender } from "./Provider/Messages/MessageWordsBlender";
import { TMessage } from "./Types/MessageModel";
import { Queues, Exchanges, RoutingKeys } from "./Config/Constants";

let fluentFactory = new FluentClientFactory();
let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

(async () => {
    try {
        // Binding queue on exchange general
        let mqConnect = await MqConnect(Config.RABBITMQ);
        let mongoDb = await MongoClient.connect(Config.MONGO, { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 });
        let subscribeCh = await mqConnect.createChannel();
        let mqChannel = await mqConnect.createChannel();
        let gatewayController = new GatewaysController(
            new GatewaysStorageFactory(async (gatewayId: string) => {
                return new QueueSender(Queues.SMS(gatewayId), true, mqChannel);
            })
        );

        let messagesStatus = new MessagesStatus(new Publisher(Exchanges.SMS_EXCHANGE, Exchanges.SMS_EXCHANGE_TYPE, true, await mqConnect.createChannel()));
        let messagesValidator = new MessagesValidator();

        let providersRegistry = new RegistryProviderStorage(mongoDb);
        await providersRegistry.initialize();
        let messagesNumberProvider = new NumberProvider(providersRegistry, ["+7"]);

        let messagesType = new MessagesType();
        let messagePriority = new MessagesPriority();
        let messageContentBlender = new MessageContentBlender();
        let messageWordsBlender = new MessageWordsBlender();

        let blackList = new BlackList(mongoDb);
        await blackList.initialize();

        new ProviderCommands(
            gatewayController,
            new RpcReciver(Queues.RPC_PROVIDER_COMMANDS, await mqConnect.createChannel()),
            subscribeCh,
            blackList
        ).listen();

        let subscriber = new Subscriber(Exchanges.SMS_EXCHANGE, Exchanges.SMS_EXCHANGE_TYPE, true, subscribeCh);
        subscriber.subscribeAsync(Queues.PROVIDER_MESSAGES, [RoutingKeys.SEND_SMS], async (message: TMessage) => {

            try {
                messagesValidator.validate(message);

                let isBlocked = blackList.isBlocked(message.recipient);
                if (isBlocked) {
                    message.status = "DELETED";
                    messagesStatus.change(message);
                    return true;
                }

                let numberProvider = await messagesNumberProvider.getProvider(message.recipient);
                message.provider = numberProvider.provider;
                message.providerId = numberProvider.providerId;
                message.def = numberProvider.def;
                message.region = numberProvider.region;

                message.type = messagesType.getType(message.textOrigin);

                if (message.priority === undefined) {
                    message.priority = messagePriority.getPriority(message.textOrigin);
                }

                let text = new MessageText(message.text);

                if (process.env.MESSAGE_TEXT_BLENDER) {

                    let initParts: number = text.parts;
                    text = new MessageText(messageWordsBlender.blend(text));
                    if (text.parts !== initParts) {
                        Logger.warn("Provider.MessageWordsBlender", `Different number of parts after blend: ${initParts} and ${text.parts}`);
                    }

                    text = new MessageText(messageContentBlender.blend(text));
                    if (text.parts !== initParts) {
                        Logger.warn("Provider.MessageContentBlender", `Different number of parts after blend: ${initParts} and ${text.parts}`);
                    }
                }

                message.text = text.content;
                message.textEncoding = text.encoding;
                message.textSizeBytes = text.bytes;
                message.parts = text.parts;

                return gatewayController.messageToGateway(message);

            } catch (e) {

                if (e instanceof MessageValidationErrors || e instanceof NumberValidationError) {
                    message.status = "FAILED";
                    message.error = e.message;
                    messagesStatus.change(message)
                    return true;
                }
               
                Logger.error("Provider.main", e.stack);
            }
        });

    } catch (err) {
        Logger.error("Provider.main", err.stack);
        process.exit();
    }
})();