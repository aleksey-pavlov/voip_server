import { MqConnect } from "./Core/DatabaseRabbit";
import { Config } from "./Config/Config";
import { Subscriber } from "./Core/PubSub/Subscriber";
import { TVoiceMessage, EVoiceStatus } from "./Types/VoiceModel";
import { MessagesPriority } from "./Provider/Messages/MessagePriority";
import { MongoClient } from "mongodb";
import { RegistryProviderStorage } from "./RegistryProvider/RegistryProviderStorage";
import { NumberProvider, NumberValidationError } from "./RegistryProvider/NumberProvider";
import { FluentClientFactory } from "fluentd-client";
import { Logger } from "./Core/Logger";
import { VoicesStatus } from "./Services/VoicesStatus";
import { Publisher } from "./Core/PubSub/Publisher";
import { VoiceMessageValidator, VoiceValidationError } from "./TrunkProvider/VoiceMessageValidator";
import { TrunkProviderCommands } from "./TrunkProvider/TrunkProviderCommands";
import { RpcReciver } from "./Core/Rpc/RpcReciver";
import { TrunksBalancer, TTrunkBalancer } from "./TrunkProvider/TrunksBalancer";
import { QueueSender } from "./Core/Queues/QueueSender";
import { Queues, Exchanges, RoutingKeys, Ivr } from "./Config/Constants";
import { sipChannelCompiler } from "./TrunkProvider/SipChannelHelpers";
import { TrunksBalancers } from "./TrunkProvider/TrunksBalancers";
import { TrunkRegisteredStorage } from "./TrunkProvider/TrunkRegisteredStorage";
import { DatabaseRedis } from "./Core/DatabaseRedis";

(async () => {
    try {
        let fluentFactory = new FluentClientFactory();
        let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
        Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
        Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

        let mongoDb = await MongoClient.connect(Config.MONGO, { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 });
        let mqConnect = await MqConnect(Config.RABBITMQ);
        let mqChannel = await mqConnect.createChannel();
        let trunksBalancers = new TrunksBalancers(
            () => {
                return new TrunksBalancer(
                    async (trunkId: string) =>
                        new QueueSender(Queues.VOICES(trunkId), true, mqChannel));
            }
        );

        let getTrunk = (voice: TVoiceMessage): TTrunkBalancer => {

            if (voice.trunkId && voice.trunkId.length > 0 && !voice.isRedirected)
                return trunksBalancers.getTrunkById(voice.trunkId);

            return trunksBalancers.getTrunk(voice.caller, voice.providerId);
        };

        let getCallableTrunk = (voice: TVoiceMessage, providerId: string): TTrunkBalancer => {

            if (voice.reservableTrunkId && voice.reservableTrunkId.length > 0)
                return trunksBalancers.getTrunkById(voice.reservableTrunkId);

            return trunksBalancers.getTrunk(TrunksBalancers.RESERVABLE, providerId);
        };

        let voicesDirectCh = await mqConnect.createChannel();

        let providerCommands = new TrunkProviderCommands(
            new Subscriber(Exchanges.CMD_EXCHANGE, Exchanges.CMD_EXCHANGE_TYPE, false, await mqConnect.createChannel()),
            new RpcReciver(Queues.RPC_TRUNK_PROVIDER_COMMANDS, await mqConnect.createChannel()),
            trunksBalancers,
            voicesDirectCh,
            new TrunkRegisteredStorage(new DatabaseRedis(Config.REDIS)));

        await providerCommands.restoreRegisteredTrunks();
        await providerCommands.listen();

        let messagePriority = new MessagesPriority();

        let providersRegistry = new RegistryProviderStorage(mongoDb);
        await providersRegistry.initialize();
        let messagesNumberProvider = new NumberProvider(providersRegistry, ["+7"]);
        let messagesAllowAllNumberProvider = new NumberProvider(providersRegistry, []);

        let voiceStatus = new VoicesStatus(new Publisher(Exchanges.VOICE_EXCHANGE, Exchanges.VOICE_EXCHANGE_TYPE, true, await mqConnect.createChannel()));
        let voiceValidator = new VoiceMessageValidator();

        let subscriber = new Subscriber(Exchanges.VOICE_EXCHANGE, Exchanges.VOICE_EXCHANGE_TYPE, true, voicesDirectCh);
        subscriber.subscribeAsync(Queues.PROVIDER_TRUNKS, [RoutingKeys.SEND_VOICE], async (voice: TVoiceMessage) => {

            try {

                voiceValidator.validate(voice);

                let provider = null;
                if ([5,7].indexOf(voice.clientId) >= 0) {
                    provider = await messagesAllowAllNumberProvider.getProvider(voice.recipient);
                    voice.context = "dialing";
                } else {
                    provider = await messagesNumberProvider.getProvider(voice.recipient);
                }

                voice.provider = provider.provider;
                voice.providerId = provider.providerId;
                voice.def = provider.def;
                voice.region = provider.region;
                voice.regionTimeZone = provider.timeZone;

                voice.caller = voice.caller.slice(-10);

                voice.priority = messagePriority.getPriority(voice.text || voice.voiceFile);

                if (voice.callback) {
                    let provider = await messagesNumberProvider.getProvider(voice.callback.recipient);
                    voice.callback.providerId = provider.providerId;

                    let trunk = getCallableTrunk(voice, provider.providerId);
                    if (!trunk)
                        return false;

                    voice.callback.sipChannel = sipChannelCompiler({
                        provider: trunk.provider,
                        id: trunk.id,
                        recipient: voice.callback.recipient,
                        caller: voice.caller || trunk.defaultCaller
                    }, trunk.sipChannelTemplate);
                }

                if (voice.ivr) {
                    for (let i in voice.ivr) {
                        if (voice.ivr[i].context == "dial") {
                            for (let j in voice.ivr[i].channels) {
                                if (voice.ivr[i].channels[j].number) {

                                    let provider = await messagesNumberProvider.getProvider(voice.ivr[i].channels[j].number);
                                    voice.ivr[i].channels[j].providerId = provider.providerId;

                                    let trunk = getCallableTrunk(voice, provider.providerId);
                                    if (!trunk)
                                        return false;

                                    voice.ivr[i].channels[j].sipChannel = sipChannelCompiler({
                                        provider: trunk.provider,
                                        id: trunk.id,
                                        recipient: voice.ivr[i].channels[j].number,
                                        caller: voice.caller || trunk.defaultCaller
                                    }, trunk.sipChannelTemplate);
                                }
                            }
                        }

                        if (voice.ivr[i].context == "repeat") {
                            if (voice.ivr[i].limit == undefined)
                                voice.ivr[i].limit = Ivr.REPEATS;
                        }
                    }
                }

                let trunk = getTrunk(voice);
                if (!trunk)
                    return false;

                if (!voice.caller && trunk.defaultCaller)
                    voice.caller = trunk.defaultCaller;

                voice.sipChannel = sipChannelCompiler({
                    provider: trunk.provider,
                    id: trunk.id,
                    recipient: voice.recipient,
                    caller: voice.caller
                }, trunk.sipChannelTemplate);

                return trunk.sender.sendToQueue(voice);

            } catch (e) {

                if (e instanceof VoiceValidationError || e instanceof NumberValidationError) {
                    voice.status = EVoiceStatus.FAILED;
                    voice.error = e.message;
                    voiceStatus.change(voice);
                }

                Logger.error("TrunkProvider.subscribeAsync", e.stack);

                return true;
            }
        });
    } catch (err) {
        Logger.error("TrunkProvider.main", err.stack);
        process.exit();
    }
})();

