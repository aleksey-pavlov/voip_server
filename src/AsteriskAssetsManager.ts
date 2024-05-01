import { Config } from "./Config/Config";
import { Logger } from "./Core/Logger";
import { FluentClientFactory } from "fluentd-client";
import { MqConnect } from "./Core/DatabaseRabbit";
import { RpcReciver } from "./Core/Rpc/RpcReciver";
import { RpcCommands, Queues } from "./Config/Constants";
import { readFile } from "./Core/Utils";
import { mixedFiles } from "./Core/Sox";


(async () => {
    try {
        let fluentFactory = new FluentClientFactory();
        let fluentClient = fluentFactory.createFromConnectStr(Config.FLUENTD);
        Logger.setStorage((tag, body) => { fluentClient.send(tag, body); });
        Logger.setStorage((tag, body) => { console.log("[%s] %s", body.level, body.caller, body.log); });

        let mqConnect = await MqConnect(Config.RABBITMQ);

        let reciver = new RpcReciver(Queues.RPC_ASTERISK_ASSETS_MANAGER, await mqConnect.createChannel());

        reciver.subscribe(RpcCommands.VOICE_INPUT_RECORD_FILE, async (cmd) => {
            let filename = `${cmd.clientId}-${cmd.messageId}-in.wav`;
            return await getBinaryData(filename);
        });

        reciver.subscribe(RpcCommands.VOICE_OUTPUT_RECORD_FILE, async (cmd) => {
            let filename = `${cmd.clientId}-${cmd.messageId}-out.wav`;
            return await getBinaryData(filename);
        });

        reciver.subscribe(RpcCommands.VOICE_MIXED_RECORD_FILE, async (cmd) => {

            let filename = `${cmd.clientId}-${cmd.messageId}.wav`;

            let file1 = `${Config.VOICE_RECORDS_DIR}/${cmd.clientId}-${cmd.messageId}-in.wav`;
            let file2 = `${Config.VOICE_RECORDS_DIR}/${cmd.clientId}-${cmd.messageId}-out.wav`;
            let fileout = `${Config.VOICE_RECORDS_DIR}/${filename}`;
            await mixedFiles(file1, file2, fileout);

            return await getBinaryData(filename);
        });

        async function getBinaryData(filename: string): Promise<{}> {
            let bindata = await readFile(`${Config.VOICE_RECORDS_DIR}/${filename}`);
            return { body: bindata.toString("base64"), size: bindata.length, filename: filename };
        }

        reciver.listen();

    } catch (err) {
        Logger.error("AsteriskAssetsManager", err.stack);
    }
})();