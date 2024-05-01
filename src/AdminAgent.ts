import { Pm2, StartupOptions } from "./Core/Pm2";
import { RpcReciver } from "./Core/Rpc/RpcReciver";
import { MqConnect } from "./Core/DatabaseRabbit";
import { Config } from "./Config/Config"
import { Logger } from "./Core/Logger";
import { Environments } from "./Config/Environments";
import { RpcCommands } from "./Config/Constants";

(async (location: string) => {

    Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

    let mqConnect = await MqConnect(Config.RABBITMQ);
    let mqChannel = await mqConnect.createChannel();

    let pm2 = new Pm2();
    let reciver = new RpcReciver(location, mqChannel);

    reciver.subscribe(RpcCommands.GATEWAY_UP, async msg => {

        let gatewayId: string = msg["gatewayId"];
        let startParams: StartupOptions = {
            name: gatewayId,
            script: "./build/Gateway.js",
            args: ["--gatewayId", gatewayId],
            max_restarts: 7
        };

        if (process.env.SERVER_ENV === Environments[Environments.development]) {
            startParams.interpreterArgs = ["--inspect=0.0.0.0:9227"];
        }

        await pm2.start(startParams);
        let description = await pm2.describe(gatewayId);
        return description;
    });

    reciver.subscribe(RpcCommands.GATEWAY_DOWN, async msg => {
        let gatewayId = msg["gatewayId"];
        await pm2.stop(gatewayId);
        let description = await pm2.describe(gatewayId);
        return description;
    });

    reciver.subscribe(RpcCommands.PROCESS_INFO, async msg => {
        try {
            let gatewayId = msg["gatewayId"];
            let description = await pm2.describe(gatewayId);
            return description;
        } catch (err) {
            return {};
        }
    });

    reciver.subscribe(RpcCommands.TRUNK_UP, async msg => {

        let trunkId = String(msg["trunkId"]);
        let debugMode = msg["debugMode"] === 'true';
        let startParams: StartupOptions = {
            name: trunkId,
            script: "./build/Trunk.js",
            args: ["--trunkId", trunkId],
            max_restarts: 7,
            kill_timeout: 120 * 1000
        };

        if (debugMode) {
            Logger.info("AdminAgent.trunkup", `TrunkId=${trunkId} run in debug mode`);
            startParams.interpreterArgs = ["--inspect=0.0.0.0:9229"];
        }

        await pm2.start(startParams);
        let description = await pm2.describe(trunkId);
        return description;
    });

    reciver.subscribe(RpcCommands.TRUNK_DOWN, async msg => {
        let trunkId = msg["trunkId"];
        pm2.stop(trunkId);
        let description = await pm2.describe(trunkId);
        return description;
    });

    reciver.subscribe(RpcCommands.TRUNK_PROCESS_INFO, async msg => {
        try {
            let trunkId = msg["trunkId"];
            let description = await pm2.describe(trunkId);
            return description;
        } catch (err) {
            return {};
        }
    });

    reciver.listen();
})(process.env.LOCATION || "default");