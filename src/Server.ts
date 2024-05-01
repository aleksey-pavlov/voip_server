import { Config } from "./Config/Config";
import * as express from "express";
import * as bodyParser from "body-parser";

import { ClientService } from "./Server/Clients/ClientsService";
import { ClientsSmsRouter } from "./Server/Clients/ClientsSmsRouter";
import { RpcSender } from "./Core/Rpc/RpcSender";
import { MqConnect, MqConnection } from "./Core/DatabaseRabbit";
import { MongoClient, DatabaseMongo, ObjectID, ObjectRepository } from "./Core/DatabaseMongo";
import { Publisher } from "./Core/PubSub/Publisher";
import { Logger } from "./Core/Logger";
import { FluentClientFactory } from "fluentd-client";
import { ClientsVoiceRouter } from "./Server/Clients/ClientsVoiceRouter";
import { ClientVoiceFiles } from "./Server/Clients/ClientVoiceFiles";
import { Subscriber } from "./Core/PubSub/Subscriber";
import { YandexSpeechKit } from "./Core/YandexCloudApi/YandexSpeechKit";
import { YandexOAuth } from "./Core/YandexCloudApi/YandexOAuth";
import { TokensStorage } from "./Core/YandexCloudApi/TokensStorage";
import { DatabaseRedis } from "./Core/DatabaseRedis";
import { RpcCommands, Exchanges, Queues } from "./Config/Constants";
import { VoiceChannelState } from "./Server/Clients/VoiceChannelState";
import { AuthRouter } from "./Server/Auth/AuthRouter";
import { PhonebookRouter } from "./Server/Phonebook/PhonebookRouter";
import { LoggerMiddleware } from "./Core/Express/LoggerMiddleware";
import { TinkoffSpeechKit } from "./Core/TinkoffCloudApi/TinkoffSpeechKit";
import { TinfoffAuth } from "./Core/TinkoffCloudApi/TinkoffAuth";
import { ClientsTasksRouter } from "./Server/Clients/ClientsTasksRouter";
import { ClientTaskPersistence, ClientsTasksStorage } from "./Server/Clients/ClientsTasksStorage";
import { ClientsTasksResolver } from "./Server/Clients/ClientsTasksResolver";
import { ClientsTasks } from "./Server/Clients/ClientsTasks";
import { HttpClient } from "./Core/HttpClient";
import { TrunksRouter } from "./Server/Trunks/TrunksRouter";
import { TrunkSource } from "./Trunk/TrunkSource";

let fluentFactory = new FluentClientFactory();
let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

(async () => {
    try {
        let mongoDb: DatabaseMongo = await MongoClient.connect(Config.MONGO, { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 });

        let app: express.Express = express();


        app.use(bodyParser.json({ limit: "1mb" }), (err, req, resp, next) => {
            if (err) {
                Logger.error("Server.Main", "Body parser error\n %s", [err.stack]);
                resp.status(err.statusCode).json({ "message": err.message });
            } else {
                next();
            }
        });
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.raw({ type: 'application/octet-stream', limit: "500mb" }));
        app.use((req, resp, next) => {
            resp.setHeader("Access-Control-Allow-Origin", "*");
            resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
            resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
            resp.setHeader("Access-Control-Allow-Credentials", "true");
            resp.removeHeader("X-Powered-By");
            next();
        });

        app.use(LoggerMiddleware(data => fluentClient.send('request', data)));

        let mqConnection: MqConnection = await MqConnect(Config.RABBITMQ);

        let clientService: ClientService = new ClientService(mongoDb);

        let commandsSubscriber = new Subscriber(Exchanges.CMD_EXCHANGE, Exchanges.CMD_EXCHANGE_TYPE, false, await mqConnection.createChannel());
        commandsSubscriber.subscribeAsync(new ObjectID().toString(), [RpcCommands.SYNC], async () => {
            await clientService.loadClients();
            return true;
        });

        await clientService.loadClients();
        setInterval(() => {
            clientService.syncClients();
        }, 15 * 1000);


        app.use("/api/", ClientsSmsRouter(clientService,
            new Publisher(Exchanges.SMS_EXCHANGE, Exchanges.SMS_EXCHANGE_TYPE, true, await mqConnection.createChannel()),
            new RpcSender(Queues.RPC_STATUS_MESSAGES, await mqConnection.createChannel()))
        );

        app.use("/api/", ClientsVoiceRouter(clientService,
            new Publisher(Exchanges.VOICE_EXCHANGE, Exchanges.VOICE_EXCHANGE_TYPE, true, await mqConnection.createChannel()),
            new VoiceChannelState(
                new RpcSender(Queues.RPC_STAT_COMMANDS, await mqConnection.createChannel())
            ),
            new RpcSender(Queues.RPC_STATUS_VOICE, await mqConnection.createChannel()),
            new RpcSender(Queues.RPC_ASTERISK_ASSETS_MANAGER, await mqConnection.createChannel()),
            new ClientVoiceFiles(mongoDb), new YandexSpeechKit(
                new YandexOAuth(Config.YANDEX_SPEECHKIT_OAUTH_TOKEN,
                    new TokensStorage(
                        new DatabaseRedis(Config.REDIS)
                    )
                ), Config.YANDEX_SPEECHKIT_FOLDERID
            ),
            new TinkoffSpeechKit(
                new TinfoffAuth(Config.TINKOFF_API_KEY, Config.TINKOFF_API_SECRET,
                    new TokensStorage(
                        new DatabaseRedis(Config.REDIS)
                    ))
            )));

        app.use("/api/", AuthRouter(clientService));
        app.use("/api/", PhonebookRouter());


        let clientTaskStorage = new ClientsTasksStorage(
            new ObjectRepository(mongoDb, 'asset.callgate_tasks'),
            async (task: ClientTaskPersistence) => {
                Logger.info("ClientTasksStorage.expired", `Expired TaskId=${task._id.toString()} From=${task.from} To=${task.to} ClientId=${task.clientId}`);
            });

        setInterval(async () => await clientTaskStorage.clearExpired(), 30 * 1000);

        app.use("/api/", ClientsTasksRouter(clientService,
            new ClientsTasks(clientTaskStorage, new ClientsTasksResolver(clientService, new HttpClient()))
        ));

        app.use("/api/", TrunksRouter(clientService, new TrunkSource(mongoDb)));

        app.listen(Config.SERVER_PORT, (err) => {
            Logger.info("Server.Main", "Starting on port %s", [Config.SERVER_PORT]);
        });

        process.on("SIGINT", async () => {
            try {
                await clientService.syncClients();
            } catch (err) {
                Logger.error("Server.SIGINT", err.stack);
            } finally {
                setTimeout(() => { process.exit(); }, 1000);
            }
        });

    } catch (err) {
        Logger.error("Server.Main", err.stack);
        process.exit();
    }
})();