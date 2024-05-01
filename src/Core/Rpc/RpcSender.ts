import { MqChannel, MqReplies } from "../DatabaseRabbit";
import { Logger } from "../Logger";
import { RpcMsg } from "./RpcMsg";

export type TRpcSenderParams = {
    channel: MqChannel,
    queue: MqReplies.AssertQueue,
    correlationId: string,
    timeout: number
};

export interface IRpcSender {
    sendAndGetReply(cmd: string, body: Object, responseTimeout?: number): Promise<any>;
}

export class RpcSender implements IRpcSender {

    private queue: string;
    private channel: MqChannel;

    constructor(queue: string, mqChannel: MqChannel) {
        this.queue = queue;
        this.channel = mqChannel;
    }

    public async sendAndGetReply(cmd: string, body: Object, responseTimeout: number = 30): Promise<any> {

        return new Promise<any>(async (resolve, reject) => {

            let queue = await this.channel.assertQueue('', { exclusive: true });
            let correlationId = Date.now().toString();
            let params: TRpcSenderParams = {
                channel: this.channel,
                queue: queue,
                correlationId: correlationId,
                timeout: responseTimeout || 30
            };

            await this.response(params, reply => {
                resolve(reply);
            });

            this.send(params, {
                cmd: cmd,
                body: body
            });
        });
    }

    private async response(params: TRpcSenderParams, cb: (data: Object) => any): Promise<void> {
        try {
            let timer = setTimeout(() => {
                cb(null);
                params.channel.deleteQueue(params.queue.queue);
            }, params.timeout * 1000);
            params.channel.consume(params.queue.queue, (msg) => {
                try {
                    if (msg && msg.properties.correlationId == params.correlationId) {
                        let data = JSON.parse(msg.content.toString());
                        cb(data);
                        clearTimeout(timer);
                        params.channel.deleteQueue(params.queue.queue);
                    }
                } catch (err) {
                    Logger.error("Rabbit.RpcSender.consume", err.stack);
                }
            }, { noAck: true });

        } catch (err) {
            Logger.error("Rabbit.RpcSender.response", err.stack);
        }
    }

    private send(params: TRpcSenderParams, msg: RpcMsg): void {
        try {
            params.channel.sendToQueue(this.queue,
                new Buffer(JSON.stringify(msg)),
                { correlationId: params.correlationId, replyTo: params.queue.queue });
        } catch (err) {
            Logger.error("Rabbit.RpcSender.send", err.stack);
        }
    }
}