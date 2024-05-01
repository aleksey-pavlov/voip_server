import * as express from "express";
import * as bodyParser from "body-parser";
import { Config } from "./Config/Config";
import { DatabaseMongo, MongoClient } from "./Core/DatabaseMongo";
import { RegistryProvidersRouter } from "./RegistryProvider/RegistryProviderRouter";
import { NumberProvider } from "./RegistryProvider/NumberProvider";
import { RegistryProviderStorage } from "./RegistryProvider/RegistryProviderStorage";
import { NumberProviderRouter } from "./RegistryProvider/NumberProviderRouter";
import { FluentClientFactory } from "fluentd-client";
import { Logger } from "./Core/Logger";


let fluentFactory = new FluentClientFactory();
let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

(async () => {
    try {
        let mongoDb: DatabaseMongo = await MongoClient.connect(Config.MONGO, { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 });

        let app: express.Express = express();
        app.use(bodyParser.raw({ type: 'application/octet-stream', limit: "2048mb" }));
        app.use((req, resp, next) => {
            resp.removeHeader("X-Powered-By");
            next();
        });

        let registryProviderStorage = new RegistryProviderStorage(mongoDb);
        await registryProviderStorage.initialize();

        app.use("/", RegistryProvidersRouter(registryProviderStorage));

        let numberProvider = new NumberProvider(registryProviderStorage, ["+7"]);

        app.use("/", NumberProviderRouter(numberProvider));

        app.listen(8089, (err) => {
            Logger.info("RegistryProvider.Main", `Starting on port 8089`);
        });

    } catch (err) {
        Logger.error("RegistryProvider.Main", err.stack);
        process.exit();
    }
})();