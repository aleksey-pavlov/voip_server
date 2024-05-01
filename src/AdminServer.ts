import { Config } from "./Config/Config";
import * as express from "express";
import * as bodyParser from "body-parser";

import { UsersRouter } from "./Admin/Users/UsersRouter";
import { ClientsRouter } from "./Admin/Clients/ClientsRouter";
import { BaseRouter } from "./Admin/BaseRouter";
import { AgentRouter } from "./Admin/AgentRouter";
import { StatisticRouter } from "./Admin/Statistic/StatisticRouter";
import { Logger } from "./Core/Logger";
import { MongoClient } from "./Core/DatabaseMongo";
import { RpcSender } from "./Core/Rpc/RpcSender";
import { MqConnect } from "./Core/DatabaseRabbit";
import { FluentClientFactory } from "fluentd-client";
import { BlackListRouter } from "./Admin/Blacklist/BlackListRouter";
import { GatewaysRunningRouter } from "./Admin/Gateways/GatewaysRunningRouter";
import { Publisher } from "./Core/PubSub/Publisher";
import { TrunksRunningRouter } from "./Admin/Trunks/TrunksRunningRouter";
import { Exchanges, Queues } from "./Config/Constants";
import { TrunksProviderRouter } from "./Admin/Trunks/TrunksProviderRouter";
import { GatewaysProviderRouter } from "./Admin/Gateways/GatewaysProviderRouter";

let fluentFactory = new FluentClientFactory();
let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

(async () => {
    let app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use((req, resp, next) => {
        resp.setHeader("Access-Control-Allow-Origin", "*");
        resp.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setHeader("Access-Control-Allow-Credentials", "true");
        resp.removeHeader("X-Powered-By");
        next();
    });

    let mongoDb = await MongoClient.connect(Config.MONGO, { reconnectTries: Number.MAX_VALUE, reconnectInterval: 3000 });

    let mqConnection = await MqConnect(Config.RABBITMQ);
    let mqChannel = await mqConnection.createChannel();
    app.use("/api/", UsersRouter(mongoDb));
    app.use("/api/", ClientsRouter(mongoDb, new Publisher(Exchanges.CMD_EXCHANGE, Exchanges.CMD_EXCHANGE_TYPE, false, await mqConnection.createChannel())));
    app.use("/api/", AgentRouter((queue: string) => {
        return new RpcSender(queue, mqChannel);
    }));
    app.use("/api/", GatewaysRunningRouter((gatewayId: string) => {
        return new RpcSender(Queues.RPC_GATEWAY_COMMANDS(gatewayId), mqChannel);
    }));

    app.use("/api/", GatewaysProviderRouter(new RpcSender(Queues.RPC_PROVIDER_COMMANDS, mqChannel)))

    app.use("/api/", TrunksRunningRouter((queue: string) => {
        return new RpcSender(queue, mqChannel);
    }));

    app.use("/api/", TrunksProviderRouter(new RpcSender(Queues.RPC_TRUNK_PROVIDER_COMMANDS, mqChannel)));

    app.use("/api/", StatisticRouter(new RpcSender(Queues.RPC_STAT_COMMANDS, mqChannel)));

    app.use("/api/", BaseRouter("clients", mongoDb));
    app.use("/api/", BaseRouter("gateways", mongoDb));
    app.use("/api/", BaseRouter("trunks", mongoDb));
    app.use("/api/", BaseRouter("blacklist", mongoDb));
    app.use("/api/", BaseRouter('sip_balancer', mongoDb));
    app.use("/api/", BlackListRouter(new RpcSender(Queues.RPC_PROVIDER_COMMANDS, mqChannel)));

    app.listen(Config.ADMIN_PORT, () => {
        Logger.info("Admin.Main", "Starting on port %s", [Config.ADMIN_PORT]);
    });

})();