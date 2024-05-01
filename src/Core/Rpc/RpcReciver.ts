import { MqChannel } from "../DatabaseRabbit";
import { Logger } from "../Logger";
import { RpcMsg } from "../Queues/RpcMsg";

export type RpcCallBack = (msg: any) => Promise<any>;

export interface IRpcReciver {
    subscribe(cmd: string, handler: RpcCallBack): void;
    listen(): void;
}

export class RpcReciver implements IRpcReciver {

    private channel: MqChannel;
    private queue: string;
    private subscribers: { [cmd: string]: RpcCallBack } = {};

    constructor(queue: string, mqChannel: MqChannel) {
        this.queue = queue;
        this.channel = mqChannel;
    }

    public subscribe(cmd: string, handler: RpcCallBack): void {
        this.subscribers[cmd] = handler;
    }

    public listen(): void {
        try {
            this.channel.assertQueue(this.queue, { durable: false });
            this.channel.prefetch(1);
            this.channel.consume(this.queue, async (msg) => {
                let replyData = {};
                try {
                    let data: RpcMsg = JSON.parse(msg.content.toString());
                    let callback = this.subscribers[data.cmd] || this.subscribers["default"];
                    replyData = await callback(data.body);
                } catch (err) {
                    Logger.error("Rabbit.RpcReciver.consume", err.stack);
                } finally {
                    let replyTo = msg.properties.replyTo;
                    let correlationId = msg.properties.correlationId;
                    this.channel.sendToQueue(replyTo,
                        new Buffer(JSON.stringify(replyData)),
                        { correlationId: correlationId });
                    this.channel.ack(msg);
                }
            });
        } catch (err) {
            Logger.error("Rabbit.RpcReciver.listen", err.stack);
        }
    }
}