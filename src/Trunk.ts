import { Config } from "./Config/Config";
import { MqConnect } from "./Core/DatabaseRabbit";
import { DatabaseRedis } from "./Core/DatabaseRedis";
import { FluentClientFactory } from "fluentd-client";
import { Logger } from "./Core/Logger";
import { VoicesStatus } from "./Services/VoicesStatus";
import { VoicesQueue } from "./Trunk/VoicesQueue";
import { VoiceFileGenerator, EVoiceGeneratorTypes } from "./Trunk/VoiceFileGenerator";
import { QueueReciver } from "./Core/Queues/QueueReciver";
import { TranscoderWavToGsm, TranscoderRawToGsm } from './Core/TrasncoderFactory';
import { Publisher } from "./Core/PubSub/Publisher";
import { AsteriskManager } from "./Trunk/AsteriskManager/AsteriskManager";
import { OriginateQueryBuider } from "./Trunk/AsteriskManager/OriginateQueryBuilder";
import { YandexSpeechKit } from "./Core/YandexCloudApi/YandexSpeechKit";
import { YandexOAuth } from "./Core/YandexCloudApi/YandexOAuth";
import { TokensStorage } from "./Core/YandexCloudApi/TokensStorage";
import { YandexSpeechGenerator } from "./Trunk/SpeechGenerator/YandexSpeechGenerator";
import { B2sSpeechGenerator } from "./Trunk/SpeechGenerator/B2sSpeechGenerator";
import { ISpeechGenerator } from "./Trunk/ISpeechGenerator";
import { getProcessArgv } from "./Core/ProcessHelper";
import { TrunkSource } from "./Trunk/TrunkSource";
import { MongoClient } from "mongodb";
import { TrunkCommands } from "./Trunk/TrunkCommands";
import { RpcReciver } from "./Core/Rpc/RpcReciver";
import { Exchanges, Queues } from "./Config/Constants";
import { TrunkController } from "./Trunk/TrunkController";
import { TTrunkSource, Trunk } from "./Trunk/TrunkModel";
import { IAsteriskManager } from "./Trunk/AsteriskManager/IAsteriskManager";
import { AsteriskManagerDev } from "./Trunk/AsteriskManager/AsteriskManagerDev";
import { QueueSender } from "./Core/Queues/QueueSender";
import { VoiceStorage } from "./Trunk/VoicesStorage";
import { delayAsync } from "./Core/Utils";
import { NotificationService } from "./Services/NotificationService";
import { TinkoffSpeechGenerator } from "./Trunk/SpeechGenerator/TinkoffSpeechGenerator";
import { TinkoffSpeechKit } from "./Core/TinkoffCloudApi/TinkoffSpeechKit";
import { TinfoffAuth } from "./Core/TinkoffCloudApi/TinkoffAuth";
import { NotificationProvider } from "./Services/NotificationProvider";

(async () => {

    try {
        let fluentFactory = new FluentClientFactory();
        let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
        Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
        Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

        let trunkId = getProcessArgv("trunkId");

        let mongoDb = await MongoClient.connect(Config.MONGO, { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 });
        let mqConnect = await MqConnect(Config.RABBITMQ);

        let yandexSpeechGenerator = new YandexSpeechGenerator(
            new YandexSpeechKit(
                new YandexOAuth(Config.YANDEX_SPEECHKIT_OAUTH_TOKEN,
                    new TokensStorage(
                        new DatabaseRedis(Config.REDIS)
                    )
                ), Config.YANDEX_SPEECHKIT_FOLDERID
            ), TranscoderRawToGsm
        );

        let tinkoffSpeechGenerator = new TinkoffSpeechGenerator(
            new TinkoffSpeechKit(
                new TinfoffAuth(Config.TINKOFF_API_KEY, Config.TINKOFF_API_SECRET,
                    new TokensStorage(
                        new DatabaseRedis(Config.REDIS)
                    )
                )
            ),
            TranscoderRawToGsm
        );

        let b2sSpeechGenerator = new B2sSpeechGenerator(Config.B2S_VOICE_FILES_URL, TranscoderWavToGsm);

        let trunkController = new TrunkController(
            new TrunkSource(mongoDb),
            new Publisher(Exchanges.CMD_EXCHANGE, Exchanges.CMD_EXCHANGE_TYPE, false, await mqConnect.createChannel()),
            new QueueReciver(Queues.VOICES(trunkId), true, await mqConnect.createChannel()),
            async (source: TTrunkSource) => {
                return new Trunk(source,
                    new VoicesStatus(new Publisher(Exchanges.VOICE_EXCHANGE, Exchanges.VOICE_EXCHANGE_TYPE, true, await mqConnect.createChannel())),
                    new VoicesQueue(`trunk_queue_${trunkId}`, new DatabaseRedis(Config.REDIS)),
                    new VoiceStorage(`trunk_active_${trunkId}`, new DatabaseRedis(Config.REDIS)),
                    new VoiceStorage(`trunk_retry_${trunkId}`, new DatabaseRedis(Config.REDIS)),
                    new VoiceFileGenerator(
                        new Map<EVoiceGeneratorTypes, ISpeechGenerator>(
                            [
                                [EVoiceGeneratorTypes.TEXT, yandexSpeechGenerator],
                                [EVoiceGeneratorTypes.SOURCE, b2sSpeechGenerator],
                                [EVoiceGeneratorTypes.TEXT_V2, tinkoffSpeechGenerator]
                            ]),
                        Config.VOICE_FILES_DIR),
                    asteriskManagerBuilder({
                        devMode: source.devMode,
                        host: source.host,
                        port: source.port,
                        user: source.user,
                        pass: source.pass
                    }),
                    new NotificationService(new NotificationProvider(Config.TG_API_TOKEN, Config.TG_CHAT_ID)),
                );
            }
        );

        trunkController.launchTrank(trunkId);

        new TrunkCommands(
            new RpcReciver(Queues.RPC_TRUNK_COMMANDS(trunkId), await mqConnect.createChannel()),
            trunkController,
            new QueueSender(Queues.PROVIDER_TRUNKS, true, await mqConnect.createChannel()),
            new VoicesStatus(new Publisher(Exchanges.VOICE_EXCHANGE, Exchanges.VOICE_EXCHANGE_TYPE, true, await mqConnect.createChannel()))
        ).listenCommands();


        process.on("SIGINT", async () => {
            await trunkController.shutdownTrunk();
            Logger.info("Trunk.Main", `TrunkId=${trunkId} graceful shutdown`);
            await delayAsync(2);
            process.exit();

        });
    } catch (err) {
        Logger.error("Trunk.Main", err.stack);
        process.exit();
    }
})();

function asteriskManagerBuilder(params: {
    host: string,
    port: number,
    user: string,
    pass: string,
    devMode: boolean
}): IAsteriskManager {

    if (params.devMode) {
        Logger.warn("Trink.Main.asteriskManagerBuilder", `Create development AMI`);
        return new AsteriskManagerDev();
    }

    return new AsteriskManager(
        {
            host: params.host,
            port: params.port,
            user: params.user,
            password: params.pass
        }, new OriginateQueryBuider());
}