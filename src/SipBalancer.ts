import * as express from "express";
import * as bodyParser from "body-parser";
import { Config } from "./Config/Config";
import { DatabaseMongo, MongoClient, ObjectRepository } from "./Core/DatabaseMongo";
import { NumberProvider } from "./RegistryProvider/NumberProvider";
import { RegistryProviderStorage } from "./RegistryProvider/RegistryProviderStorage";
import { FluentClientFactory } from "fluentd-client";
import { Logger } from "./Core/Logger";
import { SipBalancerRouter } from "./SipBalancer/SipBalancerRouter";
import { SipChannelsProvider } from "./SipBalancer/SipChannelsProvider";
import { StartupParams } from "./SipBalancer/StartupParams"
import { SipChannelsStorageDB } from "./SipBalancer/SipChannelsStorageDB";


let fluentFactory = new FluentClientFactory();
let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

(async (params: StartupParams) => {
    try {
        let mongoDb: DatabaseMongo = await MongoClient.connect(Config.MONGO, { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 });

        let app: express.Express = express();
        app.use(bodyParser.raw({ type: 'application/octet-stream', limit: "1kb" }));
        app.use((req, resp, next) => {
            resp.setHeader("Access-Control-Allow-Origin", "*");
            resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
            resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
            resp.setHeader("Access-Control-Allow-Credentials", "true");
            resp.removeHeader("X-Powered-By");
            next();
        });

        let registryProviderStorage = new RegistryProviderStorage(mongoDb);
        await registryProviderStorage.initialize();
        let numberProvider = new NumberProvider(registryProviderStorage, ["+7"]);

        let sipChannels = new SipChannelsProvider(new SipChannelsStorageDB(new ObjectRepository(mongoDb, "asset.sip_balancer")));
        await sipChannels.initialize();

        app.use("/", SipBalancerRouter(numberProvider, sipChannels));

        app.listen(params.port, (err) => {
            Logger.info("SipBalancer.Main", `Starting on port 8088`);
        });

    } catch (err) {
        Logger.error("SipBalancer.Main", err.stack);
        process.exit();
    }
})(new StartupParams());